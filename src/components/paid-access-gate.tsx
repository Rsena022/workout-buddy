import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function PaidAccessGate({ children }: { children: ReactNode }) {
  const { user, loading, accessStatus, refreshAccess } = useAuth();

  if (loading || accessStatus === "loading") {
    return <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">Validando seu acesso...</div>;
  }

  if (accessStatus === "unconfigured") {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-brand" />
        <h1 className="mt-4 text-2xl font-bold">Entre para acessar seu treino</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use o mesmo e-mail informado na compra.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl btn-brand px-6 py-3 text-sm font-semibold">
          Entrar ou criar conta
        </Link>
      </div>
    );
  }

  if (accessStatus !== "active") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-brand" />
        <h1 className="mt-4 text-2xl font-bold">Compra não localizada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirme se sua conta usa o mesmo e-mail do checkout. Compras aprovadas podem levar alguns instantes para aparecer.
        </p>
        <button onClick={() => void refreshAccess()} className="mt-6 rounded-xl btn-brand px-6 py-3 text-sm font-semibold">
          Verificar novamente
        </button>
        <a href="mailto:forjar.treino@gmail.com" className="mt-4 block text-sm text-brand underline">
          Falar com o suporte
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
