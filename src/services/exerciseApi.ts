import type { Exercise } from "@/types";

const BASE = "https://oss.exercisedb.dev/api/v1/exercises";
const TIMEOUT_MS = 15000;
const MAX_PAGES = 15; // up to ~1500 exercises, then we pick 350

interface ApiResponse {
  success: boolean;
  meta?: { total?: number; hasNextPage?: boolean; nextCursor?: string | null };
  data: Exercise[];
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<ApiResponse> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const combined = signal
    ? new AbortController()
    : controller;
  if (signal) {
    signal.addEventListener("abort", () => combined.abort(), { once: true });
    controller.signal.addEventListener("abort", () => combined.abort(), { once: true });
  }
  try {
    const res = await fetch(url, { signal: (combined as AbortController).signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ApiResponse;
  } finally {
    clearTimeout(t);
  }
}

function isValid(e: Exercise): boolean {
  return !!(
    e &&
    e.exerciseId &&
    e.name &&
    e.gifUrl &&
    Array.isArray(e.bodyParts) &&
    e.bodyParts.length > 0 &&
    Array.isArray(e.equipments) &&
    e.equipments.length > 0
  );
}

export async function fetchAllExercises(signal?: AbortSignal): Promise<Exercise[]> {
  const all: Exercise[] = [];
  const seen = new Set<string>();
  let cursor: string | null = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const url = `${BASE}?limit=100${cursor ? `&cursor=${cursor}` : ""}`;
    const json = await fetchWithTimeout(url, signal);
    for (const ex of json.data || []) {
      if (!isValid(ex)) continue;
      if (seen.has(ex.exerciseId)) continue;
      seen.add(ex.exerciseId);
      all.push(ex);
    }
    if (!json.meta?.hasNextPage || !json.meta.nextCursor) break;
    cursor = json.meta.nextCursor;
  }
  return all;
}
