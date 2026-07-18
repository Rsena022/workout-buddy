import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { UserProfile } from "@/types";
import { storage } from "@/utils/storage";
import { fetchAllExercises } from "@/services/exerciseApi";
import { selectExerciseLibrary } from "@/utils/library";
import { generateWorkoutPlan } from "@/utils/generateWorkout";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz de avaliação — Forjar" }, { name: "description", content: "Responda ao quiz para receber seu treino personalizado." }] }),
  component: QuizPage,
});

const EQUIPMENT_OPTIONS = [
  "dumbbell", "barbell", "cable", "bench", "band", "smith machine", "leverage machine", "sled machine", "body weight", "kettlebell",
];
const EQUIPMENT_LABELS: Record<string, string> = {
  dumbbell: "Halteres", barbell: "Barra", cable: "Polia", bench: "Banco", band: "Elásticos", "smith machine": "Máquina Smith",
  "leverage machine": "Máquinas", "sled machine": "Leg press", "body weight": "Peso corporal", kettlebell: "Kettlebell",
};

const LIMITATION_OPTIONS = ["Ombro", "Coluna", "Joelho", "Quadril", "Cotovelo", "Punho", "Tornozelo", "Pressão alta", "Problema cardíaco", "Outra"];
const PRIORITY_OPTIONS = ["Peitoral", "Costas", "Ombros", "Braços", "Pernas", "Glúteos", "Abdômen", "Panturrilhas"];

type Answers = Partial<UserProfile>;

