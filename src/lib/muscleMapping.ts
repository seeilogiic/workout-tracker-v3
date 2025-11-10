/**
 * Exercise to Muscle Group Mapping
 * Maps exercise names to the muscle groups they target
 * Muscle group names match react-body-highlighter's expected format
 */

export const exerciseToMuscles: Record<string, string[]> = {
  // Chest Exercises
  'Bench Press': ['chest', 'triceps', 'front-deltoids'],
  'Incline Bench Press': ['chest', 'triceps', 'front-deltoids'],
  'Decline Bench Press': ['chest', 'triceps'],
  'Chest Press': ['chest', 'triceps', 'front-deltoids'],
  'Push Ups': ['chest', 'triceps', 'front-deltoids'],
  'Chest Fly': ['chest'],
  'Pec Deck': ['chest'],
  'Dips': ['chest', 'triceps', 'front-deltoids'],

  // Shoulder Exercises
  'Shoulder Press': ['front-deltoids', 'triceps'],
  'Overhead Press': ['front-deltoids', 'triceps'],
  'Military Press': ['front-deltoids', 'triceps'],
  'Arnold Press': ['front-deltoids', 'triceps'],
  'Lateral Raise': ['front-deltoids'],
  'Front Raise': ['front-deltoids'],
  'Rear Delt Fly': ['back-deltoids'],
  'Rear Delt Raise': ['back-deltoids'],
  'Upright Row': ['front-deltoids', 'trapezius'],

  // Back Exercises
  'Pull Ups': ['upper-back', 'biceps'],
  'Chin Ups': ['upper-back', 'biceps'],
  'Lat Pulldown': ['upper-back', 'biceps'],
  'Bent Over Row': ['upper-back', 'lower-back', 'biceps'],
  'Seated Row': ['upper-back', 'lower-back', 'biceps'],
  'T-Bar Row': ['upper-back', 'lower-back', 'biceps'],
  'Deadlift': ['hamstring', 'gluteal', 'lower-back', 'trapezius'],
  'Romanian Deadlift': ['hamstring', 'gluteal', 'lower-back'],
  'RDL': ['hamstring', 'gluteal', 'lower-back'],
  'Shrugs': ['trapezius'],
  'Face Pull': ['back-deltoids', 'upper-back'],

  // Bicep Exercises
  'Bicep Curl': ['biceps'],
  'Hammer Curl': ['biceps', 'forearm'],
  'Preacher Curl': ['biceps'],
  'Concentration Curl': ['biceps'],

  // Tricep Exercises
  'Tricep Extension': ['triceps'],
  'Overhead Extension': ['triceps'],
  'Tricep Pushdown': ['triceps'],
  'Close Grip Bench Press': ['triceps', 'chest'],
  'Skull Crushers': ['triceps'],
  'Tricep Dips': ['triceps', 'front-deltoids'],

  // Leg Exercises
  'Squat': ['quadriceps', 'gluteal', 'hamstring'],
  'Front Squat': ['quadriceps', 'gluteal', 'hamstring'],
  'Leg Press': ['quadriceps', 'gluteal'],
  'Leg Extension': ['quadriceps'],
  'Leg Curl': ['hamstring'],
  'Lunges': ['quadriceps', 'gluteal', 'hamstring'],
  'Bulgarian Split Squat': ['quadriceps', 'gluteal'],
  'Stiff Leg Deadlift': ['hamstring', 'gluteal', 'lower-back'],
  'Good Mornings': ['hamstring', 'gluteal', 'lower-back'],

  // Glute Exercises
  'Hip Thrust': ['gluteal', 'hamstring'],
  'Glute Bridge': ['gluteal', 'hamstring'],

  // Calf Exercises
  'Calf Raise': ['calves'],
  'Standing Calf Raise': ['calves'],
  'Seated Calf Raise': ['calves'],

  // Core/Ab Exercises
  'Crunches': ['abs'],
  'Sit Ups': ['abs'],
  'Plank': ['abs'],
  'Leg Raises': ['abs'],
  'Russian Twists': ['abs', 'obliques'],
  'Ab Wheel': ['abs'],
  'Hanging Leg Raise': ['abs'],
  'Cable Crunch': ['abs'],
};

/**
 * Get all available exercise names (sorted alphabetically)
 */
export const getAllExerciseNames = (): string[] => {
  return Object.keys(exerciseToMuscles).sort();
};

/**
 * Get muscle groups for an exercise name (case-insensitive)
 */
export function getMusclesForExercise(exerciseName: string): string[] {
  // Try exact match first
  if (exerciseToMuscles[exerciseName]) {
    return exerciseToMuscles[exerciseName];
  }

  // Try case-insensitive match
  const lowerName = exerciseName.toLowerCase();
  for (const [key, muscles] of Object.entries(exerciseToMuscles)) {
    if (key.toLowerCase() === lowerName) {
      return muscles;
    }
  }

  // Only try partial match if no exact match found
  // Match only if the mapped key contains the user's input (not vice versa)
  // This prevents "Calf Raise" from matching "Standing Calf Raise"
  // Also handle simple plural forms like "RDLs" -> "RDL"
  for (const [key, muscles] of Object.entries(exerciseToMuscles)) {
    const lowerKey = key.toLowerCase();
    
    // Handle simple plural forms (e.g., "RDLs" matches "RDL")
    if (lowerName === lowerKey + 's' || lowerKey === lowerName + 's') {
      return muscles;
    }
    
    // Only match if the mapped exercise name contains the user's input
    // This way "Calf Raise" won't match "Standing Calf Raise", but "Standing Calf Raise" will match "Calf Raise"
    if (lowerKey.includes(lowerName) && lowerName.length >= 3) {
      return muscles;
    }
  }

  return [];
}

/**
 * Get all unique muscle groups from an array of exercises
 */
export function getMusclesFromExercises(exercises: Array<{ exercise_name: string }>): string[] {
  const musclesSet = new Set<string>();
  
  exercises.forEach(exercise => {
    const muscles = getMusclesForExercise(exercise.exercise_name);
    muscles.forEach(muscle => musclesSet.add(muscle));
  });

  return Array.from(musclesSet);
}

/**
 * Get hit counts for each muscle group from an array of exercises
 * Returns a Map where keys are muscle names and values are hit counts
 */
export function getMuscleHitCounts(exercises: Array<{ exercise_name: string }>): Map<string, number> {
  const muscleCounts = new Map<string, number>();
  
  exercises.forEach(exercise => {
    const muscles = getMusclesForExercise(exercise.exercise_name);
    muscles.forEach(muscle => {
      const currentCount = muscleCounts.get(muscle) || 0;
      muscleCounts.set(muscle, currentCount + 1);
    });
  });

  return muscleCounts;
}

