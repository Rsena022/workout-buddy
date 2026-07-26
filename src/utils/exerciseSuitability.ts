import type { Exercise, WorkoutPlan } from "@/types";

export const WORKOUT_CURATION_VERSION = 3;

/*
 * A ExerciseDB possui muitas variações atléticas, terapêuticas e pouco usuais.
 * O Forjar é voltado ao público geral, então a seleção abaixo mantém apenas
 * famílias de movimentos reconhecidas e fáceis de encontrar em academias.
 */
const COMMON_EXERCISE_PATTERNS = [
  // Peitoral
  /\bbench press\b/,
  /\bchest press\b/,
  /\bpush[- ]?up\b/,
  /\bchest fly\b/,
  /\b(?:dumbbell|cable|machine) fly\b/,
  /\bpec deck\b/,
  /\bcable cross(?:over|-over)\b/,

  // Costas
  /\blat(?:eral)? pulldown\b/,
  /\bpull[- ]?up\b/,
  /\bchin[- ]?up\b/,
  /\bcable row\b/,
  /\bbent over row\b/,
  /\bchest supported row\b/,
  /\bseated (?:cable |machine )?row\b/,
  /\b(?:barbell|dumbbell|cable|t-bar|lever|machine) row\b/,
  /\bstraight arm pulldown\b/,
  /\bpullover\b/,
  /\bshrug\b/,

  // Ombros
  /\bshoulder press\b/,
  /\boverhead press\b/,
  /\bmilitary press\b/,
  /\blateral raise\b/,
  /\bfront raise\b/,
  /\brear delt fly\b/,
  /\breverse fly\b/,
  /\breverse pec deck\b/,
  /\bface pull\b/,

  // Braços
  /\b(?:barbell|dumbbell|cable|biceps|hammer|preacher|concentration|ez bar(?:bell)?)\b.*\bcurl\b/,
  /\btriceps? pushdown\b/,
  /\btriceps? extension\b/,
  /\bfrench press\b/,
  /\bskull crusher\b/,
  /\bclose grip bench press\b/,
  /\btriceps? dip\b/,
  /\bassisted dip\b/,

  // Pernas e glúteos
  /\b(?:back|front|goblet|body ?weight|hack|smith machine|machine) squat\b/,
  /^squat$/,
  /\bleg press\b/,
  /\bleg extension\b/,
  /\bleg curl\b/,
  /\b(?:romanian |stiff leg |sumo )?deadlift\b/,
  /\b(?:walking|reverse|forward) lunge\b/,
  /^lunge$/,
  /\bstep[- ]?up\b/,
  /\bhip thrust\b/,
  /\bglute bridge\b/,
  /\bhip abduction\b/,
  /\bhip adduction\b/,
  /\bglute kickback\b/,

  // Panturrilhas
  /\bstanding calf raise\b/,
  /\bseated calf raise\b/,
  /\bcalf press\b/,
  /^calf raise$/,

  // Abdômen e condicionamento simples
  /\bcrunch\b/,
  /\bplank\b/,
  /\bsit[- ]?up\b/,
  /\bdead bug\b/,
  /\bbird dog\b/,
  /\bhanging knee raise\b/,
  /\bhanging leg raise\b/,
  /\brussian twist\b/,
  /\bmountain climber\b/,
  /\bjumping jack\b/,
  /\bcable crunch\b/,
];

/*
 * Segunda camada para variações simples que usam nomes diferentes na API.
 * Ela só é aplicada depois da lista de bloqueios e mantém famílias de
 * movimentos reconhecíveis para o público geral.
 */
const SAFE_MOVEMENT_FAMILY_PATTERN =
  /\b(?:press|row|curl|extension|raise|fly|pulldown|pull-down|pull up|pull-up|chin up|chin-up|push up|push-up|squat|lunge|deadlift|crunch|plank|sit up|sit-up|bridge|hip thrust|calf|dip|step up|step-up|abduction|adduction|shrug|pullover|face pull|mountain climber|jumping jack)\b/;

const COMMON_EQUIPMENT = new Set([
  "assisted",
  "band",
  "barbell",
  "body weight",
  "cable",
  "dumbbell",
  "ez barbell",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "resistance band",
  "sled machine",
  "smith machine",
  "weighted",
  // O plano salvo usa os nomes traduzidos para exibição. Mantê-los aqui
  // permite revalidar o treino sem confundir a tradução com um equipamento
  // desconhecido ou descartar um plano recém-gerado.
  "assistido",
  "barra",
  "barra w",
  "banco",
  "elástico",
  "halteres",
  "leg press",
  "máquina",
  "máquina smith",
  "medicine ball",
  "peso corporal",
  "polia",
]);

