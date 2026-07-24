import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Repeat,
  Timer,
  Info,
  RefreshCw,
  Play,
  Pause,
  Plus,
  Download,
  Save,
} from "lucide-react";
import type {
  Exercise,
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSetPerformance,
} from "@/types";
import { storage } from "@/utils/storage";
import { replaceExerciseInPlan, replacementCandidates } from "@/utils/generateWorkout";
import { useHydrated } from "@/lib/use-hydrated";
import { exerciseGifCandidates } from "@/utils/exerciseMedia";
import {
  portugueseInstructions,
  translateExerciseName,
  translateMuscle,
} from "@/data/translations";
import { progressionSuggestion } from "@/utils/progression";
import { PaidAccessGate } from "@/components/paid-access-gate";
import { useAuth } from "@/contexts/auth-context";
import {
  loadActivePlan,
  loadRecentSessions,
  saveCompletedSession,
  saveProfileAndPlan,
} from "@/services/cloudData";

export const Route = createFileRoute("/workout")({
  head: () => ({
    meta: [
      { title: "Meu treino — Forjar" },
      { name: "description", content: "Visualize e execute seu plano de treino personalizado." },
    ],
  }),
  component: ProtectedWorkoutPage,
});

function ProtectedWorkoutPage() {
  return <PaidAccessGate><WorkoutPage /></PaidAccessGate>;
}

