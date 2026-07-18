import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Play, Target, Timer, ClipboardList, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forjar — Treinos personalizados de musculação" },
      { name: "description", content: "Responda ao quiz e receba um plano básico de musculação adaptado ao seu objetivo, experiência e rotina." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-brand" /> Plataforma de treinos básicos
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Seu treino, criado <br className="hidden sm:inline" />
            <span className="text-brand">para sua rotina.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Responda algumas perguntas e receba um plano básico de musculação adaptado ao seu objetivo, experiência e disponibilidade.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/quiz" className="inline-flex items-center gap-2 rounded-xl btn-brand px-7 py-3.5 text-base font-semibold shadow-lg shadow-brand/20">
              <Play className="h-4 w-4" /> Criar meu treino
            </Link>
            <Link to="/workout" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-accent">
              Meu treino
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, title: "Treino personalizado", desc: "Ajustado ao seu objetivo e experiência." },
            { icon: Play, title: "Exercícios com demonstração", desc: "Visualize GIFs de cada movimento." },
            { icon: Timer, title: "Adaptado à sua rotina", desc: "Respeita seus dias e tempo disponível." },
            { icon: ClipboardList, title: "Progresso salvo", desc: "Acompanhe séries e sessões concluídas." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Como funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", title: "Responda ao quiz", desc: "Contamos com respostas simples sobre seus objetivos e rotina." },
            { n: "02", title: "Receba seu plano", desc: "Um treino organizado por sessões e grupos musculares." },
            { n: "03", title: "Execute e acompanhe", desc: "Marque exercícios como concluídos e use o cronômetro." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-3xl font-bold text-brand">{s.n}</div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
          <Dumbbell className="mb-3 inline h-5 w-5 text-brand" />
          <p>Esta plataforma oferece orientações gerais de treino e não substitui a avaliação presencial de um profissional de Educação Física ou médico.</p>
        </div>
      </section>
    </div>
  );
}
