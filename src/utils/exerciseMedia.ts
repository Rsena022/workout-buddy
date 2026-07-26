import type { WorkoutExercise } from "@/types";

const MEDIA_BASE = "https://static.exercisedb.dev/media";
const IMAGE_TIMEOUT_MS = 8000;
const resolvedGifCache = new Map<string, Promise<string | undefined>>();

export function exerciseGifCandidates(
  exercise: Pick<WorkoutExercise, "exerciseId" | "gifUrl">,
): string[] {
  const canonical = `${MEDIA_BASE}/${encodeURIComponent(exercise.exerciseId)}.gif`;
  const candidates = [exercise.gifUrl, canonical, `${canonical}?retry=1`].filter(
    (url): url is string => typeof url === "string" && /^https:\/\//i.test(url),
  );
  return [...new Set(candidates)];
}

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

export function resolveExerciseGif(
  exercise: Pick<WorkoutExercise, "exerciseId" | "gifUrl">,
): Promise<string | undefined> {
  const cacheKey = `${exercise.exerciseId}|${exercise.gifUrl ?? ""}`;
  const cached = resolvedGifCache.get(cacheKey);
  if (cached) return cached;

  const resolution = (async () => {
    for (const url of exerciseGifCandidates(exercise)) {
      if (await imageLoads(url)) return url;
    }
    return undefined;
  })();

  resolvedGifCache.set(cacheKey, resolution);
  return resolution;
}
