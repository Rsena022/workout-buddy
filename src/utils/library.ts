import type { Exercise } from "@/types";
import { categoryOf } from "@/data/translations";

// Approximate quotas summing to 350 (uses ExerciseDB coarse bodyParts)
const QUOTAS: Record<string, number> = {
  Peitoral: 38,
  Costas: 48,
  Ombros: 34,
  Braços: 58, // biceps + triceps lumped by API into "upper arms"
  Antebraços: 12,
  Pernas: 78, // quads+hamstrings+glutes lumped in "upper legs"
  Panturrilhas: 16,
  "Abdômen e core": 36,
  Condicionamento: 18,
  Outros: 12,
};

// Beginner-friendly keywords: boost common, easy-to-execute movements
const BEGINNER_KEYWORDS = [
  "dumbbell", "machine", "cable", "bodyweight", "body weight",
  "press", "row", "curl", "extension", "raise", "squat", "lunge",
  "push-up", "push up", "pull-down", "pulldown", "plank", "bridge",
  "crunch", "sit-up", "sit up", "leg press", "chest press", "shoulder press",
  "goblet", "hip thrust", "calf raise", "lateral raise", "front raise",
];
const ADVANCED_KEYWORDS = [
  "olympic", "snatch", "clean and jerk", "muscle-up", "muscle up",
  "planche", "pistol", "handstand", "one arm", "one-arm", "one leg",
  "one-leg", "archer", "reverse hyper", "jefferson", "zercher",
];

function normalizeName(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreExercise(e: Exercise): number {
  let s = 0;
  if (e.gifUrl) s += 3;
  if (e.instructions && e.instructions.length >= 3) s += 2;
  if (e.equipments?.includes("body weight")) s += 2;
  if (e.equipments?.some((eq) => ["dumbbell", "cable", "leverage machine"].includes(eq))) s += 2;
  if (e.equipments?.some((eq) => ["barbell"].includes(eq))) s += 1;
  const name = e.name?.toLowerCase() || "";
  if (BEGINNER_KEYWORDS.some((k) => name.includes(k))) s += 3;
  if (ADVANCED_KEYWORDS.some((k) => name.includes(k))) s -= 4;
  // penalize obscure equipments
  if (e.equipments?.some((eq) => ["assisted", "sled", "roller", "trap bar"].includes(eq))) s -= 1;
  return s;
}

export function selectExerciseLibrary(exercises: Exercise[], limit = 150): Exercise[] {
  // dedupe by id and normalized name
  const byId = new Map<string, Exercise>();
  const seenNames = new Set<string>();
  for (const e of exercises) {
    if (!e.exerciseId || !e.name || !e.gifUrl) continue;
    if (byId.has(e.exerciseId)) continue;
    const nn = normalizeName(e.name);
    if (seenNames.has(nn)) continue;
    seenNames.add(nn);
    byId.set(e.exerciseId, e);
  }
  const valid = Array.from(byId.values());

  // group by category
  const groups: Record<string, Exercise[]> = {};
  for (const e of valid) {
    const cat = categoryOf(e);
    (groups[cat] ||= []).push(e);
  }
  // stable order in each group
  for (const cat of Object.keys(groups)) {
    groups[cat].sort((a, b) => {
      const sd = scoreExercise(b) - scoreExercise(a);
      if (sd !== 0) return sd;
      return a.exerciseId.localeCompare(b.exerciseId);
    });
  }

  const picked: Exercise[] = [];
  const pickedIds = new Set<string>();

  // First pass: fill quotas
  for (const [cat, quota] of Object.entries(QUOTAS)) {
    const pool = groups[cat] || [];
    for (const e of pool) {
      if (picked.length >= limit) break;
      if (pickedIds.has(e.exerciseId)) continue;
      const count = picked.filter((x) => categoryOf(x) === cat).length;
      if (count >= quota) break;
      picked.push(e);
      pickedIds.add(e.exerciseId);
    }
  }

  // Second pass: fill remaining slots with best-scored remaining across all
  if (picked.length < limit) {
    const remaining = valid
      .filter((e) => !pickedIds.has(e.exerciseId))
      .sort((a, b) => scoreExercise(b) - scoreExercise(a) || a.exerciseId.localeCompare(b.exerciseId));
    for (const e of remaining) {
      if (picked.length >= limit) break;
      picked.push(e);
      pickedIds.add(e.exerciseId);
    }
  }

  return picked.slice(0, limit);
}
