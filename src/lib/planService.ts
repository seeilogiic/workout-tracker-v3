import { getSupabaseClient } from './supabase';

type WeeklySchedule = Record<string, string>;
type DayTemplates = Record<string, unknown>;

export interface WorkoutPlan {
  id: string;
  user_id?: string;
  name: string;
  weekly_schedule: WeeklySchedule;
  day_templates: DayTemplates;
  created_at?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validatePlan(planJson: Record<string, unknown>): { valid: boolean; error?: string } {
  const name = planJson.name;
  const weeklySchedule = planJson.weekly_schedule as unknown;
  const dayTemplates = planJson.day_templates as unknown;

  if (typeof name !== 'string' || name.trim() === '') {
    return { valid: false, error: 'Workout plan name is required.' };
  }

  if (!isObject(weeklySchedule)) {
    return { valid: false, error: 'weekly_schedule must be an object.' };
  }

  if (!isObject(dayTemplates)) {
    return { valid: false, error: 'day_templates must be an object.' };
  }

  const scheduleKeys = Object.keys(weeklySchedule as WeeklySchedule);
  for (const day of scheduleKeys) {
    const templateKey = (weeklySchedule as WeeklySchedule)[day];
    if (typeof templateKey !== 'string' || !(templateKey in (dayTemplates as DayTemplates))) {
      return { valid: false, error: `weekly_schedule references missing template for day: ${day}` };
    }
  }

  return { valid: true };
}

export function mapWeeklyScheduleToTemplate(
  weeklySchedule: WeeklySchedule,
  dayTemplates: DayTemplates,
  day: string
) {
  const templateKey = weeklySchedule?.[day];
  if (!templateKey) {
    return null;
  }

  return dayTemplates?.[templateKey] ?? null;
}

export async function createWorkoutPlan(planJson: Record<string, unknown>): Promise<WorkoutPlan | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { valid, error } = validatePlan(planJson);
  if (!valid) {
    console.error('Invalid workout plan:', error);
    return null;
  }

  try {
    const { data, error: insertError } = await supabase
      .from('workout_plans')
      .insert(planJson)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating workout plan:', insertError);
      return null;
    }

    return data as WorkoutPlan;
  } catch (err) {
    console.error('Error creating workout plan:', err);
    return null;
  }
}

export async function listWorkoutPlans(userId?: string): Promise<WorkoutPlan[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase.from('workout_plans').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing workout plans:', error);
      return [];
    }

    return (data as WorkoutPlan[]) || [];
  } catch (error) {
    console.error('Error listing workout plans:', error);
    return [];
  }
}

export async function getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching workout plan:', error);
      }
      return null;
    }

    return data as WorkoutPlan;
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return null;
  }
}
