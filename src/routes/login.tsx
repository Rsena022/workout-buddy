import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Forjar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, accessStatus, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && accessStatus === "active") void navigate({ to: "/workout" });
  }, [user, accessStatus, navigate]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("confirmed") === "1"
    ) {
      setMessage("E-mail confirmado com sucesso. Agora entre com sua senha.");
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(undefined);
    const error =
      mode === "login" ? await signIn(email, password) : await signUp(name, email, password);
    setSubmitting(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }
    if (mode === "signup") {
      setMessage("Conta criada. Confira seu e-mail para confirmar o acesso e depois entre.");
      setMode("login");
    }
  }

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <LockKeyhole className="h-3.5 w-3.5" /> Área exclusiva
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight">Seu treino e sua evolução, sempre com você.</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Entre com o mesmo e-mail utilizado no checkout. Seu plano, cargas e histórico ficarão salvos na sua conta.
        </p>
        <div className="mt-7 grid gap-3 text-sm">
          {["Treino personalizado salvo na nuvem", "Histórico de cargas e repetições", "Progressão orientada a cada sessão"].map((item) => (
            <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" />{item}</div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
          <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2 ${mode === "login" ? "bg-card shadow" : "text-muted-foreground"}`}>Entrar</button>
          <button type="button" onClick={() => setMode("signup")} className={`rounded-lg px-3 py-2 ${mode === "signup" ? "bg-card shadow" : "text-muted-foreground"}`}>Criar conta</button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "signup" && (
            <label className="text-sm font-semibold">Nome
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <input required value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 w-full bg-transparent outline-none" />
              </div>
            </label>
          )}
          <label className="text-sm font-semibold">E-mail da compra
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 w-full bg-transparent outline-none" />
            </div>
          </label>
          <label className="text-sm font-semibold">Senha
            <input required minLength={8} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 outline-none" />
          </label>
          {message && <div className="rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm">{message}</div>}
          <button disabled={submitting} className="mt-2 min-h-12 rounded-xl btn-brand px-5 font-semibold disabled:opacity-50">
            {submitting ? "Aguarde..." : mode === "login" ? "Entrar no Forjar" : "Criar minha conta"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Dificuldade para acessar? <a className="text-brand underline" href="mailto:forjar.treino@gmail.com">Fale com o suporte</a>.
        </p>
        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground underline">Voltar ao início</Link>
      </div>
    </div>
  );
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
  if (normalized.includes("already registered")) return "Este e-mail já possui uma conta.";
  if (normalized.includes("password")) return "Use uma senha com pelo menos 8 caracteres.";
  return "Não foi possível concluir. Confira os dados e tente novamente.";
}
