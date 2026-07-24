import type { Exercise, UserProfile, WorkoutDay, WorkoutExercise, WorkoutPlan } from "@/types";
import {
  categoryOf,
  translateExerciseName,
  primaryMusclePt,
  equipmentPt,
  translateMuscle,
} from "@/data/translations";

// Movement pattern by simple heuristic on name
function movementPattern(name: string, category: string): string {
  const n = name.toLowerCase();
  if (/(bench press|push[- ]?up|dip|chest press)/.test(n)) return "Empurrar horizontal";
  if (/(shoulder press|overhead press|military press)/.test(n)) return "Empurrar vertical";
  if (/(row|face pull)/.test(n)) return "Puxar horizontal";
  if (/(pull[- ]?up|chin[- ]?up|pulldown|lat)/.test(n)) return "Puxar vertical";
  if (/(squat|leg press)/.test(n)) return "Agachamento";
  if (/(deadlift|hip thrust|glute bridge|good morning)/.test(n)) return "Extensão de quadril";
  if (/(leg curl|hamstring)/.test(n)) return "Flexão de joelhos";
  if (/(leg extension|extension)/.test(n)) return "Extensão de joelhos";
  if (/(curl)/.test(n)) return "Flexão de cotovelos";
  if (/(triceps|extension|pushdown|skull)/.test(n)) return "Extensão de cotovelos";
  if (/(calf|raise)/.test(n) && category === "Panturrilhas") return "Elevação de panturrilha";
  if (/(plank|crunch|sit[- ]?up|leg raise|ab)/.test(n)) return "Core";
  return category;
}

// Which categories fit each day focus
const FOCUS_MAP: Record<string, string[]> = {
  "Full Body": [
    "Peitoral",
    "Costas",
    "Ombros",
    "Braços",
    "Pernas",
    "Glúteos",
    "Abdômen e core",
    "Panturrilhas",
  ],
  Superior: ["Peitoral", "Costas", "Ombros", "Braços"],
  Inferior: ["Pernas", "Panturrilhas", "Abdômen e core"],
  Empurrar: ["Peitoral", "Ombros", "Braços"], // triceps in Braços
  Puxar: ["Costas", "Braços"], // biceps in Braços
  Pernas: ["Pernas", "Panturrilhas", "Glúteos"],
  "Peito, ombros e tríceps": ["Peitoral", "Ombros", "Braços"],
  "Costas e bíceps": ["Costas", "Braços"],
};

interface DayTemplate {
  name: string;
  focus: string;
}

function pickDivision(days: number, experience: UserProfile["experience"]): DayTemplate[] {
  const isBeginner =
    experience === "never_trained" ||
    experience === "returning" ||
    experience === "under_six_months";
  if (days <= 2)
    return [
      { name: "Treino A", focus: "Full Body" },
      { name: "Treino B", focus: "Full Body" },
    ];
  if (days === 3)
    return [
      { name: "Treino A", focus: "Full Body" },
      { name: "Treino B", focus: "Full Body" },
      { name: "Treino C", focus: "Full Body" },
    ];
  if (days === 4)
    return [
      { name: "Superior A", focus: "Superior" },
      { name: "Inferior A", focus: "Inferior" },
      { name: "Superior B", focus: "Superior" },
      { name: "Inferior B", focus: "Inferior" },
    ];
  if (days === 5) {
    if (isBeginner)
      return [
        { name: "Superior A", focus: "Superior" },
        { name: "Inferior A", focus: "Inferior" },
        { name: "Superior B", focus: "Superior" },
        { name: "Inferior B", focus: "Inferior" },
        { name: "Full Body", focus: "Full Body" },
      ];
    return [
      { name: "Peito/Ombros/Tríceps", focus: "Peito, ombros e tríceps" },
      { name: "Costas/Bíceps", focus: "Costas e bíceps" },
      { name: "Pernas", focus: "Pernas" },
      { name: "Superior", focus: "Superior" },
      { name: "Inferior e core", focus: "Inferior" },
    ];
  }
  // 6+
  return [
    { name: "Empurrar A", focus: "Empurrar" },
    { name: "Puxar A", focus: "Puxar" },
    { name: "Pernas A", focus: "Pernas" },
    { name: "Empurrar B", focus: "Empurrar" },
    { name: "Puxar B", focus: "Puxar" },
    { name: "Pernas B", focus: "Pernas" },
  ];
}

