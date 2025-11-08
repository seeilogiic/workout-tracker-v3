import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Workout, Exercise, ExerciseData } from '../types';
import {
  createWorkout,
  addExercise,
  updateExercise,
  updateWorkout,
  getWorkoutById,
  getRecentWorkouts,
  getAllWorkouts,
  deleteWorkout,
  deleteExercise,
  hasSupabaseError,
} from '../lib/workoutService';
import { getLocalDateString } from '../lib/dateUtils';

interface WorkoutContextType {
  // Current workout being logged
  currentWorkoutType: string | null;
  currentWorkoutDate: string;
  currentExercises: Exercise[];
  editingWorkoutId: string | null;
  
  // Recent workouts cache
  recentWorkouts: Workout[];
  allWorkouts: Workout[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Supabase connection status
  supabaseError: boolean;
  
  // Actions
  startWorkout: (type: string) => void;
  loadWorkoutForEdit: (workoutId: string) => Promise<boolean>;
  setWorkoutDate: (date: string) => void;
  setWorkoutType: (type: string) => void;
  addExerciseToWorkout: (exerciseData: ExerciseData) => Promise<void>;
  editExerciseInWorkout: (exerciseId: string, exerciseData: Partial<ExerciseData>) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: string) => Promise<void>;
  saveWorkout: () => Promise<boolean>;
  clearCurrentWorkout: () => void;
  refreshWorkouts: () => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<boolean>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWorkoutType, setCurrentWorkoutType] = useState<string | null>(null);
  const [currentWorkoutDate, setCurrentWorkoutDate] = useState<string>(getLocalDateString());
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseError] = useState(hasSupabaseError());

  const startWorkout = useCallback((type: string) => {
    setCurrentWorkoutType(type);
    setCurrentExercises([]);
    setEditingWorkoutId(null);
    setCurrentWorkoutDate(getLocalDateString());
  }, []);

  const loadWorkoutForEdit = useCallback(async (workoutId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const workout = await getWorkoutById(workoutId);
      if (!workout) {
        return false;
      }
      
      setCurrentWorkoutType(workout.type);
      setCurrentWorkoutDate(workout.date);
      setCurrentExercises(workout.exercises || []);
      setEditingWorkoutId(workoutId);
      return true;
    } catch (error) {
      console.error('Error loading workout for edit:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setWorkoutDate = useCallback((date: string) => {
    setCurrentWorkoutDate(date);
  }, []);

  const setWorkoutType = useCallback((type: string) => {
    setCurrentWorkoutType(type);
  }, []);

  const addExerciseToWorkout = useCallback(async (exerciseData: ExerciseData) => {
    // If editing an existing workout, save the exercise immediately
    if (editingWorkoutId) {
      const savedExercise = await addExercise(editingWorkoutId, exerciseData);
      if (savedExercise) {
        setCurrentExercises((prev) => [...prev, savedExercise]);
      }
    } else {
      // For new workouts, create a temporary exercise
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
    }
  }, [editingWorkoutId]);

  const editExerciseInWorkout = useCallback(async (exerciseId: string, exerciseData: Partial<ExerciseData>) => {
    // If editing an existing workout and exercise is not a temp ID, update in database
    if (editingWorkoutId && !exerciseId.startsWith('temp-')) {
      const updatedExercise = await updateExercise(exerciseId, exerciseData);
      if (updatedExercise) {
        setCurrentExercises((prev) =>
          prev.map((exercise) =>
            exercise.id === exerciseId ? updatedExercise : exercise
          )
        );
      }
    } else {
      // For temp exercises or new workouts, just update local state
      setCurrentExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, ...exerciseData }
            : exercise
        )
      );
    }
  }, [editingWorkoutId]);

  const removeExerciseFromWorkout = useCallback(async (exerciseId: string) => {
    // If editing an existing workout and exercise is not a temp ID, delete from database
    if (editingWorkoutId && !exerciseId.startsWith('temp-')) {
      const success = await deleteExercise(exerciseId);
      if (success) {
        setCurrentExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
      }
    } else {
      // For temp exercises or new workouts, just remove from local state
      setCurrentExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
    }
  }, [editingWorkoutId]);

  const clearCurrentWorkout = useCallback(() => {
    setCurrentWorkoutType(null);
    setCurrentExercises([]);
    setEditingWorkoutId(null);
    setCurrentWorkoutDate(getLocalDateString());
  }, []);

  const refreshWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recent, all] = await Promise.all([
        getRecentWorkouts(3),
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

  const saveWorkout = useCallback(async (): Promise<boolean> => {
    if (!currentWorkoutType || currentExercises.length === 0) {
      return false;
    }

    setIsSaving(true);
    
    try {
      if (editingWorkoutId) {
        // Update existing workout
        const success = await updateWorkout(editingWorkoutId, currentWorkoutDate, currentWorkoutType);
        if (!success) {
          return false;
        }

        // Add any new temp exercises to the workout
        for (const exercise of currentExercises) {
          if (exercise.id.startsWith('temp-')) {
            const exerciseData: ExerciseData = {
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              equipment: exercise.equipment,
              notes: exercise.notes || null,
            };
            
            await addExercise(editingWorkoutId, exerciseData);
          }
        }
      } else {
        // Create new workout
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
  }, [currentWorkoutType, currentWorkoutDate, currentExercises, editingWorkoutId, refreshWorkouts, clearCurrentWorkout]);

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
    editingWorkoutId,
    recentWorkouts,
    allWorkouts,
    isLoading,
    isSaving,
    supabaseError,
    startWorkout,
    loadWorkoutForEdit,
    setWorkoutDate,
    setWorkoutType,
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

