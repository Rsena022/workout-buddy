import type { Exercise } from "@/types";

const API_URL = "https://oss.exercisedb.dev/api/v1/exercises";
const TIMEOUT_MS = 15000;
const MAX_PAGES = 100;
const MAX_RETRIES = 2;

interface ApiResponse {
  success: boolean;
  meta?: {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string | null;
  };
  data: Exercise[];
}

function isValid(e: Exercise | undefined | null): e is Exercise {
  if (!e) return false;
  if (!e.exerciseId || !e.name || !e.gifUrl) return false;
  const hasBodyPart = Array.isArray(e.bodyParts) && e.bodyParts.length > 0;
  const hasTarget = Array.isArray(e.targetMuscles) && e.targetMuscles.length > 0;
  return hasBodyPart || hasTarget;
}

async function fetchExercisePage(cursor?: string, limit = 100): Promise<ApiResponse> {
  const url = new URL(API_URL);
  url.searchParams.set("limit", String(limit));
  if (cursor) url.searchParams.set("cursor", cursor);

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      console.log(`[ExerciseDB] GET ${url.toString()} -> HTTP ${response.status}`);
      if (!response.ok) {
        // Retry on 5xx/429; hard fail on others
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`HTTP ${response.status}`);
        }
        throw new Error(`ExerciseDB respondeu com HTTP ${response.status}`);
      }
      const result = (await response.json()) as ApiResponse;
      if (!result || result.success === false || !Array.isArray(result.data)) {
        throw new Error("Formato inesperado retornado pela ExerciseDB");
      }
      return result;
    } catch (err) {
      lastError = err;
      const isAbort = (err as { name?: string })?.name === "AbortError";
      console.warn(
        `[ExerciseDB] tentativa ${attempt + 1} falhou:`,
        isAbort ? "timeout/abort" : (err as Error)?.message ?? err,
      );
      if (attempt === MAX_RETRIES) break;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Falha ao buscar exercícios");
}

export async function fetchAllExercises(desiredAmount = 300): Promise<Exercise[]> {
  const byId = new Map<string, Exercise>();
  const usedCursors = new Set<string>();
  let cursor: string | undefined;
  let pageCount = 0;

  while (byId.size < desiredAmount && pageCount < MAX_PAGES) {
    const result = await fetchExercisePage(cursor);
    let discarded = 0;
    for (const ex of result.data) {
      if (!isValid(ex)) { discarded++; continue; }
      if (byId.has(ex.exerciseId)) { discarded++; continue; }
      byId.set(ex.exerciseId, ex);
    }
    console.log("[ExerciseDB] página", {
      page: pageCount + 1,
      received: result.data.length,
      accumulated: byId.size,
      discarded,
      nextCursor: result.meta?.nextCursor ?? null,
      hasNextPage: result.meta?.hasNextPage ?? false,
    });

    const nextCursor = result.meta?.nextCursor ?? undefined;
    if (!result.meta?.hasNextPage || !nextCursor) break;
    if (usedCursors.has(nextCursor)) {
      console.warn("[ExerciseDB] cursor repetido, encerrando paginação.");
      break;
    }
    usedCursors.add(nextCursor);
    cursor = nextCursor;
    pageCount++;
  }

  console.log(`[ExerciseDB] total acumulado: ${byId.size} exercícios em ${pageCount + 1} página(s).`);
  return Array.from(byId.values());
}
