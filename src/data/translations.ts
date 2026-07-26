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
  "bodyweight squatting row": "Remada com agachamento usando o peso corporal",
  "body weight squatting row": "Remada com agachamento usando o peso corporal",
  "inverse leg curl (on pull-up cable machine)": "Flexão inversa de joelhos na polia alta",
  "inverse leg curl on pull-up cable machine": "Flexão inversa de joelhos na polia alta",
  "resistance band seated chest press": "Supino sentado com elástico",
  "seated calf stretch (male)": "Alongamento de panturrilha sentado",
  "seated calf stretch (female)": "Alongamento de panturrilha sentado",
  "dumbbell bench seated press": "Desenvolvimento sentado com halteres",
  "dumbbell seated bent over triceps extension": "Extensão de tríceps sentado com halteres",
  "cable lateral pulldown with v-bar": "Puxada lateral na polia com barra V",
  "lever lying leg curl": "Mesa flexora na máquina articulada",
  "standing calf raise (on a staircase)": "Elevação de panturrilha em pé no degrau",
  "dumbbell lying rear lateral raise": "Elevação lateral posterior deitado com halteres",
  "cable lying close-grip curl": "Rosca direta deitado na polia com pegada fechada",
  "bodyweight incline side plank": "Prancha lateral inclinada com peso corporal",
  "bent knee lying twist (male)": "Rotação de tronco deitado com joelhos flexionados",
  "bent knee lying twist (female)": "Rotação de tronco deitado com joelhos flexionados",
  "dumbbell single leg calf raise": "Elevação unilateral de panturrilha com halter",
  "dumbbell alternate seated hammer curl": "Rosca martelo alternada sentada com halteres",
  "hanging straight leg raise": "Elevação de pernas estendidas na barra fixa",
  "dumbbell decline hammer press": "Supino declinado com halteres em pegada neutra",
  "lever reverse grip lateral pulldown": "Puxada alta na máquina articulada com pegada supinada",
  "lever seated row": "Remada sentada na máquina articulada",
  "lever narrow grip seated row": "Remada sentada na máquina articulada com pegada fechada",
  "cable seated row": "Remada sentada na polia",
  "cable seated row with reverse grip": "Remada sentada na polia com pegada supinada",
  "cable rope elevated seated row": "Remada alta sentada na polia com corda",
  "cable lat pulldown (pro lat bar)": "Puxada alta na polia com barra longa",
  "lever seated dip": "Mergulho sentado na máquina articulada",
  "dumbbell palms in incline bench press": "Supino inclinado com halteres e pegada neutra",
  "dumbbell decline bench press": "Supino declinado com halteres",
  "cable decline press": "Supino declinado na polia",
  "dumbbell full can lateral raise": "Elevação lateral completa com halteres",
  "lever lateral raise": "Elevação lateral na máquina articulada",
  "dumbbell lateral raise": "Elevação lateral com halteres",
  "dumbbell incline shoulder raise": "Elevação de ombros inclinada com halteres",
};

const exerciseTermMap: [string, string][] = [
  ["pull-up cable machine", "polia alta"],
  ["pull up cable machine", "polia alta"],
  ["smith machine", "máquina Smith"],
  ["leverage machine", "máquina articulada"],
  ["rear lateral raise", "elevação lateral posterior"],
  ["straight leg raise", "elevação de pernas estendidas"],
  ["lateral pulldown", "puxada lateral"],
  ["side plank", "prancha lateral"],
  ["calf raise", "elevação de panturrilha"],
  ["hammer curl", "rosca martelo"],
  ["hammer press", "pressão com pegada neutra"],
  ["leg extension", "cadeira extensora"],
  ["leg curl", "flexão de joelhos"],
  ["chest press", "supino"],
  ["shoulder press", "desenvolvimento de ombros"],
  ["resistance band", "elástico"],
  ["bent over", "inclinado"],
  ["squatting", "com agachamento"],
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
  ["lever", "máquina articulada"],
  ["machine", "máquina"],
  ["band", "elástico"],
  ["standing", "em pé"],
  ["seated", "sentado"],
  ["lying", "deitado"],
  ["kneeling", "ajoelhado"],
  ["incline", "inclinado"],
  ["decline", "declinado"],
  ["reverse", "invertido"],
  ["inverse", "invertido"],
  ["alternating", "alternado"],
  ["assisted", "assistido"],
  ["wide grip", "pegada aberta"],
  ["close grip", "pegada fechada"],
  ["neutral grip", "pegada neutra"],
  ["row", "remada"],
  ["curl", "rosca"],
  ["extension", "extensão"],
  ["raise", "elevação"],
  ["fly", "crucifixo"],
  ["squat", "agachamento"],
  ["press", "pressão"],
  ["stretch", "alongamento"],
  ["leg", "perna"],
  ["calf", "panturrilha"],
  ["arm", "braço"],
  ["triceps", "tríceps"],
  ["biceps", "bíceps"],
  ["bench", "banco"],
  ["v-bar", "barra V"],
  ["staircase", "degrau"],
  ["grip", "pegada"],
  ["high", "alto"],
  ["low", "baixo"],
  ["with", "com"],
  ["without", "sem"],
  ["male", ""],
  ["female", ""],
];