function exerciseCountForTime(minutes: number): number {
  if (minutes <= 30) return 5;
  if (minutes <= 45) return 6;
  if (minutes <= 60) return 7;
  return 8;
}

function setsRepsRest(
  goal: UserProfile["goal"],
  experience: UserProfile["experience"],
  compound: boolean,
): { sets: number; reps: string; rest: number } {
  const beginner = experience === "never_trained" || experience === "returning";
  if (beginner) return { sets: 3, reps: "8-12", rest: compound ? 90 : 60 };
  switch (goal) {
    case "strength":
      return compound ? { sets: 4, reps: "4-6", rest: 150 } : { sets: 3, reps: "8-12", rest: 90 };
    case "hypertrophy":
    case "recomposition":
      return {
        sets: compound ? 4 : 3,
        reps: compound ? "6-10" : "10-15",
        rest: compound ? 120 : 75,
      };
    case "fat_loss":
    case "conditioning":
      return { sets: 3, reps: "10-15", rest: compound ? 75 : 45 };
    case "health":
    default:
      return { sets: 3, reps: "10-12", rest: 60 };
  }
}

// Equipment compatibility
function equipmentAllowed(ex: Exercise, profile: UserProfile): boolean {
  const eqs = ex.equipments.map((e) => e.toLowerCase());
  if (profile.location === "full_gym") return true;
  if (profile.location === "basic_gym") {
    const disallowed = ["sled"];
    return !eqs.some((e) => disallowed.includes(e));
  }
  if (profile.location === "home_no_equipment") {
    return eqs.every((e) => e === "body weight" || e === "assisted");
  }
  // home_equipment
  const owned = new Set(profile.equipment.map((e) => e.toLowerCase()));
  // always allow body weight
  return eqs.every((e) => e === "body weight" || owned.has(e));
}

// Simple limitation filter by name
function limitationAllows(ex: Exercise, profile: UserProfile): boolean {
  if (!profile.hasLimitation) return true;
  const name = ex.name.toLowerCase();
  const lims = profile.limitations.map((l) => l.toLowerCase());
  if (lims.some((l) => l.includes("joelho")) && /(jump|burpee|deep squat|pistol)/.test(name))
    return false;
  if (lims.some((l) => l.includes("coluna")) && /(deadlift|good morning|bent over row)/.test(name))
    return false;
  if (lims.some((l) => l.includes("ombro")) && /(overhead|behind the neck|upright row)/.test(name))
    return false;
  if (lims.some((l) => l.includes("punho")) && /(handstand|push[- ]?up)/.test(name)) return false;
  return true;
}

function dislikedFilter(ex: Exercise, profile: UserProfile): boolean {
  const dis = profile.dislikedExercises?.toLowerCase().trim();
  if (!dis) return true;
  const tokens = dis
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const n = ex.name.toLowerCase();
  return !tokens.some((t) => t.length >= 3 && n.includes(t));
}

function isCompound(ex: Exercise): boolean {
  return (
    (ex.secondaryMuscles?.length || 0) >= 2 ||
    /(squat|deadlift|bench press|row|pull[- ]?up|press|clean|lunge|dip)/i.test(ex.name)
  );
}

function isBeginnerExperience(experience: UserProfile["experience"]): boolean {
  return (
    experience === "never_trained" ||
    experience === "returning" ||
    experience === "under_six_months"
  );
}

function beginnerFriendlyScore(exercise: Exercise, profile?: UserProfile): number {
  const name = exercise.name.toLowerCase();
  const equipments = exercise.equipments.map((item) => item.toLowerCase());
  let score = 0;
  if (
    equipments.some((item) =>
      ["leverage machine", "cable", "dumbbell", "body weight"].includes(item),
    )
  )
    score += 4;
  if (/(press|row|pulldown|curl|extension|raise|squat|bridge|crunch|plank)/.test(name)) score += 3;
  if (/(machine|supported|seated|lying)/.test(name)) score += 2;
  if (
    /(olympic|snatch|clean|jerk|muscle[- ]?up|handstand|planche|pistol|one[- ]?arm|one[- ]?leg|archer|impossible)/.test(
      name,
    )
  )
    score -= 20;
  if (profile && profile.age >= 60) {
    if (/(machine|supported|seated|lying)/.test(name)) score += 4;
    if (/(jump|burpee|box jump|depth jump)/.test(name)) score -= 12;
  }
  if (profile?.trainingStyle === "machines") {
    if (equipments.some((item) => ["leverage machine", "cable", "smith machine"].includes(item)))
      score += 7;
    if (equipments.includes("barbell")) score -= 2;
  }
  if (profile?.trainingStyle === "free_weights") {
    if (equipments.some((item) => ["dumbbell", "barbell", "kettlebell"].includes(item))) score += 6;
  }
  if (profile?.trainingStyle === "bodyweight") {
    if (equipments.includes("body weight")) score += 8;
    else score -= 2;
  }
  if (profile?.trainingStyle === "guided" && /(machine|supported|seated|lying)/.test(name)) score += 6;
  return score;
}

