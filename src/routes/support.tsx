import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, LifeBuoy } from "lucide-react";
import { PaidAccessGate } from "@/components/paid-access-gate";
import { useAuth } from "@/contexts/auth-context";
import { submitSupportFeedback } from "@/services/cloudData";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Ajuda e suporte — Forjar" }] }),
  component: ProtectedSupportPage,
});

function ProtectedSupportPage() {
  return <PaidAccessGate><SupportPage /></PaidAccessGate>;
}

function SupportPage() {
  const { user, accessStatus } = useAuth();
  const [category, setCategory] = useState<"difficulty" | "exercise" | "plan" | "technical" | "other">("plan");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || accessStatus !== "active") return;
    setStatus("sending");
    try {
      await submitSupportFeedback(user.id, { category, rating, message });
      setMessage("");
      setStatus("sent");
    } catch (error) {
      console.error("[Support]", error);
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-9">
        <LifeBuoy className="h-10 w-10 text-brand" />
        <h1 className="mt-4 text-3xl font-bold">Como podemos melhorar seu treino?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Fale conosco antes de desistir do seu plano. Sua mensagem ajuda a ajustar o produto e nossa equipe responde pelo e-mail da conta.</p>
        <form onSubmit={submit} className="mt-7 grid gap-5">
          <label className="text-sm font-semibold">Assunto
            <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3">
              <option value="plan">Meu plano não parece adequado</option>
              <option value="difficulty">O treino está fácil ou difícil demais</option>
              <option value="exercise">Tenho dúvida sobre um exercício</option>
              <option value="technical">Problema técnico ou de acesso</option>
              <option value="other">Outro assunto</option>
            </select>
          </label>
          <label className="text-sm font-semibold">Como você avalia sua experiência até agora?
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3">
              <option value="5">5 — Muito boa</option><option value="4">4 — Boa</option><option value="3">3 — Regular</option><option value="2">2 — Ruim</option><option value="1">1 — Muito ruim</option>
            </select>
          </label>
          <label className="text-sm font-semibold">Conte o que aconteceu
            <textarea required minLength={10} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explique o que esperava e o que podemos ajustar..." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" />
          </label>
          {status === "sent" && <div className="flex items-center gap-2 rounded-xl bg-brand/10 p-3 text-sm text-brand"><CheckCircle2 className="h-4 w-4" />Mensagem enviada. Obrigado por nos ajudar a melhorar.</div>}
          {status === "error" && <div className="rounded-xl border border-destructive/30 p-3 text-sm">Não foi possível enviar agora. Escreva para <a href="mailto:forjar.treino@gmail.com" className="underline">forjar.treino@gmail.com</a>.</div>}
          <button disabled={status === "sending"} className="min-h-12 rounded-xl btn-brand px-5 font-semibold disabled:opacity-50">{status === "sending" ? "Enviando..." : "Enviar para o suporte"}</button>
        </form>
      </div>
    </div>
  );
}

