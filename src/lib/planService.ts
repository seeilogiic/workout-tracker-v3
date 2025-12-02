import type { DayTemplate, ExerciseTemplate, WorkoutPlan } from '../types';

export const demoPlan: WorkoutPlan = {
  id: 'push-pull-legs-v1',
  name: 'Push/Pull/Legs Preview',
  description: 'Starter schedule to validate plan typing and template lookups.',
  durationWeeks: 4,
  metadata: { source: 'demo-plan' },
  schedule: {
    monday: { dayTemplateId: 'push' },
    wednesday: { dayTemplateId: 'pull' },
    friday: { dayTemplateId: 'legs' },
  },
  dayTemplates: [
    {
      id: 'push',
      key: 'push',
      name: 'Push Day',
      focus: 'Push',
      notes: 'Chest, shoulders, and triceps focus.',
      exercises: [
        {
          id: 'bench-press',
          name: 'Barbell Bench Press',
          equipment: 'bar',
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps', 'shoulders'],
          sets: [
            { targetReps: 8, targetWeight: null, rir: 2 },
            { targetReps: 8, targetWeight: null, rir: 2 },
            { targetReps: 8, targetWeight: null, rir: 2 },
          ],
        },
        {
          id: 'overhead-press',
          name: 'Dumbbell Overhead Press',
          equipment: 'dumbbell',
          primaryMuscles: ['shoulders'],
          secondaryMuscles: ['triceps'],
          sets: [
            { targetReps: 10, targetWeight: null, rir: 2 },
            { targetReps: 10, targetWeight: null, rir: 2 },
          ],
        },
      ],
    },
    {
      id: 'pull',
      key: 'pull',
      name: 'Pull Day',
      focus: 'Pull',
      notes: 'Back and biceps focus.',
      exercises: [
        {
          id: 'row',
          name: 'Seated Cable Row',
          equipment: 'cable',
          primaryMuscles: ['back'],
          secondaryMuscles: ['biceps'],
          sets: [
            { targetReps: 12, targetWeight: null, rir: 2 },
            { targetReps: 12, targetWeight: null, rir: 2 },
          ],
        },
        {
          id: 'pulldown',
          name: 'Lat Pulldown',
          equipment: 'machine',
          primaryMuscles: ['back'],
          secondaryMuscles: ['biceps'],
          sets: [
            { targetReps: 10, targetWeight: null, rir: 2 },
            { targetReps: 10, targetWeight: null, rir: 2 },
          ],
        },
      ],
    },
    {
      id: 'legs',
      key: 'legs',
      name: 'Leg Day',
      focus: 'Legs',
      notes: 'Lower body compound and accessory work.',
      exercises: [
        {
          id: 'squat',
          name: 'Back Squat',
          equipment: 'bar',
          primaryMuscles: ['quads'],
          secondaryMuscles: ['glutes', 'core'],
          sets: [
            { targetReps: 6, targetWeight: null, rir: 2 },
            { targetReps: 6, targetWeight: null, rir: 2 },
            { targetReps: 6, targetWeight: null, rir: 2 },
          ],
        },
        {
          id: 'rdl',
          name: 'Romanian Deadlift',
          equipment: 'bar',
          primaryMuscles: ['hamstrings'],
          secondaryMuscles: ['glutes'],
          sets: [
            { targetReps: 10, targetWeight: null, rir: 2 },
            { targetReps: 10, targetWeight: null, rir: 2 },
          ],
        },
      ],
    },
  ],
};

export function getDayTemplateForSchedule(plan: WorkoutPlan, dayKey: string): DayTemplate | null {
  const scheduledDay = plan.schedule[dayKey];

  if (!scheduledDay) {
    return null;
  }

  const matchingTemplate = plan.dayTemplates.find((template) => template.id === scheduledDay.dayTemplateId);
  return matchingTemplate ?? null;
}

export function validatePlanSchedule(plan: WorkoutPlan): string[] {
  const errors: string[] = [];

  Object.entries(plan.schedule).forEach(([dayKey, scheduleEntry]) => {
    const templateExists = plan.dayTemplates.some((template) => template.id === scheduleEntry.dayTemplateId);

    if (!templateExists) {
      errors.push(`No template found for day "${dayKey}" (expected id: ${scheduleEntry.dayTemplateId}).`);
    }
  });

  return errors;
}

export function buildExercisePrefill(template: DayTemplate): ExerciseTemplate[] {
  return template.exercises.map((exercise) => ({ ...exercise }));
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