const TOTAL_STEPS = 15;

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ equipment: [], limitations: [], priorities: [], hasLimitation: false });
  const [processing, setProcessing] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }
  function toggleArr(key: "equipment" | "limitations" | "priorities", value: string, max?: number) {
    setAnswers((a) => {
      const arr = (a[key] as string[]) || [];
      const has = arr.includes(value);
      let next = has ? arr.filter((v) => v !== value) : [...arr, value];
      if (max && next.length > max) next = next.slice(next.length - max);
      return { ...a, [key]: next };
    });
  }

  const skipEquipment = answers.location === "full_gym" || answers.location === "basic_gym" || answers.location === "home_no_equipment";

  function canContinue(): boolean {
    switch (step) {
      case 1: return !!answers.sex;
      case 2: return typeof answers.age === "number" && answers.age >= 16 && answers.age <= 100;
      case 3: return !!answers.heightCm && !!answers.weightKg && answers.heightCm! > 80 && answers.weightKg! > 25;
      case 4: return !!answers.goal;
      case 5: return !!answers.experience;
      case 6: return !!answers.location;
      case 7: return skipEquipment || (answers.equipment && answers.equipment.length > 0) || false;
      case 8: return !!answers.daysPerWeek;
      case 9: return !!answers.minutesPerSession;
      case 10: return answers.hasLimitation !== undefined && (!answers.hasLimitation || (answers.limitations || []).length > 0 || !!answers.limitationNotes);
      case 11: return true; // priorities optional
      case 12: return !!answers.includeCardio;
      case 13: return true;
      case 14: return !!answers.conditioning;
      case 15: return true;
      default: return false;
    }
  }

  function next() {
    if (!canContinue()) return;
    if (step === 6 && skipEquipment) { setStep(8); return; }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  }
  function back() {
    if (step === 8 && skipEquipment) { setStep(6); return; }
    if (step > 1) setStep(step - 1);
  }

  async function finish() {
    const profile = answers as UserProfile;
    storage.saveProfile(profile);
    const stages = [
      "Analisando seu objetivo...",
      "Selecionando os exercícios...",
      "Organizando os grupos musculares...",
      "Ajustando volume e intensidade...",
      "Finalizando seu plano...",
    ];
    setLoadError(null);
    setProcessing(stages[0]);
    try {
      const cached = storage.getLibrary();
      let library = cached && cached.length >= 300 ? cached : undefined;
      const stagePromise = (async () => {
        for (let i = 0; i < stages.length; i++) {
          setProcessing(stages[i]);
          await new Promise((r) => setTimeout(r, 500));
        }
      })();
      if (!library) {
        try {
          const all = await fetchAllExercises(350);
          if (all.length < 50) throw new Error(`API retornou apenas ${all.length} exercícios válidos`);
          library = selectExerciseLibrary(all, 350);
          storage.saveLibrary(library);
        } catch (apiErr) {
          console.error("[ExerciseDB] falha ao carregar da API:", apiErr);
          if (cached && cached.length > 0) {
            console.warn("[ExerciseDB] usando biblioteca local como fallback.");
            library = cached;
          } else {
            throw apiErr;
          }
        }
      }
      await stagePromise;
      const plan = generateWorkoutPlan(profile, library!);
      storage.savePlan(plan);
      storage.saveProgress({ completed: {}, updatedAt: new Date().toISOString() });
      navigate({ to: "/workout" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Quiz] erro ao gerar o treino:", err);
      setLoadError(msg);
    } finally {
      setProcessing(null);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="text-xl font-bold">Não foi possível carregar os exercícios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ocorreu um problema ao conectar com a base de exercícios. Verifique sua conexão e tente novamente.
          </p>
          <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground break-words">
            Detalhe técnico: {loadError}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => { setLoadError(null); finish(); }}
              className="rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold">
              Tentar novamente
            </button>
            <button onClick={() => { setLoadError(null); setStep(1); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm">
              Voltar ao quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
        <div className="w-full text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="text-lg font-semibold">{processing}</p>
          <p className="mt-2 text-sm text-muted-foreground">Preparando seu plano personalizado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Etapa {step} de {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {step === 1 && (
          <Q title="Qual é o seu sexo?">
            <Choices value={answers.sex} onChange={(v) => set("sex", v as UserProfile["sex"])} options={[
              { value: "male", label: "Masculino" },
              { value: "female", label: "Feminino" },
              { value: "not_informed", label: "Prefiro não informar" },
            ]} />
          </Q>
        )}
        {step === 2 && (
          <Q title="Qual é a sua idade?">
            <input type="number" min={16} max={100} value={answers.age ?? ""} onChange={(e) => set("age", Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg" placeholder="ex: 28" />
            {typeof answers.age === "number" && answers.age >= 16 && answers.age < 18 && (
              <p className="mt-3 rounded-lg bg-brand/10 p-3 text-sm text-brand">Menor de 18: recomendamos acompanhamento de um responsável e profissional.</p>
            )}
          </Q>
        )}
        {step === 3 && (
          <Q title="Qual é a sua altura e seu peso atual?">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-muted-foreground">Altura (cm)</span>
                <input type="number" value={answers.heightCm ?? ""} onChange={(e) => set("heightCm", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-4 py-3" placeholder="170" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-muted-foreground">Peso (kg)</span>
                <input type="number" value={answers.weightKg ?? ""} onChange={(e) => set("weightKg", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-4 py-3" placeholder="70" />
              </label>
            </div>
          </Q>
        )}
        {step === 4 && (
          <Q title="Qual é o seu principal objetivo?">
            <Choices value={answers.goal} onChange={(v) => set("goal", v as UserProfile["goal"])} options={[
              { value: "hypertrophy", label: "Ganhar massa muscular" },
              { value: "fat_loss", label: "Emagrecer" },
              { value: "recomposition", label: "Reduzir gordura e ganhar massa muscular" },
              { value: "strength", label: "Ganhar força" },
              { value: "conditioning", label: "Melhorar condicionamento" },
              { value: "health", label: "Saúde e qualidade de vida" },
            ]} />
          </Q>
        )}
        {step === 5 && (
          <Q title="Qual é a sua experiência com musculação?">
            <Choices value={answers.experience} onChange={(v) => set("experience", v as UserProfile["experience"])} options={[
              { value: "never_trained", label: "Nunca treinei" },
              { value: "returning", label: "Estou retornando após tempo parado" },
              { value: "under_six_months", label: "Menos de 6 meses" },
              { value: "six_to_twelve_months", label: "Entre 6 meses e 1 ano" },
              { value: "over_one_year", label: "Mais de 1 ano" },
            ]} />
          </Q>
        )}
        {step === 6 && (
          <Q title="Onde você realizará os treinos?">
            <Choices value={answers.location} onChange={(v) => set("location", v as UserProfile["location"])} options={[
              { value: "full_gym", label: "Academia completa" },
              { value: "basic_gym", label: "Academia básica" },
              { value: "home_equipment", label: "Em casa com equipamentos" },
              { value: "home_no_equipment", label: "Em casa sem equipamentos" },
            ]} />
          </Q>
        )}
        {step === 7 && !skipEquipment && (
          <Q title="Quais equipamentos você possui?" subtitle="Selecione todos que se aplicam.">
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button key={eq} type="button" onClick={() => toggleArr("equipment", eq)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${(answers.equipment || []).includes(eq) ? "border-brand bg-brand/10" : "border-border bg-background hover:bg-accent"}`}>
                  {EQUIPMENT_LABELS[eq] ?? eq}
                </button>
              ))}
            </div>
          </Q>
        )}
        {step === 8 && (
          <Q title="Quantos dias por semana você consegue treinar?">
            <Choices value={String(answers.daysPerWeek)} onChange={(v) => set("daysPerWeek", Number(v))} options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} dias` }))} />
          </Q>
        )}
        {step === 9 && (
          <Q title="Quanto tempo você possui para cada treino?">
            <Choices value={String(answers.minutesPerSession)} onChange={(v) => set("minutesPerSession", Number(v))} options={[
              { value: "30", label: "Até 30 minutos" },
              { value: "45", label: "Aproximadamente 45 minutos" },
              { value: "60", label: "Aproximadamente 60 minutos" },
              { value: "75", label: "Mais de 60 minutos" },
            ]} />
          </Q>
        )}
        {step === 10 && (
          <Q title="Você possui alguma lesão, dor ou limitação?">
            <Choices value={answers.hasLimitation === undefined ? undefined : answers.hasLimitation ? "yes" : "no"}
              onChange={(v) => set("hasLimitation", v === "yes")}
              options={[{ value: "no", label: "Não" }, { value: "yes", label: "Sim" }]} />
            {answers.hasLimitation && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {LIMITATION_OPTIONS.map((l) => (
                    <button key={l} type="button" onClick={() => toggleArr("limitations", l)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm ${(answers.limitations || []).includes(l) ? "border-brand bg-brand/10" : "border-border bg-background hover:bg-accent"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <textarea value={answers.limitationNotes ?? ""} onChange={(e) => set("limitationNotes", e.target.value)}
                  placeholder="Descreva brevemente sua limitação (opcional)" rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                <div className="rounded-lg bg-brand/10 p-3 text-sm text-brand">
                  Antes de iniciar o plano, procure a liberação de um profissional de saúde e a orientação presencial de um profissional de Educação Física.
                </div>
              </div>
            )}
          </Q>
        )}
        {step === 11 && (
          <Q title="Existe algum grupo muscular que você deseja priorizar?" subtitle="No máximo 2 opções.">
            <div className="grid grid-cols-2 gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button key={p} type="button" onClick={() => toggleArr("priorities", p, 2)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${(answers.priorities || []).includes(p) ? "border-brand bg-brand/10" : "border-border bg-background hover:bg-accent"}`}>
                  {p}
                </button>
              ))}
            </div>
          </Q>
        )}
        {step === 12 && (
          <Q title="Você deseja incluir exercícios aeróbicos?">
            <Choices value={answers.includeCardio} onChange={(v) => set("includeCardio", v as UserProfile["includeCardio"])} options={[
              { value: "yes", label: "Sim" }, { value: "no", label: "Não" }, { value: "recommended", label: "Apenas se recomendado" },
            ]} />
          </Q>
        )}
        {step === 13 && (
          <Q title="Existe algum exercício que você não pode ou não gosta de realizar?" subtitle="Opcional.">
            <textarea value={answers.dislikedExercises ?? ""} onChange={(e) => set("dislikedExercises", e.target.value)}
              rows={3} placeholder="ex: burpee, agachamento profundo"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
          </Q>
        )}
        {step === 14 && (
          <Q title="Como você classifica seu condicionamento físico atual?">
            <Choices value={answers.conditioning} onChange={(v) => set("conditioning", v as UserProfile["conditioning"])} options={[
              { value: "low", label: "Baixo" }, { value: "regular", label: "Regular" }, { value: "good", label: "Bom" }, { value: "very_good", label: "Muito bom" },
            ]} />
          </Q>
        )}
        {step === 15 && (
          <Q title="Alguma informação importante a considerar?" subtitle="Opcional.">
            <textarea value={answers.additionalNotes ?? ""} onChange={(e) => set("additionalNotes", e.target.value)}
              rows={4} placeholder="ex: rotina sedentária, retorno após período parado"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
          </Q>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={back} disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <button onClick={next} disabled={!canContinue()}
            className="inline-flex items-center gap-1.5 rounded-lg btn-brand px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
            {step === TOTAL_STEPS ? (<>Finalizar <Check className="h-4 w-4" /></>) : (<>Continuar <ArrowRight className="h-4 w-4" /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Q({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choices<T extends string>({ value, onChange, options }: { value?: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${value === o.value ? "border-brand bg-brand/10" : "border-border bg-background hover:bg-accent"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
