import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AccessStatus = "loading" | "active" | "inactive" | "unconfigured";
type AccessCheckOptions = {
  blocking?: boolean;
  force?: boolean;
};

const ACCESS_RESULT_FRESH_MS = 60_000;
const ACCESS_RECHECK_INTERVAL_MS = 5 * 60_000;
const DEFAULT_PUBLIC_SITE_URL = "https://forjar-treino-personalizado.vercel.app";

function publicSiteUrl() {
  const configuredSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const isLocalPreview =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const siteUrl = configuredSiteUrl || (isLocalPreview ? DEFAULT_PUBLIC_SITE_URL : currentOrigin);

  return (siteUrl || DEFAULT_PUBLIC_SITE_URL).replace(/\/+$/, "");
}

function authRedirectUrl(search = "") {
  const base = `${publicSiteUrl()}/login`;
  return search ? `${base}?${search}` : base;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accessStatus: AccessStatus;
  signInWithEmail: (email: string) => Promise<string | undefined>;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signUp: (name: string, email: string, password: string) => Promise<string | undefined>;
  requestPasswordReset: (email: string) => Promise<string | undefined>;
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
  const accessStatusRef = useRef<AccessStatus>(isSupabaseConfigured ? "loading" : "unconfigured");
  const currentUserIdRef = useRef<string | null>(null);
  const validatedUserIdRef = useRef<string | null>(null);
  const lastAccessCheckRef = useRef(0);
  const pendingAccessCheckRef = useRef<{
    userId: string;
    promise: Promise<void>;
  } | null>(null);

  const updateAccessStatus = useCallback((status: AccessStatus) => {
    accessStatusRef.current = status;
    setAccessStatus(status);
  }, []);

  const checkAccess = useCallback(
    async (
      nextSession: Session | null,
      { blocking = false, force = false }: AccessCheckOptions = {},
    ) => {
      if (!supabase || !nextSession?.user) {
        validatedUserIdRef.current = null;
        lastAccessCheckRef.current = 0;
        updateAccessStatus(isSupabaseConfigured ? "inactive" : "unconfigured");
        return;
      }

      const userId = nextSession.user.id;
      const now = Date.now();
      const hasFreshResult =
        validatedUserIdRef.current === userId &&
        now - lastAccessCheckRef.current < ACCESS_RESULT_FRESH_MS;

      if (!force && hasFreshResult) return;

      const pendingCheck = pendingAccessCheckRef.current;
      if (pendingCheck?.userId === userId) {
        await pendingCheck.promise;
        return;
      }

      if (blocking && accessStatusRef.current !== "active") {
        updateAccessStatus("loading");
      }

      const request = (async () => {
        try {
          const { data, error } = await supabase.rpc("has_active_entitlement");

          if (currentUserIdRef.current !== userId) return;

          if (error) {
            console.error("[Auth] Não foi possível validar o acesso:", error.message);
            if (accessStatusRef.current !== "active") {
              updateAccessStatus("inactive");
            }
            return;
          }

          validatedUserIdRef.current = userId;
          lastAccessCheckRef.current = Date.now();
          updateAccessStatus(data === true ? "active" : "inactive");
        } catch (error) {
          console.error("[Auth] Falha inesperada ao validar o acesso:", error);
          if (currentUserIdRef.current === userId && accessStatusRef.current !== "active") {
            updateAccessStatus("inactive");
          }
        } finally {
          if (pendingAccessCheckRef.current?.userId === userId) {
            pendingAccessCheckRef.current = null;
          }
        }
      })();

      pendingAccessCheckRef.current = { userId, promise: request };
      await request;
    },
    [updateAccessStatus],
  );

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      currentUserIdRef.current = data.session?.user.id ?? null;
      setSession(data.session);
      setLoading(false);
      void checkAccess(data.session, { blocking: true });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      currentUserIdRef.current = nextUserId;
      setSession(nextSession);
      setLoading(false);

      if (!nextUserId) {
        validatedUserIdRef.current = null;
        lastAccessCheckRef.current = 0;
        updateAccessStatus("inactive");
        return;
      }

      if (event === "TOKEN_REFRESHED") return;

      const userChanged = validatedUserIdRef.current !== nextUserId;
      void checkAccess(nextSession, {
        blocking: userChanged || accessStatusRef.current !== "active",
        force: event === "USER_UPDATED",
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [checkAccess, updateAccessStatus]);

  useEffect(() => {
    if (!supabase || !session?.user) return;

    const validateSilently = () => {
      void checkAccess(session, { force: true });
    };
    const intervalId = window.setInterval(validateSilently, ACCESS_RECHECK_INTERVAL_MS);
    const handleVisibilityChange = () => {
      const resultIsStale = Date.now() - lastAccessCheckRef.current >= ACCESS_RECHECK_INTERVAL_MS;
      if (document.visibilityState === "visible" && resultIsStale) {
        validateSilently();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAccess, session]);

  async function signInWithEmail(email: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: authRedirectUrl("confirmed=1"),
      },
    });
    if (error) {
      console.error("[Auth] signInWithOtp error:", error);
      const detail = error.message || error.name || (typeof error === "object" ? JSON.stringify(error) : String(error));
      const code = error.status ? ` [Erro ${error.status}]` : "";
      return `${detail}${code}`;
    }
    return undefined;
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error?.message;
  }

  async function signUp(name: string, email: string, password: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: authRedirectUrl("confirmed=1"),
      },
    });
    return error?.message;
  }

  async function requestPasswordReset(email: string) {
    if (!supabase) return "O sistema de contas ainda não foi configurado.";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl("reset=1"),
    });
    return error?.message;
  }

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    updateAccessStatus("inactive");
  }, [updateAccessStatus]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      accessStatus,
      signInWithEmail,
      signIn,
      signUp,
      requestPasswordReset,
      signOut,
      refreshAccess: () =>
        checkAccess(session, {
          blocking: accessStatusRef.current !== "active",
          force: true,
        }),
    }),
    [session, loading, accessStatus, checkAccess, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  return context;
}
