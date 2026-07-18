import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Repeat, Timer, Info, RefreshCw, Play, Pause, Plus, Download } from "lucide-react";
import type { WorkoutDay, WorkoutExercise, WorkoutPlan } from "@/types";
import { storage } from "@/utils/storage";
import { replaceExerciseInPlan } from "@/utils/generateWorkout";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Meu treino — Forjar" }, { name: "description", content: "Visualize e execute seu plano de treino personalizado." }] }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const hydrated = useHydrated();
  const [plan, setPlan] = useState<WorkoutPlan | undefined>();
  const [activeDay, setActiveDay] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [openDetail, setOpenDetail] = useState<WorkoutExercise | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setPlan(storage.getPlan());
    setCompleted(storage.getProgress().completed);
  }, [hydrated]);

  if (!hydrated) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Carregando...</div>;
  if (!plan) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Nenhum treino ainda</h2>
        <p className="mt-2 text-muted-foreground">Responda o quiz para gerar seu plano personalizado.</p>
        <Link to="/quiz" className="mt-6 inline-block rounded-xl btn-brand px-6 py-3 text-sm font-semibold">Fazer o quiz</Link>
      </div>
    );
  }

  const day = plan.days[activeDay];
  const dayKey = (ex: WorkoutExercise) => `${day.id}:${ex.exerciseId}`;

  function toggle(ex: WorkoutExercise) {
    const k = dayKey(ex);
    const next = { ...completed, [k]: !completed[k] };
    setCompleted(next);
    storage.saveProgress({ completed: next, updatedAt: new Date().toISOString() });
  }
  function resetDay() {
    const next = { ...completed };
    for (const ex of day.exercises) delete next[dayKey(ex)];
    setCompleted(next);
    storage.saveProgress({ completed: next, updatedAt: new Date().toISOString() });
  }
  function swap(ex: WorkoutExercise) {
    const library = storage.getLibrary();
    if (!library) { alert("Biblioteca de exercícios não disponível."); return; }
    const updated = replaceExerciseInPlan(plan!, day.id, ex.exerciseId, library);
    setPlan(updated);
    storage.savePlan(updated);
  }
  function restart() {
    if (!confirm("Refazer o quiz e criar um novo plano? Seu progresso será apagado.")) return;
    storage.clearPlan();
    location.href = "/quiz";
  }
  function downloadSpreadsheet() {
    if (!plan) return;
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: string[] = [];
    rows.push(["Dia", "Foco", "Ordem", "Exercício", "Nome original", "Grupo muscular", "Equipamento", "Séries", "Repetições", "Descanso (s)", "Padrão de movimento"].map(esc).join(";"));
    for (const d of plan.days) {
      for (const ex of d.exercises) {
        rows.push([
          d.name, d.focus, ex.order, ex.namePt, ex.originalName, ex.primaryMuscle,
          ex.equipment.join(", "), ex.sets, ex.repetitions, ex.restSeconds, ex.movementPattern,
        ].map(esc).join(";"));
      }
    }
    if (plan.cardio) {
      rows.push("");
      rows.push(["Cardio"].map(esc).join(";"));
      rows.push(["Frequência semanal", "Duração", "Intensidade", "Sugestões"].map(esc).join(";"));
      rows.push([`${plan.cardio.frequency}x`, plan.cardio.duration, plan.cardio.intensity, plan.cardio.suggestions.join(", ")].map(esc).join(";"));
    }
    // BOM so Excel detects UTF-8 accents correctly
    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treino-forjar-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const total = day.exercises.length;
  const done = day.exercises.filter((e) => completed[dayKey(e)]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu treino</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{plan.profileSummary}</p>
          <p className="mt-1 text-xs text-muted-foreground">Divisão: {plan.division}</p>
        </div>
        <button onClick={restart} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent">
          <RefreshCw className="h-4 w-4" /> Refazer quiz
        </button>
      </div>

      {plan.safetyMessages.length > 0 && (
        <div className="mb-6 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-sm text-foreground">
          {plan.safetyMessages.map((m, i) => (<p key={i} className={i > 0 ? "mt-2" : ""}>⚠ {m}</p>))}
        </div>
      )}

      {/* Day tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {plan.days.map((d, i) => (
          <button key={d.id} onClick={() => setActiveDay(i)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${i === activeDay ? "btn-brand" : "border border-border bg-card hover:bg-accent"}`}>
            {d.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">{day.name} • {day.focus}</span>
          <span className="text-muted-foreground">{done}/{total} concluídos • {pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        {done > 0 && (
          <button onClick={resetDay} className="mt-3 text-xs text-muted-foreground hover:text-foreground">Reiniciar sessão</button>
        )}
      </div>

      {/* Exercises */}
      <div className="grid gap-4">
        {day.exercises.map((ex) => (
          <ExerciseCard key={ex.exerciseId + ex.order} ex={ex} done={!!completed[dayKey(ex)]}
            onToggle={() => toggle(ex)} onSwap={() => swap(ex)} onOpen={() => setOpenDetail(ex)} />
        ))}
      </div>

      {plan.cardio && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Cardio</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.cardio.frequency}× por semana • {plan.cardio.duration} • Intensidade {plan.cardio.intensity.toLowerCase()}.
          </p>
          <p className="mt-2 text-sm">Sugestões: {plan.cardio.suggestions.join(", ")}.</p>
        </div>
      )}

      {openDetail && <ExerciseDetails ex={openDetail} onClose={() => setOpenDetail(null)} />}
    </div>
  );
}

