import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    confirmed: hasSearchFlag(search.confirmed) ? true : undefined,
    reset: hasSearchFlag(search.reset) ? true : undefined,
  }),
  head: () => ({ meta: [{ title: "Entrar — Forjar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, accessStatus, signIn, signUp, requestPasswordReset, updatePassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(search.reset ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const resetRequested =
      search.reset ||
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("reset") === "1");

    if (resetRequested) setMode("reset");
  }, [search.reset]);

  useEffect(() => {
    const resetRequested =
      mode === "reset" ||
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("reset") === "1");

    if (!resetRequested && user && accessStatus === "active") {
      void navigate({ to: "/workout" });
    }
  }, [user, accessStatus, navigate, mode]);

  useEffect(() => {
    if (search.confirmed) {
      setMessage("E-mail confirmado com sucesso. Agora entre com sua senha.");
    }
  }, [search.confirmed]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(undefined);

    if (mode === "reset" && password !== passwordConfirmation) {
      setSubmitting(false);
      setMessage("As senhas não coincidem.");
      return;
    }

    const error =
      mode === "login"
        ? await signIn(email, password)
        : mode === "signup"
          ? await signUp(name, email, password)
          : mode === "forgot"
            ? await requestPasswordReset(email)
            : await updatePassword(password);

    setSubmitting(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }

    if (mode === "signup") {
      setMessage("Conta criada. Confira seu e-mail para confirmar o acesso e depois entre.");
      changeMode("login", false);
    } else if (mode === "forgot") {
      setMessage(
        "Enviamos as instruções de recuperação. Confira também as pastas Spam e Promoções.",
      );
    } else if (mode === "reset") {
      setMessage("Senha atualizada com sucesso. Você já pode continuar no Forjar.");
      changeMode("login", false);
    }
  }

  function changeMode(nextMode: AuthMode, clearMessage = true) {
    setMode(nextMode);
    setPassword("");
    setPasswordConfirmation("");
    setShowPassword(false);
    if (clearMessage) setMessage(undefined);
  }

  const isAccountMode = mode === "login" || mode === "signup";
  const isPasswordMode = mode === "login" || mode === "signup" || mode === "reset";

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
          Entre com o mesmo e-mail utilizado no checkout. Seu plano, cargas e histórico ficarão
          salvos na sua conta.
        </p>
        <div className="mt-7 grid gap-3 text-sm">
          {[
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
        {isAccountMode ? (
          <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`rounded-lg px-3 py-2 ${mode === "login" ? "bg-card shadow" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`rounded-lg px-3 py-2 ${mode === "signup" ? "bg-card shadow" : "text-muted-foreground"}`}
            >
              Criar conta
            </button>
          </div>
        ) : (
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">
              {mode === "forgot" ? "Recuperar senha" : "Crie uma nova senha"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "forgot"
                ? "Informe o e-mail usado na compra e enviaremos um link seguro."
                : "Digite uma nova senha com pelo menos 8 caracteres."}
            </p>
          </div>
        )}
        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "signup" && (
            <label className="text-sm font-semibold">
              Nome
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-h-11 w-full bg-transparent outline-none"
                />
              </div>
            </label>
          )}
          {mode !== "reset" && (
            <label className="text-sm font-semibold">
              E-mail da compra
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-11 w-full bg-transparent outline-none"
                />
              </div>
            </label>
          )}
          {isPasswordMode && (
            <label className="text-sm font-semibold">
              {mode === "reset" ? "Nova senha" : "Senha"}
              <div className="mt-2 flex items-center rounded-xl border border-border bg-background px-3">
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11 w-full bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="ml-2 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
          )}
          {mode === "reset" && (
            <label className="text-sm font-semibold">
              Confirmar nova senha
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 outline-none"
              />
            </label>
          )}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => changeMode("forgot")}
              className="-mt-2 justify-self-end text-sm font-semibold text-brand hover:underline"
            >
              Esqueci minha senha
            </button>
          )}
          {message && (
            <div className="rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm">
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
                  : mode === "forgot"
                    ? "Enviar link de recuperação"
                    : "Salvar nova senha"}
          </button>
        </form>
        {!isAccountMode && (
          <button
            type="button"
            onClick={() => changeMode("login")}
            className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Voltar para entrar
          </button>
        )}
        <p className="mt-5 text-center text-xs text-muted-foreground">
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

type AuthMode = "login" | "signup" | "forgot" | "reset";
type LoginSearch = {
  confirmed?: boolean;
  reset?: boolean;
};

function hasSearchFlag(value: unknown) {
  return value === "1" || value === 1 || value === true;
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
  if (normalized.includes("already registered")) return "Este e-mail já possui uma conta.";
  if (normalized.includes("same password"))
    return "A nova senha precisa ser diferente da senha atual.";
  if (normalized.includes("expired") || normalized.includes("invalid token"))
    return "Este link expirou. Solicite uma nova recuperação de senha.";
  if (normalized.includes("password")) return "Use uma senha com pelo menos 8 caracteres.";
  return "Não foi possível concluir. Confira os dados e tente novamente.";
}
