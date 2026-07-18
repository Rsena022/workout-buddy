import type { Exercise, StoredData, UserProfile, WorkoutPlan, WorkoutProgress } from "@/types";

const KEY = "forjar-v1";
const CURRENT_VERSION = 1;
const LIBRARY_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

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
  getProfile(): UserProfile | undefined { return read().profile; },
  saveProfile(profile: UserProfile) { write({ ...read(), profile }); },
  getPlan(): WorkoutPlan | undefined { return read().workoutPlan; },
  savePlan(workoutPlan: WorkoutPlan) { write({ ...read(), workoutPlan }); },
  clearPlan() { const d = read(); delete d.workoutPlan; delete d.progress; write(d); },
  getProgress(): WorkoutProgress { return read().progress || { completed: {}, updatedAt: new Date().toISOString() }; },
  saveProgress(progress: WorkoutProgress) { write({ ...read(), progress }); },
  getLibrary(): Exercise[] | undefined {
    const d = read();
    if (!d.exerciseLibrary || !d.libraryFetchedAt) return undefined;
    if (Date.now() - new Date(d.libraryFetchedAt).getTime() > LIBRARY_TTL_MS) return undefined;
    return d.exerciseLibrary;
  },
  saveLibrary(exerciseLibrary: Exercise[]) {
    write({ ...read(), exerciseLibrary, libraryFetchedAt: new Date().toISOString() });
  },
  clearAll() { if (typeof window !== "undefined") localStorage.removeItem(KEY); },
};
