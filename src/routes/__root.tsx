import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <img src="/forjar-logo.png" alt="" className="h-9 w-9 object-contain" />
          Forjar
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">
            Início
          </Link>
          <Link
            to="/workout"
            className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Meu treino
          </Link>
          <Link to="/quiz" className="ml-2 rounded-md btn-brand px-4 py-2 font-semibold">
            Montar treino
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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
