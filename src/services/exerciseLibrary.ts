import type { Exercise } from "@/types";
import { fetchAllExercises } from "@/services/exerciseApi";
import { selectExerciseLibrary } from "@/utils/library";
import { storage } from "@/utils/storage";

export const CURATED_LIBRARY_TARGET = 200;
export const MINIMUM_WORKOUT_LIBRARY = 80;
// Mantemos uma pequena reserva para que a validação de GIFs possa remover
// arquivos indisponíveis sem fazer outra chamada à API no quiz ou na troca.
const CURATED_LIBRARY_FETCH_TARGET = 220;
const RAW_EXERCISE_SCAN_TARGET = 1200;
let activeLibraryRequest: Promise<Exercise[]> | undefined;

async function fetchCuratedExerciseLibrary(forceRefresh: boolean): Promise<Exercise[]> {
  const cached = storage.getLibrary();
  if (!forceRefresh && cached && cached.length >= CURATED_LIBRARY_TARGET) return cached;

  if (forceRefresh) storage.clearRawLibraryProgress();
  const progress = forceRefresh ? undefined : storage.getRawLibraryProgress();
  const all = await fetchAllExercises(RAW_EXERCISE_SCAN_TARGET, CURATED_LIBRARY_FETCH_TARGET, {
    initialExercises: progress?.exercises,
    after: progress?.complete ? undefined : progress?.nextCursor,
    onPage: (nextProgress) =>
      storage.saveRawLibraryProgress({
        ...nextProgress,
        // Persist only useful candidates. This keeps the browser cache small
        // while preserving the cursor needed to continue on the next attempt.
        exercises: selectExerciseLibrary(nextProgress.exercises, CURATED_LIBRARY_FETCH_TARGET),
      }),
  });
  const curated = selectExerciseLibrary(all, CURATED_LIBRARY_FETCH_TARGET);

  if (curated.length < MINIMUM_WORKOUT_LIBRARY) {
    throw new Error(
      `A base retornou apenas ${curated.length} exercícios seguros. Tente novamente para continuar o carregamento.`,
    );
  }

  storage.saveLibrary(curated);
  if (curated.length < CURATED_LIBRARY_TARGET) {
    console.warn(
      `[ExerciseDB] biblioteca parcial com ${curated.length} exercícios; a próxima consulta continuará do ponto salvo.`,
    );
  }
  return curated;
}

export async function loadCuratedExerciseLibrary(forceRefresh = false): Promise<Exercise[]> {
  const cached = storage.getLibrary();
  if (!forceRefresh && cached && cached.length >= CURATED_LIBRARY_TARGET) return cached;

  // Multiple clicks/renders share the same request instead of multiplying calls.
  if (!activeLibraryRequest) {
    activeLibraryRequest = fetchCuratedExerciseLibrary(forceRefresh).finally(() => {
      activeLibraryRequest = undefined;
    });
  }

  return activeLibraryRequest;
}
