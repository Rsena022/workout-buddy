import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LockKeyhole, Mail, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    confirmed: hasSearchFlag(search.confirmed) ? true : undefined,
  }),
  head: () => ({ meta: [{ title: "Entrar — Forjar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, accessStatus, refreshAccess } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && accessStatus === "active") {
      void navigate({ to: "/workout" });
    }
  }, [user, accessStatus, navigate]);

  useEffect(() => {
    if (search.confirmed) {
      setMessage("Acesso confirmado com sucesso!");
    }
  }, [search.confirmed]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setSubmitting(true);
    setMessage(undefined);

    try {
      // 1. Chamar o servidor para validar se o e-mail possui compra ativa na Cakto
      const response = await fetch("/api/auth/buyer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        token_hash?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !data.token_hash) {
        setSubmitting(false);
        setMessage(
          data.error ||
            "Nenhuma compra ativa foi encontrada para este e-mail. Por favor, utilize o mesmo e-mail digitado no checkout da Cakto.",
        );
        return;
      }

      // 2. Com a compra confirmada pelo servidor, estabelece a sessão do usuário instantaneamente
      if (!supabase) {
        setSubmitting(false);
        setMessage("O serviço do Supabase não está configurado.");
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token_hash: data.token_hash,
        type: "magiclink",
      });

      if (verifyError) {
        console.error("[Login] Erro ao autenticar token:", verifyError.message);
        setSubmitting(false);
        setMessage("Não foi possível autenticar o acesso. Tente novamente.");
        return;
      }

      // 3. Força atualização do status de acesso e navega para o treino
      await refreshAccess();
      setSubmitting(false);
      void navigate({ to: "/workout" });
    } catch (err) {
      console.error("[Login] Falha ao processar login direto:", err);
      setSubmitting(false);
      setMessage("Ocorreu uma falha ao conectar com o servidor. Tente novamente.");
    }
  }

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <LockKeyhole className="h-3.5 w-3.5" /> Área exclusiva de alunos
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight">
          Seu treino e sua evolução, sempre com você.
        </h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Digite o mesmo e-mail utilizado na sua compra na Cakto para liberar seu acesso instantâneo.
        </p>
        <div className="mt-7 grid gap-3 text-sm">
          {[
            "Entrada instantânea sem precisar esperar e-mail",
            "Acesso liberado automaticamente pela compra na Cakto",
            "Treino personalizado salvo na nuvem",
            "Histórico de cargas e repetições",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-2">
            <Zap className="h-3.5 w-3.5" /> Entrar direto
          </div>
          <h2 className="text-2xl font-bold">Acessar meus treinos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe o e-mail utilizado no checkout para acessar imediatamente.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="text-sm font-semibold">
              E-mail da compra
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-11 w-full bg-transparent outline-none"
                />
              </div>
            </label>

            {message && (
              <div
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  message.includes("sucesso")
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-brand/30 bg-brand/10 text-foreground"
                }`}
              >
                {message}
              </div>
            )}

            <button
              disabled={submitting}
              className="mt-2 min-h-12 rounded-xl btn-brand px-5 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Validando compra e acessando...</span>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Entrar no Forjar</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground border-t border-border/60 pt-4">
          Dificuldade para acessar?{" "}
          <a className="text-brand underline" href="mailto:forjar.treino@gmail.com">
            Fale com o suporte
          </a>
          .
        </p>
        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

type LoginSearch = {
  confirmed?: boolean;
};

function hasSearchFlag(value: unknown) {
  return value === "1" || value === 1 || value === true;
}
