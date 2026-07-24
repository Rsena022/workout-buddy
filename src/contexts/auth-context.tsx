import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AccessStatus = "loading" | "active" | "inactive" | "unconfigured";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accessStatus: AccessStatus;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signUp: (name: string, email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(
    isSupabaseConfigured ? "loading" : "unconfigured",
  );

  const checkAccess = useCallback(async (nextSession: Session | null) => {
    if (!supabase || !nextSession?.user) {
      setAccessStatus(isSupabaseConfigured ? "inactive" : "unconfigured");
      return;
    }
    setAccessStatus("loading");
    const { data, error } = await supabase.rpc("has_active_entitlement");
    if (error) {
      console.error("[Auth] Não foi possível validar o acesso:", error.message);
      setAccessStatus("inactive");
      return;
    }
    setAccessStatus(data === true ? "active" : "inactive");
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      void checkAccess(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      void checkAccess(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [checkAccess]);

  async function signIn(email: string, password: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message;
  }

  async function signUp(name: string, email: string, password: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login?confirmed=1`
        : undefined;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo,
      },
    });
    return error?.message;
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccessStatus("inactive");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      accessStatus,
      signIn,
      signUp,
      signOut,
      refreshAccess: () => checkAccess(session),
    }),
    [session, loading, accessStatus, checkAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  return context;
}
