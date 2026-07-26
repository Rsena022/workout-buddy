import type { Exercise } from "@/types";
import { isGeneralAudienceExercise } from "@/utils/exerciseSuitability";

const API_URL = "https://oss.exercisedb.dev/api/v1/exercises";
const TIMEOUT_MS = 15000;
const MAX_PAGES = 100;
const MAX_RETRIES = 4;
const PAGE_SIZE = 25;
// Keep requests comfortably spaced because the public API applies strict limits.
const PAGE_DELAY_MS = 900;
const RETRY_BASE_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 12000;

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

export interface ExerciseFetchProgress {
  exercises: Exercise[];
  nextCursor?: string;
  complete: boolean;
}

interface ExerciseFetchOptions {
  initialExercises?: Exercise[];
  after?: string;
  onPage?: (progress: ExerciseFetchProgress) => void;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(response: Response | undefined, attempt: number) {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);

    const retryAt = Date.parse(retryAfter);
    if (Number.isFinite(retryAt)) {
      return Math.min(Math.max(retryAt - Date.now(), 0), MAX_RETRY_DELAY_MS);
    }
  }

  const exponential = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
  const jitter = Math.round(Math.random() * 350);
  return exponential + jitter;
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
    let response: Response | undefined;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "force-cache",
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
      await sleep(retryDelayMs(response, attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Falha ao buscar exercícios");
}

export async function fetchAllExercises(
  desiredAmount = 300,
  minimumGeneralAudience = 0,
  options: ExerciseFetchOptions = {},
): Promise<Exercise[]> {
  const byId = new Map(
    (options.initialExercises || []).map((exercise) => [exercise.exerciseId, exercise]),
  );
  const usedCursors = new Set<string>();
  let after = options.after;
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
    const hasNextPage = Boolean(result.meta?.hasNextPage && nextCursor);
    options.onPage?.({
      exercises: Array.from(byId.values()),
      nextCursor: hasNextPage ? nextCursor : undefined,
      complete: !hasNextPage,
    });

    const generalAudienceCount =
      minimumGeneralAudience > 0
        ? Array.from(byId.values()).filter(isGeneralAudienceExercise).length
        : 0;
    if (
      minimumGeneralAudience > 0 &&
      byId.size >= 100 &&
      generalAudienceCount >= minimumGeneralAudience
    ) {
      console.log(
        `[ExerciseDB] curadoria mínima atingida: ${generalAudienceCount} exercícios comuns.`,
      );
      break;
    }

    if (!hasNextPage || !nextCursor) break;
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
