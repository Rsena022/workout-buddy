import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Flame,
  PieChart,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Users,
  Utensils,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forjar — Treinos personalizados de musculação de alta performance" },
      {
        name: "description",
        content:
          "Responda ao quiz e receba um plano de musculação de elite adaptado ao seu objetivo, experiência e rotina.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Glow de Iluminação de Fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-brand/10 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand/10 blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Inteligência de Treino Adaptativa 2026</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                O treino certo para o seu corpo,{" "}
                <span className="bg-gradient-to-r from-brand via-brand/90 to-emerald-400 bg-clip-text text-transparent">
                  gerado para a sua rotina.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
                Responda a 15 perguntas simples e receba um plano de musculação sob medida para o seu objetivo, respeitando sua rotina, dias disponíveis e nível de experiência.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/quiz"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl btn-brand px-8 py-4 text-base font-bold shadow-xl shadow-brand/25 transition-all hover:scale-[1.02] hover:shadow-brand/40"
                >
                  <Play className="h-5 w-5 fill-current transition-transform group-hover:translate-x-0.5" />
                  <span>Montar meu treino personalizado</span>
                </Link>

                <Link
                  to="/workout"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-4 text-sm font-semibold transition-all hover:bg-accent hover:border-brand/40"
                >
                  <span>Já tenho uma conta / Meu treino</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>

              {/* Destaques Rápidos */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6">
                <div>
                  <div className="text-2xl font-bold font-display text-foreground">15</div>
                  <div className="text-xs text-muted-foreground font-medium">Perguntas precisas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-brand">100%</div>
                  <div className="text-xs text-muted-foreground font-medium">Personalizado</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-foreground">GIFs HD</div>
                  <div className="text-xs text-muted-foreground font-medium">Demonstração visual</div>
                </div>
              </div>
            </div>

            {/* Visual Mockup da Ficha de Treino */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow atrás do Card */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand to-emerald-500 opacity-30 blur-2xl transition duration-1000 group-hover:opacity-100" />

                <div className="relative rounded-3xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl">
                  {/* Topo do Mockup */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand font-bold">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-brand uppercase tracking-wider">Treino em Alta</div>
                        <h2 className="text-base font-bold">Ficha A — Peito & Tríceps</h2>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      45 min
                    </span>
                  </div>

                  {/* Exercícios demonstrativos na Ficha */}
                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Supino Reto com Barra", sets: "4 séries", reps: "8 a 10 reps", load: "32 kg cada lado" },
                      { name: "Supino Inclinado com Halteres", sets: "3 séries", reps: "10 a 12 reps", load: "24 kg" },
                      { name: "Tríceps Pulley na Corda", sets: "4 séries", reps: "12 a 15 reps", load: "25 kg" },
                    ].map((ex, idx) => (
                      <div
                        key={ex.name}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 font-bold text-brand text-[11px]">
                            0{idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">{ex.name}</div>
                            <div className="text-muted-foreground text-[11px]">{ex.sets} • {ex.reps}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] font-semibold text-brand">
                            {ex.load}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer do Mockup */}
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand/10 border border-brand/20 p-3 text-xs">
                    <div className="flex items-center gap-2 text-brand font-semibold">
                      <TrendingUp className="h-4 w-4" />
                      <span>Progressão recomendada ativada</span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">Cargas salvas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Recursos e Benefícios */}
      <section className="relative py-16 border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo o que você precisa para treinar com inteligência
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Desenvolvido para entregar o máximo de eficiência na academia ou em casa, sem fichas genéricas de gaveta.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Treino Personalizado",
                desc: "Estruturado estritamente a partir do seu nível de força, idade, objetivo e histórico médico.",
                tag: "Algoritmo Exclusivo",
              },
              {
                icon: Play,
                title: "Demonstrações em GIF HD",
                desc: "Aprenda a postura e a execução correta de cada exercício com tutoriais visuais simples.",
                tag: "Guias de Execução",
              },
              {
                icon: Timer,
                title: "Adaptado à sua Rotina",
                desc: "Treinos calculados para durar exatamente o tempo que você tem disponível no seu dia.",
                tag: "Flexibilidade Total",
              },
              {
                icon: ClipboardList,
                title: "Registro de Evolução",
                desc: "Salve suas cargas, repetições e acompanhe o aumento de força sessão a sessão.",
                tag: "Histórico Seguro",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="group relative rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/5"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand transition-transform group-hover:scale-110">
                  <b.icon className="h-6 w-6" />
                </div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-brand">
                  {b.tag}
                </span>
                <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Benefício Exclusivo: Módulo de Nutrição */}
      <section className="relative py-16 border-t border-border/50 bg-gradient-to-b from-brand/5 via-card/30 to-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-brand/30 bg-card/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-3.5 py-1.5 text-xs font-bold text-brand uppercase tracking-wider">
                  <Utensils className="h-3.5 w-3.5" />
                  <span>Benefício Exclusivo para Alunos</span>
                </div>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Calculadora Científica de{" "}
                  <span className="bg-gradient-to-r from-brand via-brand/90 to-emerald-400 bg-clip-text text-transparent">
                    Macronutrientes & Dieta
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Treinar sem a nutrição correta é apenas metade do caminho. Além da sua ficha personalizada de treinos, como assinante do Forjar você recebe acesso exclusivo à nossa **Calculadora Científica de Nutrição**.
                </p>
                <div className="mt-6 grid gap-3 text-xs sm:text-sm">
                  {[
                    "Meta exata de Proteínas (2.0g a 2.2g/kg) ajustada para seu peso e objetivo",
                    "Cálculo de Carboidratos e Gorduras com barras de progresso visuais",
                    "Sugestão de divisão automática em 4 refeições diárias",
                    "Guia com os melhores alimentos para hipertrofia ou emagrecimento",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    to="/quiz"
                    className="inline-flex items-center gap-2 rounded-2xl btn-brand px-6 py-3.5 text-sm font-bold shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02]"
                  >
                    <span>Garantir acesso completo no checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card da Nutrição */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Apple className="h-4 w-4 text-brand" />
                      <span className="text-xs font-bold text-foreground">Metas de Macronutrientes</span>
                    </div>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                      Painel do Aluno
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                      <div className="flex justify-between text-xs font-bold text-rose-400">
                        <span>Proteínas</span>
                        <span>160g / dia</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-rose-950/40 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-[80%]" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <div className="flex justify-between text-xs font-bold text-amber-400">
                        <span>Carboidratos</span>
                        <span>240g / dia</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-amber-950/40 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[65%]" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                      <div className="flex justify-between text-xs font-bold text-emerald-400">
                        <span>Gorduras Boas</span>
                        <span>68g / dia</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-emerald-950/40 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[50%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - Linha do Tempo */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Passo a Passo</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Como funciona o Forjar</h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Em menos de 3 minutos seu novo plano de treino estará pronto para ser executado.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3 relative">
            {[
              {
                step: "01",
                title: "Responda ao Quiz",
                desc: "Informações rápidas sobre seus objetivos (ganho de massa, definição, saúde), rotina e dias de treino.",
                icon: Activity,
              },
              {
                step: "02",
                title: "Receba o Plano Instantâneo",
                desc: "O sistema gera a divisão perfeita de sessões (ABC, ABCDE, Upper/Lower) ideal para a sua semana.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Execute e Evolua",
                desc: "Acesse a ficha no celular durante a sessão, registre suas cargas e acompanhe sua evolução.",
                icon: Flame,
              },
            ].map((s, index) => (
              <div
                key={s.step}
                className="relative flex flex-col rounded-3xl border border-border/80 bg-card/70 p-8 backdrop-blur-xl transition-all duration-300 hover:border-brand/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold font-display bg-gradient-to-r from-brand to-emerald-400 bg-clip-text text-transparent">
                    {s.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-brand">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-2xl btn-brand px-8 py-4 text-base font-bold shadow-xl shadow-brand/20 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="h-5 w-5" />
              <span>Começar agora mesmo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Depoimentos e Prova Social */}
      <section className="relative py-16 border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">Aprovado por quem busca resultados reais</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Lucas Andrade",
                role: "Treina 4x por semana",
                quote: "Minha rotina de trabalho é corrida. O Forjar organizou exatamente meus 45 minutos de academia sem enrolação.",
              },
              {
                name: "Mariana Santos",
                role: "Foco em Hipertrofia",
                quote: "Gostei muito das demonstrações dos exercícios. Deixei de ter dúvida na hora de executar o movimento correto.",
              },
              {
                name: "Rodrigo Mendes",
                role: "Iniciante na Musculação",
                quote: "Finalmente um treino que respeita meu nível e não me passa cargas absurdas logo no primeiro dia.",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-3xl border border-border/80 bg-card/70 p-6 backdrop-blur-xl">
                <p className="text-sm italic text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer / Aviso Legal */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-start gap-4 rounded-3xl border border-border/80 bg-card/40 p-6 text-sm text-muted-foreground backdrop-blur-md">
          <ShieldCheck className="h-6 w-6 text-brand shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground font-semibold">Orientações de Segurança:</strong> As fichas de treino geradas possuem caráter educativo e de acompanhamento pessoal. Elas não substituem a consulta ou acompanhamento presencial de um profissional de Educação Física ou médico.
          </p>
        </div>
      </section>
    </div>
  );
}