function coachingCuesFor(pattern: string): string[] {
  if (pattern.includes("Agachamento"))
    return ["Mantenha os pés firmes no chão.", "Desça apenas até onde preserve o controle."];
  if (pattern.includes("quadril"))
    return ["Mantenha a coluna neutra.", "Conduza o movimento com quadris e glúteos."];
  if (pattern.includes("Empurrar"))
    return ["Mantenha escápulas estáveis.", "Evite travar as articulações com impacto."];
  if (pattern.includes("Puxar"))
    return ["Inicie aproximando as escápulas.", "Evite usar impulso do tronco."];
  if (pattern === "Core")
    return ["Mantenha o abdômen ativo.", "Interrompa antes de perder a posição da coluna."];
  return ["Use amplitude confortável e controlada.", "Interrompa a série se a técnica se deteriorar."];
}

function progressionRuleFor(repetitions: string, targetRir: number): string {
  const upper = repetitions.match(/(\d+)\s*$/)?.[1] ?? "o limite superior";
  return `Quando alcançar ${upper} repetições em todas as séries mantendo ${targetRir} repetições em reserva e boa técnica, aumente a menor carga disponível na próxima sessão.`;
}

function priorityCategory(priority: string): string {
  return priority === "Abdômen" ? "Abdômen e core" : priority;
}

function toWorkoutExercise(
  ex: Exercise,
  order: number,
  profile: UserProfile,
  goal: UserProfile["goal"],
): WorkoutExercise {
  const compound = isCompound(ex);
  const { sets, reps, rest } = setsRepsRest(goal, profile.experience, compound);
  const namePt = translateExerciseName(ex.name);
  const category = categoryOf(ex);
  const pattern = movementPattern(ex.name, category);
  const beginner = isBeginnerExperience(profile.experience);
  const targetRir = beginner ? 3 : goal === "strength" ? 2 : 2;
  return {
    exerciseId: ex.exerciseId,
    namePt,
    originalName: ex.name,
    gifUrl: ex.gifUrl,
    primaryMuscle: primaryMusclePt(ex),
    secondaryMuscles: (ex.secondaryMuscles || []).map(translateMuscle),
    equipment: ex.equipments.map(equipmentPt),
    movementPattern: pattern,
    sets,
    repetitions: reps,
    restSeconds: rest,
    instructions: ex.instructions || [],
    order,
    targetRir,
    tempo: compound ? "2-1-1" : "2-1-2",
    warmup: compound
      ? [
          "1 série leve de 10 a 12 repetições para praticar o movimento.",
          ...(beginner ? [] : ["1 série intermediária de 6 a 8 repetições antes da carga de trabalho."]),
        ]
      : [],
    coachingCues: coachingCuesFor(pattern),
    progressionRule: progressionRuleFor(reps, targetRir),
  };
}

