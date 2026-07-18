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
  "ez bar standing french press": "Tríceps francês em pé com barra W",
  "cable cross-over variation": "Crossover na polia",
  "upward facing dog": "Postura do cachorro olhando para cima",
  "pull up (neutral grip)": "Barra fixa com pegada neutra",
  "impossible dips": "Mergulho avançado nas paralelas",
  "push-up inside leg kick": "Flexão de braço com chute interno",
  "barbell seated bradford rocky press": "Desenvolvimento Bradford sentado com barra",
  "hip raise (bent knee)": "Elevação de quadril com joelhos flexionados",
};

const exerciseTermMap: [string, string][] = [
  ["ez barbell", "barra W"],
  ["ez bar", "barra W"],
  ["body weight", "peso corporal"],
  ["bodyweight", "peso corporal"],
  ["single arm", "unilateral"],
  ["one arm", "unilateral"],
  ["pull-up", "barra fixa"],
  ["pull up", "barra fixa"],
  ["push-up", "flexão de braço"],
  ["push up", "flexão de braço"],
  ["pulldown", "puxada alta"],
  ["barbell", "barra"],
  ["dumbbell", "halter"],
  ["kettlebell", "kettlebell"],
  ["cable", "polia"],
  ["machine", "máquina"],
  ["band", "elástico"],
  ["standing", "em pé"],
  ["seated", "sentado"],
  ["lying", "deitado"],
  ["incline", "inclinado"],
  ["decline", "declinado"],
  ["reverse", "invertido"],
  ["alternating", "alternado"],
  ["row", "remada"],
  ["curl", "rosca"],
  ["extension", "extensão"],
  ["raise", "elevação"],
  ["fly", "crucifixo"],
  ["squat", "agachamento"],
  ["press", "pressão"],
  ["stretch", "alongamento"],
  ["with", "com"],
];

export function toTitle(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function translateExerciseName(originalName: string): string {
  const key = originalName.toLowerCase().trim();
  if (exerciseNameMap[key]) return exerciseNameMap[key];
  let translated = key;
  for (const [source, target] of exerciseTermMap) {
    translated = translated.replaceAll(source, target);
  }
  return toTitle(translated);
}

export function translateMuscle(muscle: string): string {
  const key = muscle.toLowerCase().trim();
  return muscleMap[key] || bodyPartMap[key] || toTitle(muscle);
}

export function portugueseInstructions(exercise: {
  namePt: string;
  movementPattern: string;
  equipment: string[];
}): string[] {
  const equipment = exercise.equipment.length
    ? exercise.equipment.join(", ")
    : "o equipamento indicado";
  const setup = `Prepare ${equipment} e adote uma posição estável antes de iniciar ${exercise.namePt.toLowerCase()}.`;
  const patterns: Record<string, string[]> = {
    "Empurrar horizontal": [
      "Mantenha o peito aberto, as escápulas firmes e os pés bem apoiados.",
      "Desça a carga de forma controlada até uma amplitude confortável.",
      "Empurre sem travar bruscamente os cotovelos e retorne devagar.",
    ],
    "Empurrar vertical": [
      "Mantenha o abdômen contraído e evite arquear a região lombar.",
      "Empurre a carga acima da cabeça com movimento controlado.",
      "Retorne até a posição inicial sem deixar a carga despencar.",
    ],
    "Puxar horizontal": [
      "Mantenha a coluna neutra e o peito aberto durante todo o movimento.",
      "Puxe levando os cotovelos para trás e aproxime as escápulas.",
      "Estenda os braços novamente de forma lenta e controlada.",
    ],
    "Puxar vertical": [
      "Mantenha o tronco firme e os ombros afastados das orelhas.",
      "Puxe conduzindo os cotovelos para baixo, sem usar impulso.",
      "Retorne devagar até alongar a musculatura das costas.",
    ],
    Agachamento: [
      "Mantenha os pés firmes, o abdômen contraído e a coluna neutra.",
      "Flexione quadris e joelhos dentro de uma amplitude confortável.",
      "Empurre o chão para retornar, mantendo os joelhos alinhados aos pés.",
    ],
    "Extensão de quadril": [
      "Mantenha a coluna neutra e inicie o movimento levando o quadril para trás.",
      "Contraia glúteos e posteriores da coxa para estender o quadril.",
      "Retorne lentamente sem perder o controle do tronco.",
    ],
    "Flexão de joelhos": [
      "Ajuste o equipamento para que os joelhos fiquem alinhados ao eixo do movimento.",
      "Flexione os joelhos de forma controlada, sem retirar o quadril do apoio.",
      "Retorne lentamente até quase estender as pernas.",
    ],
    "Extensão de joelhos": [
      "Ajuste o equipamento e mantenha as costas apoiadas.",
      "Estenda os joelhos sem usar impulso e sem travá-los bruscamente.",
      "Retorne de forma lenta até a posição inicial.",
    ],
    "Flexão de cotovelos": [
      "Mantenha os cotovelos próximos ao corpo e os punhos alinhados.",
      "Flexione os cotovelos sem balançar o tronco.",
      "Desça a carga lentamente até estender os braços com controle.",
    ],
    "Extensão de cotovelos": [
      "Mantenha os cotovelos estáveis e os ombros relaxados.",
      "Estenda os braços usando a força dos tríceps, sem impulso.",
      "Retorne devagar até uma amplitude confortável.",
    ],
    "Elevação de panturrilha": [
      "Mantenha o corpo estável e apoie bem a parte da frente dos pés.",
      "Eleve os calcanhares e contraia as panturrilhas no alto.",
      "Desça lentamente até sentir um alongamento confortável.",
    ],
    Core: [
      "Mantenha o abdômen contraído e a coluna em posição confortável.",
      "Execute o movimento sem puxar o pescoço e sem usar impulso.",
      "Respire normalmente e interrompa a série se perder a postura.",
    ],
  };
  return [
    setup,
    ...(patterns[exercise.movementPattern] || [
      "Mantenha a postura estável e as articulações alinhadas.",
      "Execute cada repetição lentamente, sem usar impulso.",
      "Retorne à posição inicial com controle e respire normalmente.",
    ]),
    "Use uma carga leve no início e interrompa o exercício se sentir dor articular.",
  ];
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
    roller: "Rolo",
    assisted: "Assistido",
    bench: "Banco",
  };
  const k = eq.toLowerCase().trim();
  return map[k] || toTitle(eq);
}