const UNSUITABLE_EXERCISE_PATTERNS = [
  // Movimentos técnicos, acrobáticos ou avançados.
  /\bolympic\b/,
  /\bsnatch\b/,
  /\bclean(?: and jerk)?\b/,
  /\bjerk\b/,
  /\bmuscle[- ]?up\b/,
  /\bhandstand\b/,
  /\bplanche\b/,
  /\bpistol\b/,
  /\barcher\b/,
  /\bimpossible\b/,
  /\bdragon flag\b/,
  /\bhuman flag\b/,
  /\bsissy squat\b/,
  /\bone[- ]?arm\b/,
  /\bone[- ]?leg\b/,
  /\bsingle[- ]?leg\b/,
  /\bjump squat\b/,
  /\bbox jump\b/,
  /\bdepth jump\b/,
  /\bplyometric\b/,
  /\bexplosive\b/,
  /\bburpee\b/,

  // Variações pouco usuais ou desconfortáveis para o público geral.
  /\blying rear lateral raise\b/,
  /\blying lateral raise\b/,
  /\bcable lying\b/,
  /\blying\b.*\bcurl\b/,
  /\blying\b.*\braise\b/,
  /\bclose[- ]?grip\b.*\bcurl\b/,
  /\binverse leg curl\b/,
  /\bsquatting row\b/,
  /\bkick\b/,
  /\bkneeling\b/,
  /\bstability ball\b/,
  /\bexercise ball\b/,
  /\bbosu\b/,
  /\bsuspension\b/,
  /\bdonkey\b/,
  /\bgood morning\b/,
  /\bjefferson\b/,
  /\bzercher\b/,
  /\bbehind(?: the)? neck\b/,
  /\bupward facing dog\b/,
  /\bdownward facing dog\b/,
  /\bstretch\b/,
  /\bpelvic tilt\b/,
  /\bfrog\b/,
  /\bcrab\b/,
  /\bbear crawl\b/,
  /\bspider crawl\b/,
  /\bscorpion\b/,
  /\bwindmill\b/,
  /\baround the world\b/,
  /\bcommando\b/,
  /\bpower\b/,
  /\bspider curl\b/,
  /\bzottman curl\b/,
  /\bdrag curl\b/,
  /\brenegade row\b/,
  /\bspiderman\b/,
  /\bhindu\b/,
  /\bclap push[- ]?up\b/,
  /\bneck\b/,
  /\bwrist\b/,
  /\bfinger\b/,
  /\bwheel roller\b/,
  /\broller\b/,
  /\brope climb\b/,
  /\bwalking on hands\b/,
  /\bwheel run\b/,
  /\bwheelbarrow\b/,
  /\bback lever\b/,
  /\bfront lever\b/,
  /\bside bridge\b.*\babduction\b/,
  /\bhypermobility\b/,
  /\bself assisted\b/,
  /\bpartner\b/,
];

const PREFERRED_EXERCISE_PATTERNS = [
  /\bbench press\b/,
  /\bchest press\b/,
  /\blat pulldown\b/,
  /\bseated cable row\b/,
  /\bdumbbell row\b/,
  /\bshoulder press\b/,
  /\blateral raise\b/,
  /\bface pull\b/,
  /\bbarbell curl\b/,
  /\bdumbbell curl\b/,
  /\bhammer curl\b/,
  /\btriceps? pushdown\b/,
  /\bleg press\b/,
  /\bleg extension\b/,
  /\bleg curl\b/,
  /\bgoblet squat\b/,
  /\bhip thrust\b/,
  /\bstanding calf raise\b/,
  /\bseated calf raise\b/,
  /\bcrunch\b/,
  /\bplank\b/,
];

function normalizedExerciseName(exercise: Exercise): string {
  return exercise.name.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}

export function isGeneralAudienceExerciseName(name: string): boolean {
  return isGeneralAudienceExercise({
    exerciseId: "name-check",
    name,
    gifUrl: "",
    bodyParts: [],
    targetMuscles: [],
    equipments: [],
  });
}

export function isGeneralAudienceExercise(exercise: Exercise): boolean {
  const name = normalizedExerciseName(exercise);
  if (UNSUITABLE_EXERCISE_PATTERNS.some((pattern) => pattern.test(name))) return false;
  if (COMMON_EXERCISE_PATTERNS.some((pattern) => pattern.test(name))) return true;

  const hasCommonEquipment = exercise.equipments.some((item) =>
    COMMON_EQUIPMENT.has(item.toLocaleLowerCase("en-US")),
  );
  return hasCommonEquipment && SAFE_MOVEMENT_FAMILY_PATTERN.test(name);
}

export function commonExerciseScore(exercise: Exercise): number {
  const name = normalizedExerciseName(exercise);
  let score = PREFERRED_EXERCISE_PATTERNS.some((pattern) => pattern.test(name)) ? 8 : 4;
  const equipment = exercise.equipments.map((item) => item.toLocaleLowerCase("en-US"));

  if (
    equipment.some((item) =>
      ["leverage machine", "cable", "dumbbell", "barbell", "smith machine"].includes(item),
    )
  ) {
    score += 3;
  }
  if (/\b(?:machine|seated|supported)\b/.test(name)) score += 2;
  if (/\b(?:alternate|single arm|unilateral)\b/.test(name)) score -= 1;

  return score;
}

export function isCurrentCuratedPlan(plan: WorkoutPlan): boolean {
  return (
    plan.curationVersion === WORKOUT_CURATION_VERSION &&
    plan.days.every((day) =>
      day.exercises.every((exercise) =>
        isGeneralAudienceExercise({
          exerciseId: exercise.exerciseId,
          name: exercise.originalName,
          gifUrl: exercise.gifUrl || "",
          bodyParts: [],
          targetMuscles: [exercise.primaryMuscle],
          secondaryMuscles: exercise.secondaryMuscles,
          equipments: exercise.equipment,
          instructions: exercise.instructions,
        }),
      ),
    )
  );
}
