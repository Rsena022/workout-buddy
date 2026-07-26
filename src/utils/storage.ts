import type {
  Exercise,
  StoredData,
  UserProfile,
  WorkoutDay,
  WorkoutPlan,
  WorkoutProgress,
  WorkoutSession,
} from "@/types";
import { emptyPerformanceSets } from "@/utils/progression";

const LEGACY_KEY = "forjar-v1";
const USER_KEY_PREFIX = "forjar-v2:user:";
const ANONYMOUS_KEY = "forjar-v2:anonymous";
const LIBRARY_KEY = "forjar-v2:exercise-library";
const RAW_LIBRARY_KEY = "forjar-v2:exercise-library-progress";
const CURRENT_VERSION = 2;
const EXERCISE_LIBRARY_VERSION = 5;

interface RawLibraryProgress {
  exercises: Exercise[];
  nextCursor?: string;
  complete: boolean;
}

let currentUserId: string | null = null;

function dataKey() {
  return currentUserId ? `${USER_KEY_PREFIX}${currentUserId}` : ANONYMOUS_KEY;
}

function read(): StoredData {
  if (typeof window === "undefined") return { version: CURRENT_VERSION };
  try {
    const raw = localStorage.getItem(dataKey());
    if (!raw) return { version: CURRENT_VERSION };
    const parsed = JSON.parse(raw) as StoredData;
    if (parsed.version !== CURRENT_VERSION) return { version: CURRENT_VERSION };
    return parsed;
  } catch {
    return { version: CURRENT_VERSION };
  }
}

function write(data: StoredData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(dataKey(), JSON.stringify(data));
}

export const storage = {
  setUserScope(userId?: string | null) {
    currentUserId = userId || null;
  },
  getProfile(): UserProfile | undefined {
    return read().profile;
  },
  saveProfile(profile: UserProfile) {
    write({ ...read(), profile });
  },
  getPlan(): WorkoutPlan | undefined {
    return read().workoutPlan;
  },
  savePlan(workoutPlan: WorkoutPlan) {
    write({ ...read(), workoutPlan });
  },
  clearPlan() {
    const d = read();
    delete d.workoutPlan;
    delete d.progress;
    write(d);
  },
  getProgress(): WorkoutProgress {
    return read().progress || { completed: {}, updatedAt: new Date().toISOString() };
  },
  saveProgress(progress: WorkoutProgress) {
    write({ ...read(), progress });
  },
  getSessions(): WorkoutSession[] {
    return read().sessions || [];
  },
  getActiveSession(): WorkoutSession | undefined {
    return read().activeSession;
  },
  startSession(plan: WorkoutPlan, day: WorkoutDay): WorkoutSession {
    const existing = read().activeSession;
    if (existing?.planId === plan.id && existing.dayId === day.id) return existing;
    const session: WorkoutSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      planId: plan.id,
      dayId: day.id,
      dayName: day.name,
      startedAt: new Date().toISOString(),
      exercises: day.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.namePt,
        sets: emptyPerformanceSets(exercise),
      })),
    };
    write({ ...read(), activeSession: session });
    return session;
  },
  saveActiveSession(activeSession: WorkoutSession) {
    write({ ...read(), activeSession });
  },
  completeSession(session: WorkoutSession): WorkoutSession {
    const data = read();
    const completedAt = new Date();
    const startedAt = new Date(session.startedAt);
    const completed: WorkoutSession = {
      ...session,
      completedAt: completedAt.toISOString(),
      durationSeconds: Math.max(
        0,
        Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
      ),
    };
    const sessions = [
      completed,
      ...(data.sessions || []).filter((item) => item.id !== completed.id),
    ].slice(0, 200);
    const next = { ...data, sessions };
    delete next.activeSession;
    write(next);
    return completed;
  },
  getLibrary(): Exercise[] | undefined {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem(LIBRARY_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as Pick<
        StoredData,
        "exerciseLibrary" | "libraryFetchedAt" | "exerciseLibraryVersion"
      >;
      if (!parsed.exerciseLibrary || !parsed.libraryFetchedAt) return undefined;
      if (parsed.exerciseLibraryVersion !== EXERCISE_LIBRARY_VERSION) return undefined;
      return parsed.exerciseLibrary;
    } catch {
      return undefined;
    }
  },
  saveLibrary(exerciseLibrary: Exercise[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LIBRARY_KEY,
      JSON.stringify({
        exerciseLibrary,
        libraryFetchedAt: new Date().toISOString(),
        exerciseLibraryVersion: EXERCISE_LIBRARY_VERSION,
      }),
    );
  },
  getRawLibraryProgress(): RawLibraryProgress | undefined {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem(RAW_LIBRARY_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as RawLibraryProgress & {
        exerciseLibraryVersion?: number;
      };
      if (parsed.exerciseLibraryVersion !== EXERCISE_LIBRARY_VERSION) return undefined;
      if (!Array.isArray(parsed.exercises)) return undefined;
      return {
        exercises: parsed.exercises,
        nextCursor: parsed.nextCursor,
        complete: parsed.complete === true,
      };
    } catch {
      return undefined;
    }
  },
  saveRawLibraryProgress(progress: RawLibraryProgress) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        RAW_LIBRARY_KEY,
        JSON.stringify({
          ...progress,
          exerciseLibraryVersion: EXERCISE_LIBRARY_VERSION,
        }),
      );
    } catch (error) {
      console.warn("[ExerciseDB] Não foi possível salvar o progresso bruto:", error);
    }
  },
  clearRawLibraryProgress() {
    if (typeof window !== "undefined") localStorage.removeItem(RAW_LIBRARY_KEY);
  },
  clearAll() {
    if (typeof window !== "undefined") localStorage.removeItem(dataKey());
  },
  removeLegacyData() {
    if (typeof window !== "undefined") localStorage.removeItem(LEGACY_KEY);
  },
};
