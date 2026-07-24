import { createHash, timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

export const Route = createFileRoute("/api/webhooks/cakto")({
  server: {
    handlers: {
      POST: async ({ request }) => handleCaktoWebhook(request),
    },
  },
});

async function handleCaktoWebhook(request: Request) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY;
  if (!secret || !supabaseUrl || !supabaseSecret) {
    console.error("[Cakto] Variáveis de servidor não configuradas.");
    return Response.json({ error: "Integração não configurada" }, { status: 503 });
  }

  const rawBody = await request.text();
  const suppliedSecret = webhookSecretFrom(request);
  if (!suppliedSecret || !safeEqual(suppliedSecret, secret)) {
    return Response.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: JsonRecord;
  try {
    payload = JSON.parse(rawBody) as JsonRecord;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const eventType = eventTypeOf(payload);
  if (!eventType) return Response.json({ error: "Evento não identificado" }, { status: 400 });
  if (!["purchase_approved", "refund", "chargeback"].includes(eventType)) {
    return Response.json({ received: true, ignored: true });
  }

  const order = orderDataOf(payload);
  const orderId = textAt(order, "id", "order_id", "orderId") || textAt(payload, "order_id", "orderId");
  if (!orderId) return Response.json({ error: "Pedido não identificado" }, { status: 400 });

  const providerEventId =
    textAt(payload, "event_id", "eventId", "id") ||
    createHash("sha256").update(`${eventType}:${orderId}:${rawBody}`).digest("hex");
  const customer = objectAt(order, "customer") || objectAt(payload, "customer");
  const email = textAt(customer, "email") || textAt(order, "customer_email", "email");
  const product = objectAt(order, "product") || objectAt(payload, "product");
  const productId = textAt(product, "id", "product_id") || textAt(order, "product_id", "productId");

  const admin = createClient(supabaseUrl, supabaseSecret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: eventError } = await admin.from("webhook_events").insert({
    provider: "cakto",
    provider_event_id: providerEventId,
    event_type: eventType,
    payload,
  });
  if (eventError?.code === "23505") return Response.json({ received: true, duplicate: true });
  if (eventError) {
    console.error("[Cakto] Falha ao registrar evento:", eventError.message);
    return Response.json({ error: "Falha ao registrar evento" }, { status: 500 });
  }

  let processingError: string | undefined;
  if (eventType === "purchase_approved") {
    if (!email) processingError = "Compra aprovada sem e-mail do cliente";
    else {
      const { error } = await admin.rpc("upsert_cakto_entitlement", {
        p_customer_email: email,
        p_product_id: productId || null,
        p_order_id: orderId,
        p_purchased_at:
          textAt(order, "paid_at", "paidAt", "createdAt") || new Date().toISOString(),
        p_metadata: { event_id: providerEventId },
      });
      processingError = error?.message;
    }
  } else {
    const status = eventType === "refund" ? "refunded" : "chargeback";
    const { error } = await admin
      .from("entitlements")
      .update({ status, revoked_at: new Date().toISOString(), metadata: { event_id: providerEventId } })
      .eq("provider", "cakto")
      .eq("order_id", orderId);
    processingError = error?.message;
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString(), processing_error: processingError || null })
    .eq("provider", "cakto")
    .eq("provider_event_id", providerEventId);

  if (processingError) {
    console.error("[Cakto] Evento registrado, mas não processado:", processingError);
    return Response.json({ error: "Evento não processado" }, { status: 500 });
  }
  return Response.json({ received: true });
}

function webhookSecretFrom(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return (
    request.headers.get("x-cakto-secret") ||
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-api-secret")
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function eventTypeOf(payload: JsonRecord) {
  const event = textAt(payload, "event", "event_type", "eventType", "type");
  if (event) return event.toLowerCase();
  const data = objectAt(payload, "data");
  return textAt(data, "event", "event_type", "eventType", "type")?.toLowerCase();
}

function orderDataOf(payload: JsonRecord) {
  const data = objectAt(payload, "data");
  return objectAt(data, "order") || objectAt(payload, "order") || data || payload;
}

function objectAt(value: JsonRecord | undefined, key: string): JsonRecord | undefined {
  const candidate = value?.[key];
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as JsonRecord)
    : undefined;
}

function textAt(value: JsonRecord | undefined, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const candidate = value?.[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number") return String(candidate);
  }
  return undefined;
}
