// Map ExerciseDB bodyParts to Portuguese categories
export const bodyPartMap: Record<string, string> = {
  chest: "Peitoral",
  back: "Costas",
  shoulders: "Ombros",
  "upper arms": "Braços",
  "lower arms": "Antebraços",
  "upper legs": "Pernas",
  "lower legs": "Panturrilhas",
  waist: "Abdômen e core",
  cardio: "Condicionamento",
  neck: "Pescoço",
};

// Target muscle -> normalized muscle group in PT
export const muscleMap: Record<string, string> = {
  pectorals: "Peitoral",
  "serratus anterior": "Peitoral",
  lats: "Costas",
  "upper back": "Costas",
  traps: "Trapézio",
  spine: "Costas",
  delts: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebraços",
  quads: "Quadríceps",
  hamstrings: "Posteriores de coxa",
  glutes: "Glúteos",
  adductors: "Adutores",
  abductors: "Abdutores",
  calves: "Panturrilhas",
  abs: "Abdômen",
  obliques: "Oblíquos",
  "hip flexors": "Flexores do quadril",
  "levator scapulae": "Pescoço",
};

// Category for library quotas
export const bodyPartToCategory: Record<string, string> = {
  chest: "Peitoral",
  back: "Costas",
  shoulders: "Ombros",
  "upper arms": "Braços",
  "lower arms": "Antebraços",
  "upper legs": "Pernas",
  "lower legs": "Panturrilhas",
  waist: "Abdômen e core",
  cardio: "Condicionamento",
};

// Approximate PT name dictionary (best-effort; falls back to original)
export const exerciseNameMap: Record<string, string> = {
  "barbell bench press": "Supino reto com barra",
  "dumbbell bench press": "Supino reto com halteres",
  "incline barbell bench press": "Supino inclinado com barra",
  "incline dumbbell press": "Supino inclinado com halteres",
  "push-up": "Flexão de braço",
  "push up": "Flexão de braço",
  "cable crossover": "Crossover no cabo",
  "dumbbell fly": "Crucifixo com halteres",
  "chest dip": "Mergulho para peito",
  "pull-up": "Barra fixa",
  "pull up": "Barra fixa",
  "chin-up": "Barra fixa supinada",
  "lat pulldown": "Puxada alta",
  "cable row": "Remada baixa no cabo",
  "seated cable row": "Remada baixa sentada",
  "bent over row": "Remada curvada",
  "barbell row": "Remada com barra",
  "dumbbell row": "Remada com halter",
  "t-bar row": "Remada cavalinho",
  deadlift: "Levantamento terra",
  "romanian deadlift": "Terra romeno",
  "overhead press": "Desenvolvimento militar",
  "military press": "Desenvolvimento militar",
  "dumbbell shoulder press": "Desenvolvimento com halteres",
  "lateral raise": "Elevação lateral",
  "front raise": "Elevação frontal",
  "rear delt fly": "Crucifixo invertido",
  "face pull": "Face pull",
  "barbell curl": "Rosca direta com barra",
  "dumbbell curl": "Rosca alternada com halteres",
  "hammer curl": "Rosca martelo",
  "preacher curl": "Rosca scott",
  "tricep pushdown": "Tríceps na polia",
  "triceps pushdown": "Tríceps na polia",
  "skull crusher": "Tríceps testa",
  "tricep dip": "Mergulho para tríceps",
  "close grip bench press": "Supino pegada fechada",
  squat: "Agachamento",
  "back squat": "Agachamento livre",
  "front squat": "Agachamento frontal",
  "goblet squat": "Agachamento goblet",
  lunge: "Avanço",
  "walking lunge": "Avanço caminhando",
  "bulgarian split squat": "Agachamento búlgaro",
  "leg press": "Leg press",
  "leg extension": "Cadeira extensora",
  "leg curl": "Mesa flexora",
  "hip thrust": "Elevação pélvica",
  "glute bridge": "Ponte para glúteos",
  "calf raise": "Elevação de panturrilha",
  "standing calf raise": "Panturrilha em pé",
  "seated calf raise": "Panturrilha sentado",
  crunch: "Abdominal",
  "sit up": "Abdominal completo",
  "hanging leg raise": "Elevação de pernas na barra",
  "hanging knee raise": "Elevação de joelhos na barra",
  plank: "Prancha",
  "russian twist": "Torção russa",
  "mountain climber": "Escalador",
  burpee: "Burpee",
  "jumping jack": "Polichinelo",
};

export function toTitle(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function translateExerciseName(originalName: string): string {
  const key = originalName.toLowerCase().trim();
  if (exerciseNameMap[key]) return exerciseNameMap[key];
  return toTitle(originalName);
}

export function primaryMusclePt(ex: { targetMuscles?: string[]; bodyParts: string[] }): string {
  const t = ex.targetMuscles?.[0]?.toLowerCase();
  if (t && muscleMap[t]) return muscleMap[t];
  const bp = ex.bodyParts?.[0]?.toLowerCase();
  if (bp && bodyPartMap[bp]) return bodyPartMap[bp];
  return toTitle(t || bp || "Geral");
}

export function categoryOf(ex: { bodyParts: string[]; targetMuscles?: string[] }): string {
  const bp = ex.bodyParts?.[0]?.toLowerCase();
  if (bp && bodyPartToCategory[bp]) {
    // split upper arms into biceps/triceps? keep simpler at "Braços"
    return bodyPartToCategory[bp];
  }
  return "Outros";
}

export function equipmentPt(eq: string): string {
  const map: Record<string, string> = {
    "body weight": "Peso corporal",
    barbell: "Barra",
    dumbbell: "Halteres",
    cable: "Polia",
    "leverage machine": "Máquina",
    "sled machine": "Leg press",
    smith: "Máquina Smith",
    "smith machine": "Máquina Smith",
    "ez barbell": "Barra W",
    "olympic barbell": "Barra olímpica",
    kettlebell: "Kettlebell",
    "medicine ball": "Medicine ball",
    "stability ball": "Bola suíça",
    "resistance band": "Elástico",
    band: "Elástico",
    rope: "Corda",
    "roller": "Rolo",
    assisted: "Assistido",
    bench: "Banco",
  };
  const k = eq.toLowerCase().trim();
  return map[k] || toTitle(eq);
}
