import type { Exercise } from "@/types";

const API_URL = "https://oss.exercisedb.dev/api/v1/exercises";
const TIMEOUT_MS = 15000;
const MAX_PAGES = 100;
const MAX_RETRIES = 3;
const PAGE_SIZE = 25;
const PAGE_DELAY_MS = 150;

interface ApiResponse {
  success: boolean;
  meta?: {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string | null;
  };
  data: unknown[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function gifUrlOf(value: unknown, exerciseId: string): string {
  if (typeof value === "string" && /^https:\/\//i.test(value)) return value;
  if (value && typeof value === "object") {
    const candidate = Object.values(value).find(
      (item) => typeof item === "string" && /^https:\/\//i.test(item),
    );
    if (typeof candidate === "string") return candidate;
  }
  return `https://static.exercisedb.dev/media/${encodeURIComponent(exerciseId)}.gif`;
}

function normalizeExercise(value: unknown): Exercise | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  if (typeof raw.exerciseId !== "string" || typeof raw.name !== "string") return undefined;
  const bodyParts = textArray(raw.bodyParts);
  const targetMuscles = textArray(raw.targetMuscles);
  if (bodyParts.length === 0 && targetMuscles.length === 0) return undefined;
  return {
    exerciseId: raw.exerciseId,
    name: raw.name,
    gifUrl: gifUrlOf(raw.gifUrl, raw.exerciseId),
    bodyParts,
    targetMuscles,
    secondaryMuscles: textArray(raw.secondaryMuscles),
    equipments: textArray(raw.equipments),
    instructions: textArray(raw.instructions),
  };
}

async function fetchExercisePage(after?: string): Promise<ApiResponse> {
  const url = new URL(API_URL);
  // Free V1 accepts at most 25 records and uses `after` for forward pagination.
  url.searchParams.set("limit", String(PAGE_SIZE));
  if (after) url.searchParams.set("after", after);

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
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(`ExerciseDB retornou ${contentType || "conteudo nao identificado"}`);
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
        isAbort ? "timeout/abort" : ((err as Error)?.message ?? err),
      );
      if (attempt === MAX_RETRIES) break;
      await sleep(750 * 2 ** attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Falha ao buscar exercícios");
}

export async function fetchAllExercises(desiredAmount = 300): Promise<Exercise[]> {
  const byId = new Map<string, Exercise>();
  const usedCursors = new Set<string>();
  let after: string | undefined;
  let pageCount = 0;

  while (byId.size < desiredAmount && pageCount < MAX_PAGES) {
    let result: ApiResponse;
    try {
      result = await fetchExercisePage(after);
    } catch (error) {
      // Keep a useful partial library when the public API becomes unstable
      // after several successful pages.
      if (byId.size >= 50) {
        console.warn(`[ExerciseDB] usando biblioteca parcial com ${byId.size} exercicios.`, error);
        break;
      }
      throw error;
    }
    let discarded = 0;
    for (const raw of result.data) {
      const ex = normalizeExercise(raw);
      if (!ex) {
        discarded++;
        continue;
      }
      if (byId.has(ex.exerciseId)) {
        discarded++;
        continue;
      }
      byId.set(ex.exerciseId, ex);
    }
    pageCount++;
    console.log("[ExerciseDB] página", {
      page: pageCount,
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
    after = nextCursor;
    if (byId.size < desiredAmount) await sleep(PAGE_DELAY_MS);
  }

  console.log(`[ExerciseDB] total acumulado: ${byId.size} exercícios em ${pageCount} página(s).`);
  return Array.from(byId.values());
}
