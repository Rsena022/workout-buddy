import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/auth/buyer-login")({
  server: {
    handlers: {
      POST: async ({ request }) => handleBuyerLogin(request),
    },
  },
});

async function handleBuyerLogin(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecret) {
    console.error("[BuyerLogin] Variáveis de servidor SUPABASE_URL ou SUPABASE_SECRET_KEY não configuradas.");
    return Response.json(
      { error: "Serviço de autenticação temporariamente indisponível." },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return Response.json({ error: "Por favor, informe um e-mail válido." }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, supabaseSecret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verificar se o e-mail possui compra ativa na Cakto (entitlements)
  const { data: entitlement, error: entitlementError } = await admin
    .from("entitlements")
    .select("id, status")
    .eq("customer_email", email)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (entitlementError) {
    console.error("[BuyerLogin] Erro ao consultar permissão de compra:", entitlementError.message);
    return Response.json({ error: "Erro ao consultar permissão no sistema." }, { status: 500 });
  }

  if (!entitlement) {
    return Response.json(
      {
        error:
          "Nenhuma compra ativa foi encontrada para este e-mail. Por favor, utilize o mesmo e-mail digitado no checkout da Cakto.",
      },
      { status: 403 },
    );
  }

  // 2. Garantir que o usuário existe em auth.users
  const { data: usersData } = await admin.auth.admin.listUsers();
  let existingUser = usersData?.users.find((u) => u.email?.toLowerCase() === email);

  if (!existingUser) {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError || !newUser.user) {
      console.error("[BuyerLogin] Erro ao criar usuário:", createError?.message);
      return Response.json({ error: "Não foi possível preparar o acesso do usuário." }, { status: 500 });
    }
    existingUser = newUser.user;
  }

  // 3. Gerar link/token de acesso seguro via Admin API (sem depender de envio de e-mail SMTP)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    console.error("[BuyerLogin] Erro ao gerar token de acesso:", linkError?.message);
    return Response.json({ error: "Erro ao gerar chave de acesso direto." }, { status: 500 });
  }

  return Response.json({
    success: true,
    email,
    token_hash: linkData.properties.hashed_token,
  });
}
