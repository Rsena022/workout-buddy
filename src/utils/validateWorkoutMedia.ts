import type { Exercise, UserProfile, WorkoutExercise, WorkoutPlan } from "@/types";
import { exerciseGifCandidates } from "@/utils/exerciseMedia";
import { generateWorkoutPlan } from "@/utils/generateWorkout";

const IMAGE_TIMEOUT_MS = 12000;
const MAX_REBUILDS = 4;

function imageLoads(url: string): Promise<boolean> {
  if (typeof Image === "undefined") return Promise.resolve(true);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(loaded);
    };
    const timeout = setTimeout(() => finish(false), IMAGE_TIMEOUT_MS);
    image.referrerPolicy = "no-referrer";
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    image.src = url;
  });
}

async function exerciseMediaLoads(exercise: WorkoutExercise): Promise<boolean> {
  for (const url of exerciseGifCandidates(exercise)) {
    if (await imageLoads(url)) return true;
  }
  return false;
}

async function brokenMediaIds(plan: WorkoutPlan): Promise<Set<string>> {
  const exercises = plan.days.flatMap((day) => day.exercises);
  const unique = [
    ...new Map(exercises.map((exercise) => [exercise.exerciseId, exercise])).values(),
  ];
  const results = await Promise.all(
    unique.map(async (exercise) => ({ exercise, loaded: await exerciseMediaLoads(exercise) })),
  );
  return new Set(
    results.filter(({ loaded }) => !loaded).map(({ exercise }) => exercise.exerciseId),
  );
}

export async function generateWorkoutPlanWithVerifiedMedia(
  profile: UserProfile,
  initialLibrary: Exercise[],
): Promise<{ plan: WorkoutPlan; library: Exercise[] }> {
  let library = initialLibrary;
  let plan = generateWorkoutPlan(profile, library);

  for (let attempt = 0; attempt < MAX_REBUILDS; attempt++) {
    const brokenIds = await brokenMediaIds(plan);
    if (brokenIds.size === 0) return { plan, library };
    console.warn(`[ExerciseDB] removendo ${brokenIds.size} exercicio(s) com GIF indisponivel.`);
    library = library.filter((exercise) => !brokenIds.has(exercise.exerciseId));
    plan = generateWorkoutPlan(profile, library);
  }

  return { plan, library };
}
