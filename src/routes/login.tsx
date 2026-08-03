import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Send, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    confirmed: hasSearchFlag(search.confirmed) ? true : undefined,
    reset: hasSearchFlag(search.reset) ? true : undefined,
  }),
  head: () => ({ meta: [{ title: "Entrar — Forjar" }] }),
  component: LoginPage,
});

type AuthMode = "magic" | "login" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, accessStatus, signInWithEmail, signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setMessage("Acesso confirmado com sucesso! Faça seu login.");
    }
  }, [search.confirmed]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage(undefined);

    let error: string | undefined;

    if (mode === "magic") {
      error = await signInWithEmail(email);
      if (!error) {
        setSentEmail(email.trim());
        setLinkSent(true);
      }
    } else if (mode === "login") {
      error = await signIn(email, password);
    } else if (mode === "signup") {
      error = await signUp(name, email, password);
      if (!error) {
        setMessage("Conta criada com sucesso! Confira seu e-mail para confirmar a conta e depois faça o login.");
        setMode("login");
      }
    } else if (mode === "forgot") {
      error = await requestPasswordReset(email);
      if (!error) {
        setMessage("Enviamos as instruções de recuperação para o seu e-mail.");
      }
    }

    setSubmitting(false);
    if (error) {
      setMessage(translateAuthError(error));
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(undefined);
    setLinkSent(false);
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
          Entre com o mesmo e-mail utilizado na sua compra. Seu plano, cargas e histórico de treinos ficam salvos em segurança.
        </p>
        <div className="mt-7 grid gap-3 text-sm">
          {[
            "Entrada por senha ou link no e-mail",
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
        {/* Navegação entre modos */}
        {mode !== "forgot" && !linkSent && (
          <div className="grid grid-cols-3 rounded-xl bg-muted p-1 text-xs sm:text-sm font-semibold mb-6">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`rounded-lg px-2 py-2 text-center transition ${mode === "login" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`rounded-lg px-2 py-2 text-center transition ${mode === "signup" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => changeMode("magic")}
              className={`rounded-lg px-2 py-2 text-center transition ${mode === "magic" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            >
              Link Mágico
            </button>
          </div>
        )}

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
              Abra seu e-mail e clique no link para acessar sua conta. Caso não encontre em alguns instantes, confira a pasta de <strong>Spam</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setLinkSent(false);
                setMessage(undefined);
              }}
              className="mt-6 w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold hover:bg-muted"
            >
              Voltar ou tentar outro método
            </button>
          </div>
        ) : (
          <div>
            {mode === "forgot" && (
              <div className="mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand mb-3">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold">Recuperar senha</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Digite seu e-mail para receber as instruções de redefinição de senha.
                </p>
              </div>
            )}

            <form onSubmit={submit} className="grid gap-4">
              {mode === "signup" && (
                <label className="text-sm font-semibold">
                  Nome
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      placeholder="Seu nome"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="min-h-11 w-full bg-transparent outline-none"
                    />
                  </div>
                </label>
              )}

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

              {(mode === "login" || mode === "signup") && (
                <label className="text-sm font-semibold">
                  Senha
                  <div className="mt-2 flex items-center rounded-xl border border-border bg-background px-3">
                    <input
                      required
                      minLength={6}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-h-11 w-full bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ml-2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="-mt-1 text-right text-xs font-semibold text-brand hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}

              {message && (
                <div className="rounded-xl border border-brand/25 bg-brand/10 p-3 text-xs leading-relaxed">
                  {message}
                </div>
              )}

              <button
                disabled={submitting}
                className="mt-2 min-h-12 rounded-xl btn-brand px-5 font-semibold disabled:opacity-50"
              >
                {submitting
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar no Forjar"
                    : mode === "signup"
                      ? "Criar minha conta"
                      : mode === "magic"
                        ? "Receber link por e-mail"
                        : "Enviar recuperação"}
              </button>
            </form>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Voltar para o login
              </button>
            )}
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
  reset?: boolean;
};

function hasSearchFlag(value: unknown) {
  return value === "1" || value === 1 || value === true;
}

function translateAuthError(rawError: unknown): string {
  const message = typeof rawError === "string" ? rawError : String(rawError);
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("already registered")) return "Este e-mail já possui uma conta cadastrada. Clique na aba 'Entrar'.";
  if (normalized.includes("rate limit") || normalized.includes("too many requests") || normalized.includes("once every")) {
    return "Muitas solicitações em pouco tempo. Aguarde um momento e tente novamente.";
  }
  if (normalized.includes("invalid email")) return "Por favor, informe um e-mail válido.";
  return message;
}