export function toTitle(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSentenceCase(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return normalized;
  return normalized.charAt(0).toLocaleUpperCase("pt-BR") + normalized.slice(1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function equipmentSuffix(key: string): string {
  if (/\bez barbell\b|\bez bar\b/.test(key)) return "com barra W";
  if (/\bbarbell\b/.test(key)) return "com barra";
  if (/\bdumbbell\b/.test(key)) return "com halteres";
  if (/\bkettlebell\b/.test(key)) return "com kettlebell";
  if (/\bresistance band\b|\bband\b/.test(key)) return "com elástico";
  if (/\bcable\b/.test(key)) return "na polia";
  if (/\bsmith machine\b/.test(key)) return "na máquina Smith";
  if (/\bleverage machine\b|\blever\b/.test(key)) return "na máquina articulada";
  if (/\bmachine\b/.test(key)) return "na máquina";
  if (/\bbody ?weight\b/.test(key)) return "com peso corporal";
  return "";
}

function gripSuffix(key: string): string {
  if (/\bpalms in\b|\bneutral grip\b|\bhammer\b/.test(key)) return "com pegada neutra";
  if (/\breverse grip\b|\bunderhand\b|\bsupinated\b/.test(key)) {
    return "com pegada supinada";
  }
  if (/\boverhand\b|\bpronated\b/.test(key)) return "com pegada pronada";
  if (/\bclose grip\b|\bnarrow grip\b/.test(key)) return "com pegada fechada";
  if (/\bwide grip\b/.test(key)) return "com pegada aberta";
  return "";
}

function attachmentSuffix(key: string): string {
  if (/\brope\b/.test(key)) return "com corda";
  if (/\bv-bar\b/.test(key)) return "com barra V";
  if (/\bstraight bar\b/.test(key)) return "com barra reta";
  if (/\bpro lat bar\b/.test(key)) return "com barra longa";
  return "";
}

function joinExerciseName(base: string, ...details: string[]): string {
  const uniqueDetails = details.filter(
    (detail, index, all) => detail && all.indexOf(detail) === index,
  );
  return toSentenceCase([base, ...uniqueDetails].join(" "));
}

function naturalExerciseTranslation(key: string): string | undefined {
  const equipment = equipmentSuffix(key);
  const grip = gripSuffix(key);
  const attachment = attachmentSuffix(key);
  const unilateral = /\b(?:single|one)[- ]arm\b|\bunilateral\b/.test(key) ? "unilateral" : "";

  if (/\blat(?:eral)? pulldown\b|\bpulldown\b|\bpull-down\b/.test(key)) {
    return joinExerciseName("Puxada alta", equipment, grip, attachment, unilateral);
  }

  if (/\brow\b/.test(key)) {
    const variation = /\bseated\b/.test(key)
      ? "Remada sentada"
      : /\bbent over\b/.test(key)
        ? "Remada curvada"
        : /\bupright\b|\belevated\b/.test(key)
          ? "Remada alta"
          : "Remada";
    const support = /\bchest supported\b/.test(key) ? "com apoio no peito" : "";
    return joinExerciseName(variation, equipment, support, grip, attachment, unilateral);
  }

  if (/\bbench press\b|\bchest press\b/.test(key)) {
    const variation = /\bincline\b/.test(key)
      ? "Supino inclinado"
      : /\bdecline\b/.test(key)
        ? "Supino declinado"
        : /\bseated\b/.test(key)
          ? "Supino sentado"
          : "Supino reto";
    return joinExerciseName(variation, equipment, grip, attachment, unilateral);
  }

  if (/\bshoulder press\b|\boverhead press\b|\bmilitary press\b/.test(key)) {
    const position = /\bseated\b/.test(key) ? "sentado" : /\bstanding\b/.test(key) ? "em pé" : "";
    return joinExerciseName("Desenvolvimento de ombros", position, equipment, grip, unilateral);
  }

  if (/\blateral raise\b/.test(key)) {
    const position = /\bseated\b/.test(key)
      ? "sentada"
      : /\bincline\b/.test(key)
        ? "inclinada"
        : "";
    const posterior = /\brear\b/.test(key) ? "posterior" : "";
    return joinExerciseName("Elevação lateral", posterior, position, equipment, unilateral);
  }

  if (/\bfront raise\b/.test(key)) {
    return joinExerciseName("Elevação frontal", equipment, grip, unilateral);
  }

  if (/\brear delt fly\b|\breverse fly\b|\breverse pec deck\b/.test(key)) {
    return joinExerciseName("Crucifixo invertido", equipment, grip, unilateral);
  }

  if (/\bface pull\b/.test(key)) {
    return joinExerciseName("Face pull", equipment || "na polia", attachment);
  }

  if (/\bcurl\b/.test(key)) {
    const base = /\bhammer\b/.test(key)
      ? "Rosca martelo"
      : /\bpreacher\b/.test(key)
        ? "Rosca Scott"
        : /\bconcentration\b/.test(key)
          ? "Rosca concentrada"
          : "Rosca direta";
    const position = /\bseated\b/.test(key) ? "sentada" : /\bstanding\b/.test(key) ? "em pé" : "";
    const alternating = /\balternat(?:e|ing)\b/.test(key) ? "alternada" : "";
    const curlGrip = /\bhammer\b/.test(key) ? "" : grip;
    return joinExerciseName(base, alternating, position, equipment, curlGrip, unilateral);
  }

  if (/\btriceps? pushdown\b|\bpush-down\b/.test(key)) {
    return joinExerciseName("Tríceps na polia", attachment, grip, unilateral);
  }

  if (/\btriceps? extension\b|\bfrench press\b|\bskull crusher\b/.test(key)) {
    const position = /\bseated\b/.test(key) ? "sentada" : /\bstanding\b/.test(key) ? "em pé" : "";
    return joinExerciseName("Extensão de tríceps", position, equipment, attachment, unilateral);
  }

  if (/\bleg press\b/.test(key)) return joinExerciseName("Leg press", equipment);
  if (/\bleg extension\b/.test(key)) return joinExerciseName("Cadeira extensora", equipment);
  if (/\bleg curl\b/.test(key)) {
    const base = /\bseated\b/.test(key) ? "Cadeira flexora" : "Mesa flexora";
    return joinExerciseName(base, equipment);
  }

  if (/\bsquat\b/.test(key)) {
    const variation = /\bgoblet\b/.test(key)
      ? "Agachamento goblet"
      : /\bfront\b/.test(key)
        ? "Agachamento frontal"
        : /\bhack\b/.test(key)
          ? "Agachamento hack"
          : "Agachamento";
    return joinExerciseName(variation, equipment);
  }

  if (/\bdeadlift\b/.test(key)) {
    const variation = /\bromanian\b/.test(key)
      ? "Levantamento terra romeno"
      : /\bsumo\b/.test(key)
        ? "Levantamento terra sumô"
        : "Levantamento terra";
    return joinExerciseName(variation, equipment);
  }

  if (/\blunge\b/.test(key)) {
    const variation = /\bwalking\b/.test(key)
      ? "Avanço caminhando"
      : /\breverse\b/.test(key)
        ? "Avanço reverso"
        : "Avanço";
    return joinExerciseName(variation, equipment);
  }

  if (/\bhip thrust\b/.test(key)) return joinExerciseName("Elevação pélvica", equipment);
  if (/\bglute bridge\b/.test(key)) return joinExerciseName("Ponte para glúteos", equipment);
  if (/\bhip abduction\b/.test(key)) return joinExerciseName("Abdução de quadril", equipment);
  if (/\bhip adduction\b/.test(key)) return joinExerciseName("Adução de quadril", equipment);
  if (/\bglute kickback\b/.test(key)) return joinExerciseName("Coice para glúteos", equipment);

  if (/\bcalf raise\b|\bcalf press\b/.test(key)) {
    const position = /\bseated\b/.test(key) ? "sentada" : /\bstanding\b/.test(key) ? "em pé" : "";
    return joinExerciseName("Elevação de panturrilha", position, equipment, unilateral);
  }

  if (/\bpush[- ]?up\b/.test(key)) return joinExerciseName("Flexão de braço", grip);
  if (/\bpull[- ]?up\b/.test(key)) return joinExerciseName("Barra fixa", grip);
  if (/\bchin[- ]?up\b/.test(key)) return "Barra fixa com pegada supinada";
  if (/\bdip\b/.test(key)) return joinExerciseName("Mergulho", equipment);
  if (/\bcrunch\b/.test(key)) return joinExerciseName("Abdominal", equipment);
  if (/\bplank\b/.test(key)) return joinExerciseName("Prancha", equipment);
  if (/\bsit[- ]?up\b/.test(key)) return "Abdominal completo";
  if (/\bmountain climber\b/.test(key)) return "Escalador";
  if (/\bjumping jack\b/.test(key)) return "Polichinelo";

  return undefined;
}

export function translateExerciseName(originalName: string): string {
  const key = originalName.normalize("NFKC").toLocaleLowerCase("en-US").trim().replace(/\s+/g, " ");
  if (exerciseNameMap[key]) return exerciseNameMap[key];
  const naturalTranslation = naturalExerciseTranslation(key);
  if (naturalTranslation) return naturalTranslation;

  let translated = key;
  for (const [source, target] of exerciseTermMap) {
    const pattern = new RegExp(`\\b${escapeRegExp(source).replaceAll("\\ ", "\\s+")}\\b`, "gi");
    translated = translated.replace(pattern, target);
  }

  translated = translated
    .replace(/\(\s*on\s+/gi, "(na ")
    .replace(/\(\s*with\s+/gi, "(com ")
    .replace(/\bon\b/gi, "na")
    .replace(/\bthe\b/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return toSentenceCase(translated);
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
