import { useState, useEffect } from 'react';
import { getAllWorkouts } from '../lib/workoutService';

const CACHE_KEY = 'workout-tracker-exercise-names';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function getCachedExerciseNames(): string[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];
    
    const { names, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return [];
    }
    
    return names || [];
  } catch {
    return [];
  }
}

function setCachedExerciseNames(names: string[]): void {
  try {
    const data = {
      names,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
}

export function useExerciseAutofill() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load from cache first
    const cached = getCachedExerciseNames();
    if (cached.length > 0) {
      setSuggestions(cached);
    }

    // Then try to fetch from Supabase and update cache
    setIsLoading(true);
    getAllWorkouts()
      .then((workouts) => {
        const exerciseNames = new Set<string>();
        
        workouts.forEach((workout) => {
          workout.exercises?.forEach((exercise) => {
            if (exercise.exercise_name) {
              exerciseNames.add(exercise.exercise_name);
            }
          });
        });

        const names = Array.from(exerciseNames).sort();
        setSuggestions(names);
        setCachedExerciseNames(names);
      })
      .catch(() => {
        // If Supabase fails, keep cached suggestions
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getSuggestions = (input: string): string[] => {
    if (!input.trim()) return [];
    
    const lowerInput = input.toLowerCase();
    return suggestions
      .filter((name) => name.toLowerCase().includes(lowerInput))
      .slice(0, 5); // Limit to 5 suggestions
  };

  const addExerciseName = (name: string): void => {
    if (!name.trim()) return;
    
    const updated = Array.from(new Set([name, ...suggestions])).sort();
    setSuggestions(updated);
    setCachedExerciseNames(updated);
  };

  return {
    suggestions,
    getSuggestions,
    addExerciseName,
    isLoading,
  };
}

