import { getSupabaseClient } from './supabase';
import type { WorkoutPlan, WorkoutPlanInput } from '../types';

const TABLE_NAME = 'workout_plans';

export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workout plans:', error);
    return [];
  }

  return data || [];
}

export async function getWorkoutPlanById(id: string): Promise<WorkoutPlan | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching workout plan:', error);
    return null;
  }

  return data;
}

export async function createWorkoutPlan(plan: WorkoutPlanInput): Promise<WorkoutPlan | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(plan)
    .select()
    .single();

  if (error) {
    console.error('Error creating workout plan:', error);
    return null;
  }

  return data;
}
