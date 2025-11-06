import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Workout, Exercise, ExerciseData, WorkoutType } from '../types';
import {
  createWorkout,
  addExercise,
  getRecentWorkouts,
  getAllWorkouts,
  deleteWorkout,
  hasSupabaseError,
} from '../lib/workoutService';

interface WorkoutContextType {
  // Current workout being logged
  currentWorkoutType: WorkoutType | null;
  currentWorkoutDate: string;
  currentExercises: Exercise[];
  
  // Recent workouts cache
  recentWorkouts: Workout[];
  allWorkouts: Workout[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Supabase connection status
  supabaseError: boolean;
  
  // Actions
  startWorkout: (type: WorkoutType) => void;
  addExerciseToWorkout: (exerciseData: ExerciseData) => Promise<void>;
  editExerciseInWorkout: (exerciseId: string, exerciseData: Partial<ExerciseData>) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  saveWorkout: () => Promise<boolean>;
  clearCurrentWorkout: () => void;
  refreshWorkouts: () => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<boolean>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWorkoutType, setCurrentWorkoutType] = useState<WorkoutType | null>(null);
  const [currentWorkoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseError] = useState(hasSupabaseError());

  const startWorkout = useCallback((type: WorkoutType) => {
    setCurrentWorkoutType(type);
    setCurrentExercises([]);
  }, []);

  const addExerciseToWorkout = useCallback(async (exerciseData: ExerciseData) => {
    // For now, create a temporary exercise with a temporary ID
    // When saving, we'll create the actual workout and exercises in Supabase
    const tempExercise: Exercise = {
      id: `temp-${Date.now()}-${Math.random()}`,
      workout_id: 'temp',
      exercise_name: exerciseData.exercise_name,
      sets: exerciseData.sets,
      reps: exerciseData.reps,
      weight: exerciseData.weight,
      equipment: exerciseData.equipment,
      notes: exerciseData.notes || null,
      created_at: new Date().toISOString(),
    };
    
    setCurrentExercises((prev) => [...prev, tempExercise]);
  }, []);

  const editExerciseInWorkout = useCallback(async (exerciseId: string, exerciseData: Partial<ExerciseData>) => {
    setCurrentExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, ...exerciseData }
          : exercise
      )
    );
  }, []);

  const removeExerciseFromWorkout = useCallback((exerciseId: string) => {
    setCurrentExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
  }, []);

  const saveWorkout = useCallback(async (): Promise<boolean> => {
    if (!currentWorkoutType || currentExercises.length === 0) {
      return false;
    }

    setIsSaving(true);
    
    try {
      const workoutId = await createWorkout(currentWorkoutDate, currentWorkoutType);
      
      if (!workoutId) {
        return false;
      }

      // Add all exercises to the workout
      for (const exercise of currentExercises) {
        const exerciseData: ExerciseData = {
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          equipment: exercise.equipment,
          notes: exercise.notes || null,
        };
        
        await addExercise(workoutId, exerciseData);
      }

      // Refresh workouts
      await refreshWorkouts();
      
      // Clear current workout
      clearCurrentWorkout();
      
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentWorkoutType, currentWorkoutDate, currentExercises]);

  const clearCurrentWorkout = useCallback(() => {
    setCurrentWorkoutType(null);
    setCurrentExercises([]);
  }, []);

  const refreshWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recent, all] = await Promise.all([
        getRecentWorkouts(7),
        getAllWorkouts(),
      ]);
      setRecentWorkouts(recent);
      setAllWorkouts(all);
    } catch (error) {
      console.error('Error refreshing workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeWorkout = useCallback(async (workoutId: string): Promise<boolean> => {
    try {
      const success = await deleteWorkout(workoutId);
      if (success) {
        await refreshWorkouts();
      }
      return success;
    } catch (error) {
      console.error('Error removing workout:', error);
      return false;
    }
  }, [refreshWorkouts]);

  // Load workouts on mount
  React.useEffect(() => {
    refreshWorkouts();
  }, [refreshWorkouts]);

  const value: WorkoutContextType = {
    currentWorkoutType,
    currentWorkoutDate,
    currentExercises,
    recentWorkouts,
    allWorkouts,
    isLoading,
    isSaving,
    supabaseError,
    startWorkout,
    addExerciseToWorkout,
    editExerciseInWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    clearCurrentWorkout,
    refreshWorkouts,
    removeWorkout,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

