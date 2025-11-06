import { getSupabaseClient, getSupabaseError } from './supabase';
import type { Workout, Exercise, ExerciseData } from '../types';

export async function createWorkout(date: string, type: 'Push' | 'Pull' | 'Legs'): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({ date, type })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating workout:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating workout:', error);
    return null;
  }
}

export async function addExercise(workoutId: string, exerciseData: ExerciseData): Promise<Exercise | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        exercise_name: exerciseData.exercise_name,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        weight: exerciseData.weight,
        equipment: exerciseData.equipment,
        notes: exerciseData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding exercise:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error adding exercise:', error);
    return null;
  }
}

export async function getWorkoutsByDate(date: string): Promise<Workout | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('date', date)
      .single();

    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return null;
    }

    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workout.id)
      .order('created_at', { ascending: true });

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError);
      return { ...workout, exercises: [] };
    }

    return { ...workout, exercises: exercises || [] };
  } catch (error) {
    console.error('Error fetching workout by date:', error);
    return null;
  }
}

export async function getRecentWorkouts(limit: number = 7): Promise<Workout[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent workouts:', error);
      return [];
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    // Fetch exercises for each workout
    const workoutsWithExercises = await Promise.all(
      workouts.map(async (workout) => {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workout.id)
          .order('created_at', { ascending: true });

        return { ...workout, exercises: exercises || [] };
      })
    );

    return workoutsWithExercises;
  } catch (error) {
    console.error('Error fetching recent workouts:', error);
    return [];
  }
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all workouts:', error);
      return [];
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    // Fetch exercises for each workout
    const workoutsWithExercises = await Promise.all(
      workouts.map(async (workout) => {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workout.id)
          .order('created_at', { ascending: true });

        return { ...workout, exercises: exercises || [] };
      })
    );

    return workoutsWithExercises;
  } catch (error) {
    console.error('Error fetching all workouts:', error);
    return [];
  }
}

export async function updateExercise(exerciseId: string, exerciseData: Partial<ExerciseData>): Promise<Exercise | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .update(exerciseData)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating exercise:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating exercise:', error);
    return null;
  }
}

export async function deleteExercise(exerciseId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return false;
  }
}

export async function deleteWorkout(workoutId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      console.error('Error deleting workout:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
}

export function hasSupabaseError(): boolean {
  return getSupabaseError() !== null;
}
