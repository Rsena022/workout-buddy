import type { WorkoutExercise } from "@/types";

const MEDIA_BASE = "https://static.exercisedb.dev/media";

export function exerciseGifCandidates(
  exercise: Pick<WorkoutExercise, "exerciseId" | "gifUrl">,
): string[] {
  const canonical = `${MEDIA_BASE}/${encodeURIComponent(exercise.exerciseId)}.gif`;
  const candidates = [exercise.gifUrl, canonical, `${canonical}?retry=1`].filter(
    (url): url is string => typeof url === "string" && /^https:\/\//i.test(url),
  );
  return [...new Set(candidates)];
}
