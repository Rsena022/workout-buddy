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
  sex?: "male" | "female" | "not_informed";
  age: number;
  heightCm?: number;
  weightKg?: number;
  trainingStyle: "guided" | "machines" | "free_weights" | "bodyweight" | "mixed";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  goal: "hypertrophy" | "fat_loss" | "recomposition" | "strength" | "conditioning" | "health";
  experience:
    "never_trained" | "returning" | "under_six_months" | "six_to_twelve_months" | "over_one_year";
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
  targetRir?: number;
  tempo?: string;
  warmup?: string[];
  coachingCues?: string[];
  progressionRule?: string;
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
  personalConsiderations?: string[];
  program?: {
    durationWeeks: number;
    progressionModel: "double_progression";
    weeklyGuidance: string[];
  };
}

export interface WorkoutSetPerformance {
  setNumber: number;
  weightKg?: number;
  repetitions?: number;
  rir?: number;
  completed: boolean;
}

export interface WorkoutExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSetPerformance[];
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  perceivedEffort?: number;
  notes?: string;
  exercises: WorkoutExercisePerformance[];
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
  exerciseLibraryVersion?: number;
  sessions?: WorkoutSession[];
  activeSession?: WorkoutSession;
  cloudMigrationCompleted?: boolean;
}