export function generateWorkoutPlan(profile: UserProfile, library: Exercise[]): WorkoutPlan {
  const beginner = isBeginnerExperience(profile.experience);
  const filtered = library.filter(
    (e) =>
      equipmentAllowed(e, profile) &&
      limitationAllows(e, profile) &&
      dislikedFilter(e, profile) &&
      (!beginner || beginnerFriendlyScore(e, profile) > -10),
  );
  const division = pickDivision(profile.daysPerWeek, profile.experience);
  const exPerDay = exerciseCountForTime(profile.minutesPerSession);

  // group filtered by category
  const byCat: Record<string, Exercise[]> = {};
  for (const e of filtered) (byCat[categoryOf(e)] ||= []).push(e);
  // Prefer compounds first, deterministic ordering
  for (const c of Object.keys(byCat)) {
    byCat[c].sort((a, b) => {
      if (beginner) {
        const beginnerDifference = beginnerFriendlyScore(b, profile) - beginnerFriendlyScore(a, profile);
        if (beginnerDifference !== 0) return beginnerDifference;
      }
      const cd = Number(isCompound(b)) - Number(isCompound(a));
      if (cd !== 0) return cd;
      return a.exerciseId.localeCompare(b.exerciseId);
    });
  }

  const usedGlobal = new Set<string>(); // to avoid overusing the same exercise across days
  const days: WorkoutDay[] = division.map((tpl, dIdx) => {
    const cats = FOCUS_MAP[tpl.focus] || FOCUS_MAP["Full Body"];
    const picks: Exercise[] = [];
    const usedInDay = new Set<string>();

    // priority categories boost: add extra slot
    const neededPerCat = Math.max(1, Math.floor(exPerDay / cats.length));
    let remaining = exPerDay;

    // priority handling: if user prioritized a muscle mapped to categories, put it first
    const priorityCats = profile.priorities.map(priorityCategory);
    const prioritized = cats.filter((category) => priorityCats.includes(category));
    const regular = cats.filter((category) => !priorityCats.includes(category));
    let orderedCats = [...prioritized, ...regular];
    if (tpl.focus === "Full Body" && orderedCats.length > 0) {
      const rotation = dIdx % orderedCats.length;
      orderedCats = [...orderedCats.slice(rotation), ...orderedCats.slice(0, rotation)];
    }

    for (const cat of orderedCats) {
      if (remaining <= 0) break;
      const pool = byCat[cat] || [];
      let addedForCat = 0;
      // offset by day index to vary between sessions
      const startOffset = dIdx % Math.max(1, pool.length);
      for (let i = 0; i < pool.length && addedForCat < neededPerCat && remaining > 0; i++) {
        const ex = pool[(i + startOffset) % pool.length];
        if (usedInDay.has(ex.exerciseId)) continue;
        // avoid too-much cross-day reuse when pool has space
        if (usedGlobal.has(ex.exerciseId) && pool.length > 3 && Math.random() > -1) {
          // deterministic skip: prefer unused first
          continue;
        }
        picks.push(ex);
        usedInDay.add(ex.exerciseId);
        addedForCat++;
        remaining--;
      }
      // fallback: if not enough new picks, allow reuse
      if (addedForCat < neededPerCat) {
        for (let i = 0; i < pool.length && addedForCat < neededPerCat && remaining > 0; i++) {
          const ex = pool[(i + startOffset) % pool.length];
          if (usedInDay.has(ex.exerciseId)) continue;
          picks.push(ex);
          usedInDay.add(ex.exerciseId);
          addedForCat++;
          remaining--;
        }
      }
    }

    // top up remaining with any category if short
    if (remaining > 0) {
      for (const cat of orderedCats) {
        const pool = byCat[cat] || [];
        for (const ex of pool) {
          if (remaining <= 0) break;
          if (usedInDay.has(ex.exerciseId)) continue;
          picks.push(ex);
          usedInDay.add(ex.exerciseId);
          remaining--;
        }
        if (remaining <= 0) break;
      }
    }

    picks.forEach((e) => usedGlobal.add(e.exerciseId));

    const exercises = picks.map((ex, i) => toWorkoutExercise(ex, i + 1, profile, profile.goal));
    return {
      id: `day-${dIdx + 1}`,
      name: tpl.name,
      focus: tpl.focus,
      exercises,
      estimatedMinutes: profile.minutesPerSession,
    };
  });

  const safetyMessages: string[] = [];
  const personalConsiderations: string[] = [];
  if (profile.age < 18)
    safetyMessages.push(
      "Menor de 18 anos: recomendamos acompanhamento de um responsável e de um profissional de Educação Física.",
    );
  if (profile.hasLimitation)
    safetyMessages.push(
      "Você declarou uma limitação. Antes de iniciar, procure a liberação de um profissional de saúde e a orientação presencial de um profissional de Educação Física.",
    );
  if (profile.experience === "never_trained" && profile.daysPerWeek >= 5)
    safetyMessages.push(
      "Iniciantes se beneficiam mais de consistência e recuperação do que de alta frequência. Considere começar com menos dias por semana.",
    );
  if (profile.activityLevel === "sedentary")
    personalConsiderations.push(
      "Como sua rotina atual é mais sedentária, comece com intensidade moderada e valorize a recuperação entre as sessões.",
    );
  if (profile.additionalNotes?.trim())
    personalConsiderations.push(`Observação informada no questionário: ${profile.additionalNotes.trim()}`);

  const cardio =
    profile.includeCardio === "yes" ||
    (profile.includeCardio === "recommended" &&
      (profile.goal === "fat_loss" || profile.goal === "conditioning"))
      ? {
          frequency: profile.goal === "fat_loss" || profile.goal === "conditioning" ? 3 : 2,
          duration:
            profile.conditioning === "low" || profile.activityLevel === "sedentary"
              ? "15-25 min"
              : "20-40 min",
          intensity: "Leve a moderada",
          suggestions: ["Caminhada", "Bicicleta", "Esteira", "Elíptico"],
        }
      : undefined;

  const goalPt: Record<string, string> = {
    hypertrophy: "hipertrofia",
    fat_loss: "emagrecimento",
    recomposition: "recomposição corporal",
    strength: "força",
    conditioning: "condicionamento",
    health: "saúde e qualidade de vida",
  };
  const summary = `Plano com ${profile.daysPerWeek} sessões semanais, divisão ${division[0].focus === "Full Body" && profile.daysPerWeek <= 3 ? "Full Body" : division.map((d) => d.focus).join("/")}, ajustado para ${goalPt[profile.goal]}${profile.priorities.length ? ` com prioridade em ${profile.priorities.join(", ")}` : ""}.`;

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    profile,
    profileSummary: summary,
    division: division.map((d) => d.name).join(" • "),
    days,
    cardio,
    safetyMessages,
    personalConsiderations,
    program: {
      durationWeeks: 4,
      progressionModel: "double_progression",
      weeklyGuidance: [
        "Semana 1: conheça os exercícios e termine as séries com aproximadamente 3 repetições em reserva.",
        "Semana 2: tente acrescentar uma repetição por série mantendo a execução.",
        "Semana 3: alcance o topo da faixa de repetições antes de aumentar a carga.",
        "Semana 4: mantenha ou reduza levemente a carga se houver fadiga acumulada e revise sua evolução.",
      ],
    },
  };
}

