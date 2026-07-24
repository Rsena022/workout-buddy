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

const KEY = "forjar-v1";
const CURRENT_VERSION = 1;
const EXERCISE_LIBRARY_VERSION = 2;

function read(): StoredData {
  if (typeof window === "undefined") return { version: CURRENT_VERSION };
  try {
    const raw = localStorage.getItem(KEY);
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
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const storage = {
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
      durationSeconds: Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)),
    };
    const sessions = [completed, ...(data.sessions || []).filter((item) => item.id !== completed.id)].slice(
      0,
      200,
    );
    const next = { ...data, sessions };
    delete next.activeSession;
    write(next);
    return completed;
  },
  getLibrary(): Exercise[] | undefined {
    const d = read();
    if (!d.exerciseLibrary || !d.libraryFetchedAt) return undefined;
    if (d.exerciseLibraryVersion !== EXERCISE_LIBRARY_VERSION) return undefined;
    return d.exerciseLibrary;
  },
  saveLibrary(exerciseLibrary: Exercise[]) {
    write({
      ...read(),
      exerciseLibrary,
      libraryFetchedAt: new Date().toISOString(),
      exerciseLibraryVersion: EXERCISE_LIBRARY_VERSION,
    });
  },
  clearAll() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  },
};
