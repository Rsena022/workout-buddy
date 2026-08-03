import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LockKeyhole, Mail, Send } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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
  const { user, accessStatus, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
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
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage(undefined);

    const error = await signInWithEmail(email);

    setSubmitting(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }

    setSentEmail(email.trim());
    setLinkSent(true);
  }

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <LockKeyhole className="h-3.5 w-3.5" /> Área exclusiva
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight">
          Seu treino e sua evolução, sempre com você.
        </h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Entre com o mesmo e-mail utilizado no checkout. Enviamos um link mágico de acesso para entrar instantaneamente sem senha.
        </p>
        <div className="mt-7 grid gap-3 text-sm">
          {[
            "Acesso rápido via link no e-mail",
            "Treino personalizado salvo na nuvem",
            "Histórico de cargas e repetições",
            "Progressão orientada a cada sessão",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        {linkSent ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Send className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Confira seu e-mail</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Enviamos um link mágico de acesso para <br />
              <strong className="text-foreground">{sentEmail}</strong>.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Abra seu e-mail e clique no link para acessar sua conta. Caso não encontre em alguns instantes, confira também a pasta de <strong>Spam</strong> ou <strong>Promoções</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setLinkSent(false);
                setMessage(undefined);
              }}
              className="mt-6 w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold hover:bg-muted"
            >
              Usar outro e-mail ou reenviar
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold">Acessar minha conta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe o e-mail cadastrado na compra para receber seu link direto de acesso.
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
                <div className="rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm">
                  {message}
                </div>
              )}

              <button
                disabled={submitting}
                className="mt-2 min-h-12 rounded-xl btn-brand px-5 font-semibold disabled:opacity-50"
              >
                {submitting ? "Enviando link..." : "Receber link de acesso"}
              </button>
            </form>
          </div>
        )}

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

function translateAuthError(rawError: unknown): string {
  const message = typeof rawError === "string" ? rawError : String(rawError);
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit") || normalized.includes("too many requests") || normalized.includes("once every")) {
    return "Muitas solicitações em pouco tempo. Aguarde 60 segundos e tente novamente.";
  }
  if (normalized.includes("invalid email")) return "Por favor, informe um e-mail válido.";
  if (normalized.includes("signups not allowed")) {
    return "Novos cadastros por Magic Link precisam estar ativos no Supabase (Authentication -> Providers -> Email -> Allow new users).";
  }
  if (normalized.includes("redirect url")) {
    return "A URL de redirecionamento precisa estar cadastrada nas Redirect URLs do Supabase.";
  }
  return message;
}