export function replaceExerciseInPlan(
  plan: WorkoutPlan,
  dayId: string,
  exerciseId: string,
  library: Exercise[],
  replacementExerciseId?: string,
): WorkoutPlan {
  const day = plan.days.find((d) => d.id === dayId);
  if (!day) return plan;
  const current = day.exercises.find((e) => e.exerciseId === exerciseId);
  if (!current) return plan;
  const candidates = replacementCandidates(plan, dayId, exerciseId, library);

  if (candidates.length === 0) return plan;
  const replacement =
    candidates.find((candidate) => candidate.exerciseId === replacementExerciseId) || candidates[0];
  const newEx: WorkoutExercise = {
    ...toWorkoutExercise(replacement, current.order, plan.profile, plan.profile.goal),
    sets: current.sets,
    repetitions: current.repetitions,
    restSeconds: current.restSeconds,
  };
  return {
    ...plan,
    days: plan.days.map((d) =>
      d.id !== dayId
        ? d
        : {
            ...d,
            exercises: d.exercises.map((e) => (e.exerciseId === exerciseId ? newEx : e)),
          },
    ),
  };
}

export function replacementCandidates(
  plan: WorkoutPlan,
  dayId: string,
  exerciseId: string,
  library: Exercise[],
  limit = 3,
): Exercise[] {
  const day = plan.days.find((candidate) => candidate.id === dayId);
  const current = day?.exercises.find((candidate) => candidate.exerciseId === exerciseId);
  if (!day || !current) return [];
  const usedIds = new Set(day.exercises.map((exercise) => exercise.exerciseId));
  const currentCategory = current.primaryMuscle;
  const currentPattern = current.movementPattern;
  const beginner = isBeginnerExperience(plan.profile.experience);
  return library
    .filter(
      (e) =>
        equipmentAllowed(e, plan.profile) &&
        limitationAllows(e, plan.profile) &&
        dislikedFilter(e, plan.profile) &&
        (!beginner || beginnerFriendlyScore(e, plan.profile) > -10),
    )
    .filter((e) => !usedIds.has(e.exerciseId))
    .filter(
      (e) =>
        primaryMusclePt(e) === currentCategory ||
        movementPattern(e.name, categoryOf(e)) === currentPattern,
    )
    .sort(
      (a, b) =>
        beginnerFriendlyScore(b, plan.profile) - beginnerFriendlyScore(a, plan.profile) ||
        a.exerciseId.localeCompare(b.exerciseId),
    )
    .slice(0, limit);
}
