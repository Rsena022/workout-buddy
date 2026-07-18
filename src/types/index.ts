export interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles?: string[];
  equipments: string[];
  instructions?: string[];
}

export interface UserProfile {
  sex: "male" | "female" | "not_informed";
  age: number;
  heightCm: number;
  weightKg: number;
  goal: "hypertrophy" | "fat_loss" | "recomposition" | "strength" | "conditioning" | "health";
  experience: "never_trained" | "returning" | "under_six_months" | "six_to_twelve_months" | "over_one_year";
  location: "full_gym" | "basic_gym" | "home_equipment" | "home_no_equipment";
  equipment: string[];
  daysPerWeek: number;
  minutesPerSession: number;
  hasLimitation: boolean;
  limitations: string[];
  limitationNotes?: string;
  priorities: string[];
  includeCardio: "yes" | "no" | "recommended";
  dislikedExercises?: string;
  conditioning: "low" | "regular" | "good" | "very_good";
  additionalNotes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  namePt: string;
  originalName: string;
  gifUrl?: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  movementPattern: string;
  sets: number;
  repetitions: string;
  restSeconds: number;
  instructions: string[];
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
}

export interface WorkoutPlan {
  id: string;
  createdAt: string;
  profile: UserProfile;
  profileSummary: string;
  division: string;
  days: WorkoutDay[];
  cardio?: {
    frequency: number;
    duration: string;
    intensity: string;
    suggestions: string[];
  };
  safetyMessages: string[];
}

export interface WorkoutProgress {
  // key: `${dayId}:${exerciseId}` -> completed
  completed: Record<string, boolean>;
  updatedAt: string;
}

export interface StoredData {
  version: number;
  profile?: UserProfile;
  workoutPlan?: WorkoutPlan;
  progress?: WorkoutProgress;
  exerciseLibrary?: Exercise[];
  libraryFetchedAt?: string;
}