function ExerciseCard({ ex, done, onToggle, onSwap, onOpen }: { ex: WorkoutExercise; done: boolean; onToggle: () => void; onSwap: () => void; onOpen: () => void }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition ${done ? "border-brand/60 opacity-75" : "border-border"}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
          {ex.gifUrl && imgOk ? (
            <img src={ex.gifUrl} alt={ex.namePt} loading="lazy" onError={() => setImgOk(false)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">Demonstração indisponível</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">#{ex.order} • {ex.primaryMuscle}</div>
              <h3 className="mt-0.5 text-lg font-bold leading-tight">{ex.namePt}</h3>
              <p className="text-xs text-muted-foreground">{ex.originalName}</p>
            </div>
            <button onClick={onToggle} aria-label="Marcar como concluído" className="shrink-0 text-brand">
              {done ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7 opacity-50" />}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Tag>{ex.sets} séries</Tag>
            <Tag>{ex.repetitions} reps</Tag>
            <Tag><Timer className="mr-1 inline h-3 w-3" />{ex.restSeconds}s</Tag>
            <Tag>{ex.equipment.join(", ")}</Tag>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent">
              <Info className="h-3.5 w-3.5" /> Detalhes
            </button>
            <button onClick={onSwap} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent">
              <Repeat className="h-3.5 w-3.5" /> Trocar exercício
            </button>
            <RestTimer seconds={ex.restSeconds} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-background px-2.5 py-1 font-medium">{children}</span>;
}

function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);
  const mm = Math.floor(remaining / 60).toString().padStart(1, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs">
      <button onClick={() => setRunning((r) => !r)} aria-label={running ? "Pausar" : "Iniciar cronômetro"} className="p-0.5">
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <span className="tabular-nums font-semibold">{mm}:{ss}</span>
      <button onClick={() => setRemaining((r) => r + 15)} aria-label="+15s" className="p-0.5"><Plus className="h-3.5 w-3.5" /></button>
      <button onClick={() => { setRunning(false); setRemaining(seconds); }} aria-label="Reiniciar" className="p-0.5"><RefreshCw className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function ExerciseDetails({ ex, onClose }: { ex: WorkoutExercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{ex.primaryMuscle} • {ex.movementPattern}</div>
            <h2 className="mt-1 text-2xl font-bold">{ex.namePt}</h2>
            <p className="text-sm text-muted-foreground">{ex.originalName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1 text-sm hover:bg-accent">Fechar</button>
        </div>
        {ex.gifUrl && (
          <img src={ex.gifUrl} alt={ex.namePt} className="mt-4 w-full rounded-xl bg-muted object-contain" />
        )}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <Stat label="Séries" value={String(ex.sets)} />
          <Stat label="Reps" value={ex.repetitions} />
          <Stat label="Descanso" value={`${ex.restSeconds}s`} />
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold">Equipamento</div>
          <div className="text-sm text-muted-foreground">{ex.equipment.join(", ")}</div>
        </div>
        {ex.secondaryMuscles.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-semibold">Músculos secundários</div>
            <div className="text-sm text-muted-foreground">{ex.secondaryMuscles.join(", ")}</div>
          </div>
        )}
        {ex.instructions.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold">Instruções</div>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {ex.instructions.map((s, i) => <li key={i}>{s.replace(/^Step:\d+\s*/i, "")}</li>)}
            </ol>
          </div>
        )}
        <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Comece com uma carga leve, priorize a execução correta e nunca treine sob dor articular.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-bold">{value}</div>
    </div>
  );
}