function WorkoutPage() {
  const hydrated = useHydrated();
  const { user, accessStatus } = useAuth();
  const [plan, setPlan] = useState<WorkoutPlan | undefined>();
  const [activeDay, setActiveDay] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [openDetail, setOpenDetail] = useState<WorkoutExercise | null>(null);
  const [replacementTarget, setReplacementTarget] = useState<WorkoutExercise | null>(null);
  const [replacementOptions, setReplacementOptions] = useState<Exercise[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | undefined>();
  const [sessionEffort, setSessionEffort] = useState(7);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionHistory, setSessionHistory] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    setPlan(storage.getPlan());
    setCompleted(storage.getProgress().completed);
    setActiveSession(storage.getActiveSession());
    setSessionHistory(storage.getSessions());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !user || accessStatus !== "active") return;
    let cancelled = false;
    Promise.all([loadActivePlan(user.id), loadRecentSessions(user.id)])
      .then(([cloudPlan, cloudSessions]) => {
        if (cancelled) return;
        const localPlan = storage.getPlan();
        if (cloudPlan) {
          setPlan(cloudPlan);
          storage.savePlan(cloudPlan);
        } else if (localPlan) {
          void saveProfileAndPlan(user.id, localPlan.profile, localPlan).catch((error) =>
            console.error("[Cloud] Falha ao importar o plano local:", error),
          );
        }
        if (cloudSessions.length) setSessionHistory(cloudSessions);
      })
      .catch((error) => console.error("[Cloud] Falha ao carregar dados:", error));
    return () => {
      cancelled = true;
    };
  }, [hydrated, user, accessStatus]);

  if (!hydrated)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Carregando...
      </div>
    );
  if (!plan) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Nenhum treino ainda</h2>
        <p className="mt-2 text-muted-foreground">
          Responda o quiz para gerar seu plano personalizado.
        </p>
        <Link
          to="/quiz"
          className="mt-6 inline-block rounded-xl btn-brand px-6 py-3 text-sm font-semibold"
        >
          Fazer o quiz
        </Link>
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
    if (!library) {
      alert("Biblioteca de exercícios não disponível.");
      return;
    }
    const options = replacementCandidates(plan!, day.id, ex.exerciseId, library, 3);
    if (!options.length) {
      alert("Não encontramos outra opção compatível com seu perfil e equipamentos.");
      return;
    }
    setReplacementTarget(ex);
    setReplacementOptions(options);
  }

  function chooseReplacement(replacement: Exercise) {
    if (!replacementTarget) return;
    const library = storage.getLibrary();
    if (!library) return;
    const updated = replaceExerciseInPlan(
      plan!,
      day.id,
      replacementTarget.exerciseId,
      library,
      replacement.exerciseId,
    );
    setPlan(updated);
    storage.savePlan(updated);
    setReplacementTarget(null);
    setReplacementOptions([]);
  }
  function restart() {
    if (!confirm("Refazer o quiz e criar um novo plano? Seu progresso será apagado.")) return;
    storage.clearPlan();
    location.href = "/quiz";
  }

  function startTraining() {
    const session = storage.startSession(plan!, day);
    setActiveSession(session);
  }

  function updateSet(
    exerciseId: string,
    setNumber: number,
    patch: Partial<WorkoutSetPerformance>,
  ) {
    if (!activeSession) return;
    const next = {
      ...activeSession,
      exercises: activeSession.exercises.map((exercise) =>
        exercise.exerciseId !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.setNumber === setNumber ? { ...set, ...patch } : set,
              ),
            },
      ),
    };
    setActiveSession(next);
    storage.saveActiveSession(next);
  }

  function finishTraining() {
    if (!activeSession) return;
    const finalized = storage.completeSession({
      ...activeSession,
      perceivedEffort: sessionEffort,
      notes: sessionNotes.trim() || undefined,
    });
    const nextCompleted = { ...completed };
    for (const exercise of day.exercises) nextCompleted[dayKey(exercise)] = true;
    setCompleted(nextCompleted);
    storage.saveProgress({ completed: nextCompleted, updatedAt: new Date().toISOString() });
    setSessionHistory((current) => [finalized, ...current.filter((item) => item.id !== finalized.id)]);
    if (user && accessStatus === "active") {
      void saveCompletedSession(user.id, finalized).catch((error) =>
        console.error("[Cloud] Falha ao salvar sessão:", error),
      );
    }
    setActiveSession(undefined);
    setSessionNotes("");
    setSessionEffort(7);
  }
  function downloadSpreadsheet() {
    if (!plan) return;
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: string[] = [];
    rows.push(
      [
        "Dia",
        "Foco",
        "Ordem",
        "Exercício",
        "Nome original",
        "Grupo muscular",
        "Equipamento",
        "Séries",
        "Repetições",
        "Descanso (s)",
        "Padrão de movimento",
      ]
        .map(esc)
        .join(";"),
    );
    for (const d of plan.days) {
      for (const ex of d.exercises) {
        rows.push(
          [
            d.name,
            d.focus,
            ex.order,
            translateExerciseName(ex.originalName),
            ex.originalName,
            ex.primaryMuscle,
            ex.equipment.join(", "),
            ex.sets,
            ex.repetitions,
            ex.restSeconds,
            ex.movementPattern,
          ]
            .map(esc)
            .join(";"),
        );
      }
    }
    if (plan.cardio) {
      rows.push("");
      rows.push(["Cardio"].map(esc).join(";"));
      rows.push(["Frequência semanal", "Duração", "Intensidade", "Sugestões"].map(esc).join(";"));
      rows.push(
        [
          `${plan.cardio.frequency}x`,
          plan.cardio.duration,
          plan.cardio.intensity,
          plan.cardio.suggestions.join(", "),
        ]
          .map(esc)
          .join(";"),
      );
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
  const currentSession = activeSession?.dayId === day.id ? activeSession : undefined;
  const completedSessionSets = currentSession
    ? currentSession.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed)
        .length
    : 0;
  const totalSessionSets = currentSession
    ? currentSession.exercises.flatMap((exercise) => exercise.sets).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu treino</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{plan.profileSummary}</p>
          <p className="mt-1 text-xs text-muted-foreground">Divisão: {plan.division}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadSpreadsheet}
            className="inline-flex items-center gap-2 rounded-lg btn-brand px-4 py-2 text-sm font-semibold"
          >
            <Download className="h-4 w-4" /> Baixar planilha
          </button>
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" /> Refazer quiz
          </button>
        </div>
      </div>

      {plan.safetyMessages.length > 0 && (
        <div className="mb-6 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-sm text-foreground">
          {plan.safetyMessages.map((m, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              ⚠ {m}
            </p>
          ))}
        </div>
      )}

      {/* Day tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {plan.days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(i)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${i === activeDay ? "btn-brand" : "border border-border bg-card hover:bg-accent"}`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">
            {day.name} • {day.focus}
          </span>
          <span className="text-muted-foreground">
            {done}/{total} concluídos • {pct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        {done > 0 && (
          <button
            onClick={resetDay}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Reiniciar sessão
          </button>
        )}
        {!currentSession && (
          <button
            onClick={startTraining}
            className="mt-4 inline-flex items-center gap-2 rounded-lg btn-brand px-4 py-2 text-sm font-semibold"
          >
            <Play className="h-4 w-4" /> Iniciar treino de hoje
          </button>
        )}
        {currentSession && (
          <p className="mt-3 text-xs font-semibold text-brand">
            Sessão em andamento • {completedSessionSets}/{totalSessionSets} séries registradas
          </p>
        )}
      </div>

      {/* Exercises */}
      <div className="grid gap-4">
        {day.exercises.map((ex) => (
          <ExerciseCard
            key={ex.exerciseId + ex.order}
            ex={ex}
            done={!!completed[dayKey(ex)]}
            onToggle={() => toggle(ex)}
            onSwap={() => swap(ex)}
            onOpen={() => setOpenDetail(ex)}
            performance={currentSession?.exercises.find(
              (performance) => performance.exerciseId === ex.exerciseId,
            )?.sets}
            onSetUpdate={(setNumber, patch) => updateSet(ex.exerciseId, setNumber, patch)}
          />
        ))}
      </div>

      {currentSession && (
        <div className="mt-8 rounded-2xl border border-brand/35 bg-card p-6">
          <h3 className="text-lg font-bold">Concluir sessão</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre como o treino foi para acompanhar sua evolução e melhorar as próximas sessões.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
            <label className="text-sm font-semibold">
              Esforço percebido
              <select
                value={sessionEffort}
                onChange={(event) => setSessionEffort(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}/10
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Observações
              <textarea
                value={sessionNotes}
                onChange={(event) => setSessionNotes(event.target.value)}
                rows={2}
                placeholder="Ex.: carga leve, desconforto, exercício difícil..."
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
              />
            </label>
          </div>
          <button
            onClick={finishTraining}
            disabled={completedSessionSets === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-lg btn-brand px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> Salvar e concluir treino
          </button>
        </div>
      )}

      {!!plan.personalConsiderations?.length && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm">
          <strong>Considerações do seu perfil</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {plan.personalConsiderations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {plan.program && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">Seu ciclo de {plan.program.durationWeeks} semanas</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Progressão dupla: primeiro aumente repetições com boa técnica; depois aumente a carga.
              </p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              Plano progressivo
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {plan.program.weeklyGuidance.map((guidance, index) => (
              <div key={guidance} className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Semana {index + 1}</strong>
                <p className="mt-1">{guidance.replace(/^Semana \d+:\s*/, "")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.cardio && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Cardio</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.cardio.frequency}× por semana • {plan.cardio.duration} • Intensidade{" "}
            {plan.cardio.intensity.toLowerCase()}.
          </p>
          <p className="mt-2 text-sm">Sugestões: {plan.cardio.suggestions.join(", ")}.</p>
        </div>
      )}

      {sessionHistory.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Histórico recente</h3>
          <div className="mt-4 grid gap-2">
            {sessionHistory.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm"
              >
                <div>
                  <strong>{session.dayName}</strong>
                  <div className="text-xs text-muted-foreground">
                    {new Date(session.completedAt || session.startedAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Esforço {session.perceivedEffort ?? "—"}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {openDetail && <ExerciseDetails ex={openDetail} onClose={() => setOpenDetail(null)} />}
      {replacementTarget && (
        <ReplacementDialog
          current={replacementTarget}
          options={replacementOptions}
          onChoose={chooseReplacement}
          onClose={() => setReplacementTarget(null)}
        />
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  done,
  onToggle,
  onSwap,
  onOpen,
  performance,
  onSetUpdate,
}: {
  ex: WorkoutExercise;
  done: boolean;
  onToggle: () => void;
  onSwap: () => void;
  onOpen: () => void;
  performance?: WorkoutSetPerformance[];
  onSetUpdate: (setNumber: number, patch: Partial<WorkoutSetPerformance>) => void;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card transition hover:border-brand/60 focus-within:border-brand/60 ${done ? "border-brand/60 opacity-75" : "border-border"}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Abrir detalhes de ${translateExerciseName(ex.originalName)}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
      />
      <div className="pointer-events-none relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
          <ExerciseGif ex={ex} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                #{ex.order} • {ex.primaryMuscle}
              </div>
              <h3 className="mt-0.5 text-lg font-bold leading-tight">
                {translateExerciseName(ex.originalName)}
              </h3>
            </div>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Marcar como concluído"
              className="pointer-events-auto shrink-0 text-brand"
            >
              {done ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <Circle className="h-7 w-7 opacity-50" />
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Tag>{ex.sets} séries</Tag>
            <Tag>{ex.repetitions} reps</Tag>
            <Tag>
              <Timer className="mr-1 inline h-3 w-3" />
              {ex.restSeconds}s
            </Tag>
            <Tag>{ex.equipment.join(", ")}</Tag>
          </div>
          <div className="pointer-events-auto mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              <Info className="h-3.5 w-3.5" /> Detalhes
            </button>
            <button
              type="button"
              onClick={onSwap}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              <Repeat className="h-3.5 w-3.5" /> Trocar exercício
            </button>
            <RestTimer seconds={ex.restSeconds} />
          </div>
          {performance && (
            <SetLogger exercise={ex} sets={performance} onUpdate={onSetUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReplacementDialog({
  current,
  options,
  onChoose,
  onClose,
}: {
  current: WorkoutExercise;
  options: Exercise[];
  onChoose: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs text-muted-foreground">Substituir</p><h2 className="text-xl font-bold">{current.namePt}</h2></div>
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-sm">Fechar</button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Estas opções respeitam o mesmo grupo muscular, seus equipamentos e as limitações informadas.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {options.map((exercise) => (
            <button key={exercise.exerciseId} onClick={() => onChoose(exercise)} className="overflow-hidden rounded-xl border border-border bg-background text-left transition hover:border-brand">
              <img src={exercise.gifUrl} alt="" className="h-36 w-full bg-muted object-cover" loading="lazy" referrerPolicy="no-referrer" />
              <span className="block p-3 text-sm font-semibold">{translateExerciseName(exercise.name)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetLogger({
  exercise,
  sets,
  onUpdate,
}: {
  exercise: WorkoutExercise;
  sets: WorkoutSetPerformance[];
  onUpdate: (setNumber: number, patch: Partial<WorkoutSetPerformance>) => void;
}) {
  const suggestion = progressionSuggestion(exercise, sets);
  return (
    <div className="pointer-events-auto mt-4 rounded-xl border border-border bg-background p-3">
      <div className="grid grid-cols-[38px_1fr_1fr_1fr_34px] gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Série</span><span>Carga kg</span><span>Reps</span><span>RIR</span><span>Feita</span>
      </div>
      <div className="mt-2 grid gap-2">
        {sets.map((set) => (
          <div key={set.setNumber} className="grid grid-cols-[38px_1fr_1fr_1fr_34px] items-center gap-2">
            <strong className="text-center text-xs">{set.setNumber}</strong>
            <input
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              aria-label={`Carga da série ${set.setNumber}`}
              value={set.weightKg ?? ""}
              onChange={(event) => onUpdate(set.setNumber, { weightKg: event.target.value === "" ? undefined : Number(event.target.value) })}
              className="min-w-0 rounded-md border border-border bg-card px-2 py-1.5 text-center text-xs"
            />
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label={`Repetições da série ${set.setNumber}`}
              value={set.repetitions ?? ""}
              onChange={(event) => onUpdate(set.setNumber, { repetitions: event.target.value === "" ? undefined : Number(event.target.value) })}
              className="min-w-0 rounded-md border border-border bg-card px-2 py-1.5 text-center text-xs"
            />
            <input
              type="number"
              min="0"
              max="10"
              inputMode="numeric"
              aria-label={`Repetições em reserva da série ${set.setNumber}`}
              value={set.rir ?? ""}
              onChange={(event) => onUpdate(set.setNumber, { rir: event.target.value === "" ? undefined : Number(event.target.value) })}
              className="min-w-0 rounded-md border border-border bg-card px-2 py-1.5 text-center text-xs"
            />
            <input
              type="checkbox"
              aria-label={`Concluir série ${set.setNumber}`}
              checked={set.completed}
              onChange={(event) => onUpdate(set.setNumber, { completed: event.target.checked })}
              className="mx-auto h-5 w-5 accent-[var(--color-brand)]"
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{suggestion.message}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-background px-2.5 py-1 font-medium">
      {children}
    </span>
  );
}

function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);
  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(1, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs">
      <button
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? "Pausar" : "Iniciar cronômetro"}
        className="p-0.5"
      >
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <span className="tabular-nums font-semibold">
        {mm}:{ss}
      </span>
      <button onClick={() => setRemaining((r) => r + 15)} aria-label="+15s" className="p-0.5">
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => {
          setRunning(false);
          setRemaining(seconds);
        }}
        aria-label="Reiniciar"
        className="p-0.5"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ExerciseDetails({ ex, onClose }: { ex: WorkoutExercise; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              {ex.primaryMuscle} • {ex.movementPattern}
            </div>
            <h2 className="mt-1 text-2xl font-bold">{translateExerciseName(ex.originalName)}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1 text-sm hover:bg-accent"
          >
            Fechar
          </button>
        </div>
        <div className="mt-4 min-h-48 w-full overflow-hidden rounded-xl bg-muted">
          <ExerciseGif ex={ex} loading="eager" className="max-h-[28rem] w-full object-contain" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <Stat label="Séries" value={String(ex.sets)} />
          <Stat label="Reps" value={ex.repetitions} />
          <Stat label="Descanso" value={`${ex.restSeconds}s`} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs text-muted-foreground">Esforço alvo</div>
            <div className="mt-1 text-sm font-semibold">
              Termine com {ex.targetRir ?? 2} repetições em reserva (RIR)
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs text-muted-foreground">Cadência sugerida</div>
            <div className="mt-1 text-sm font-semibold">{ex.tempo ?? "Controlada"}</div>
          </div>
        </div>
        {!!ex.warmup?.length && (
          <div className="mt-4">
            <div className="text-sm font-semibold">Aquecimento específico</div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {ex.warmup.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        {!!ex.coachingCues?.length && (
          <div className="mt-4">
            <div className="text-sm font-semibold">Pontos de execução</div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {ex.coachingCues.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <div className="text-sm font-semibold">Equipamento</div>
          <div className="text-sm text-muted-foreground">{ex.equipment.join(", ")}</div>
        </div>
        {ex.secondaryMuscles.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-semibold">Músculos secundários</div>
            <div className="text-sm text-muted-foreground">
              {ex.secondaryMuscles.map(translateMuscle).join(", ")}
            </div>
          </div>
        )}
        <div className="mt-4">
          <div className="text-sm font-semibold">Instruções</div>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {portugueseInstructions({
              ...ex,
              namePt: translateExerciseName(ex.originalName),
            }).map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
        </div>
        <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Como progredir:</strong>{" "}
          {ex.progressionRule || "Comece com uma carga leve e priorize a execução correta."}
          <br />Nunca treine sob dor articular.
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

function ExerciseGif({
  ex,
  loading,
  className,
}: {
  ex: WorkoutExercise;
  loading: "eager" | "lazy";
  className: string;
}) {
  const candidates = exerciseGifCandidates(ex);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [ex.exerciseId, ex.gifUrl]);

  if (candidateIndex >= candidates.length) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center p-3 text-center text-xs text-muted-foreground">
        Demonstração indisponível
      </div>
    );
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={`Demonstração de ${translateExerciseName(ex.originalName)}`}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setCandidateIndex((index) => index + 1)}
      className={className}
    />
  );
}
