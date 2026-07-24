import type { WorkoutExercise, WorkoutSetPerformance } from "@/types";

function repetitionRange(value: string): { minimum: number; maximum: number } | undefined {
  const values = value.match(/\d+/g)?.map(Number);
  if (!values?.length) return undefined;
  return { minimum: values[0], maximum: values[1] ?? values[0] };
}

export function emptyPerformanceSets(exercise: WorkoutExercise): WorkoutSetPerformance[] {
  return Array.from({ length: exercise.sets }, (_, index) => ({
    setNumber: index + 1,
    completed: false,
  }));
}

export function progressionSuggestion(
  exercise: WorkoutExercise,
  sets: WorkoutSetPerformance[],
): { status: "increase" | "maintain" | "reduce" | "incomplete"; message: string } {
  const completed = sets.filter((set) => set.completed && set.repetitions != null);
  if (completed.length < exercise.sets) {
    return { status: "incomplete", message: "Complete todas as séries para receber a sugestão." };
  }

  const range = repetitionRange(exercise.repetitions);
  if (!range) return { status: "maintain", message: "Mantenha a carga e priorize a técnica." };

  const targetRir = exercise.targetRir ?? 2;
  const allAtTop = completed.every(
    (set) => (set.repetitions ?? 0) >= range.maximum && (set.rir ?? targetRir) >= targetRir,
  );
  if (allAtTop) {
    return {
      status: "increase",
      message: "Você atingiu o topo da faixa com controle. Aumente a menor carga disponível na próxima sessão.",
    };
  }

  const techniqueLimit = completed.some(
    (set) => (set.repetitions ?? 0) < range.minimum || (set.rir != null && set.rir === 0),
  );
  if (techniqueLimit) {
    return {
      status: "reduce",
      message: "A carga parece alta para a faixa proposta. Reduza um passo e recupere a execução.",
    };
  }

  return {
    status: "maintain",
    message: "Mantenha a carga e tente acrescentar uma repetição por série na próxima sessão.",
  };
}

