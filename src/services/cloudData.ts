import type { UserProfile, WorkoutPlan, WorkoutSession } from "@/types";
import { supabase } from "@/lib/supabase";

export async function saveProfileAndPlan(userId: string, profile: UserProfile, plan: WorkoutPlan) {
  if (!supabase) return;
  const { error: profileError } = await supabase.from("profiles").upsert({
    user_id: userId,
    profile_data: profile,
    onboarding_completed: true,
  });
  if (profileError) throw profileError;

  const { error: deactivateError } = await supabase
    .from("workout_plans")
    .update({ active: false })
    .eq("user_id", userId)
    .eq("active", true);
  if (deactivateError) throw deactivateError;

  const { error: planError } = await supabase.from("workout_plans").insert({
    user_id: userId,
    plan_data: plan,
    active: true,
  });
  if (planError) throw planError;
}

export async function loadActivePlan(userId: string): Promise<WorkoutPlan | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("workout_plans")
    .select("plan_data")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.plan_data as WorkoutPlan | undefined;
}

export async function updateActivePlan(userId: string, plan: WorkoutPlan) {
  if (!supabase) return;
  const { error } = await supabase
    .from("workout_plans")
    .update({ plan_data: plan })
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
}

export async function loadRecentSessions(userId: string): Promise<WorkoutSession[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      "id, day_id, day_name, started_at, completed_at, duration_seconds, perceived_effort, notes",
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []).map((session) => ({
    id: session.id,
    planId: "cloud",
    dayId: session.day_id,
    dayName: session.day_name,
    startedAt: session.started_at,
    completedAt: session.completed_at || undefined,
    durationSeconds: session.duration_seconds || undefined,
    perceivedEffort: session.perceived_effort || undefined,
    notes: session.notes || undefined,
    exercises: [],
  }));
}

export async function saveCompletedSession(userId: string, session: WorkoutSession) {
  if (!supabase) return;
  const { data: activePlan } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  const { data: saved, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      workout_plan_id: activePlan?.id || null,
      day_id: session.dayId,
      day_name: session.dayName,
      started_at: session.startedAt,
      completed_at: session.completedAt,
      duration_seconds: session.durationSeconds,
      perceived_effort: session.perceivedEffort,
      notes: session.notes,
    })
    .select("id")
    .single();
  if (sessionError) throw sessionError;

  const sets = session.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({
      session_id: saved.id,
      user_id: userId,
      exercise_id: exercise.exerciseId,
      exercise_name: exercise.exerciseName,
      set_number: set.setNumber,
      weight_kg: set.weightKg,
      repetitions: set.repetitions,
      rir: set.rir,
      completed: set.completed,
    })),
  );
  if (sets.length) {
    const { error: setsError } = await supabase.from("workout_set_logs").insert(sets);
    if (setsError) throw setsError;
  }
}

export async function submitSupportFeedback(
  userId: string,
  input: {
    category: "difficulty" | "exercise" | "plan" | "technical" | "other";
    rating?: number;
    message: string;
  },
) {
  if (!supabase) throw new Error("Suporte online ainda não configurado");
  const { error } = await supabase.from("support_feedback").insert({
    user_id: userId,
    category: input.category,
    rating: input.rating,
    message: input.message.trim(),
  });
  if (error) throw error;
}
