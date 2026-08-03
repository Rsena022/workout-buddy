import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Palette, UserRound } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  applyTheme,
  getSavedTheme,
  saveTheme,
  THEME_LABELS,
  THEMES,
  type AppTheme,
} from "../utils/theme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">Página não encontrada.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md btn-brand px-5 py-2.5 text-sm font-semibold"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "root" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md btn-brand px-5 py-2.5 text-sm font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Forjar — Treinos personalizados de musculação" },
      {
        name: "description",
        content:
          "Responda ao quiz e receba um plano de musculação adaptado ao seu objetivo, experiência e rotina.",
      },
      { property: "og:title", content: "Forjar — Treinos personalizados" },
      {
        property: "og:description",
        content: "Plano de musculação básico gerado a partir do seu perfil.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://workout-buddy-delta-sand.vercel.app/forjar-social-card.png",
      },
      { property: "og:image:width", content: "1731" },
      { property: "og:image:height", content: "909" },
      { property: "og:image:alt", content: "Forjar — Treinos personalizados para você" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://workout-buddy-delta-sand.vercel.app/forjar-social-card.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/forjar-logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/forjar-logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("forjar-theme");if(["original","aurora","ocean","eclipse"].includes(t)){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==="original"||t==="eclipse"?"dark":"light"}}catch(e){}',
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemePicker() {
  const [theme, setTheme] = useState<AppTheme>("original");

  useEffect(() => {
    const saved = getSavedTheme();
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function changeTheme(next: AppTheme) {
    setTheme(next);
    saveTheme(next);
  }

  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-muted-foreground">
      <Palette className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
      <span className="sr-only">Tema visual</span>
      <select
        aria-label="Tema visual"
        value={theme}
        onChange={(event) => changeTheme(event.target.value as AppTheme)}
        className="theme-select max-w-24 bg-transparent text-xs font-semibold text-foreground outline-none sm:max-w-none"
      >
        {THEMES.map((value) => (
          <option key={value} value={value}>
            {THEME_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}

function SiteHeader() {
  const { user, accessStatus, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <img src="/forjar-logo.png" alt="" className="h-9 w-9 object-contain" />
          Forjar
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/workout"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Dumbbell className="h-3.5 w-3.5 text-brand" />
            <span className="hidden xs:inline">Meu treino</span>
          </Link>
          <Link
            to="/macro-calculator"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Apple className="h-3.5 w-3.5 text-emerald-400" />
            <span>Nutrição</span>
          </Link>
          <Link
            to="/support"
            className="hidden rounded-md px-3 py-2 text-muted-foreground hover:text-foreground lg:block"
          >
            Ajuda
          </Link>
          <ThemePicker />
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              title={user.email || "Sair"}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold"
            >
              <UserRound className="h-3.5 w-3.5 text-brand" />
              <span className="hidden sm:inline">{accessStatus === "active" ? "Minha conta" : "Conta"}</span>
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-1 hidden rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold sm:block"
            >
              Entrar
            </Link>
          )}
          <Link to="/quiz" className="ml-1 rounded-md btn-brand px-3 py-1.5 text-xs sm:text-sm font-semibold">
            Quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-3xl px-4">
        Os treinos apresentados possuem finalidade educativa e não substituem avaliação de um
        profissional de Educação Física. Em caso de dor, lesão ou condição médica, procure
        orientação profissional.
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
