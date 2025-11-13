/**
 * Exercise to Muscle Group Mapping
 * Maps exercise names to the muscle groups they target
 * Muscle group names match react-body-highlighter's expected format
 */

export const exerciseToMuscles: Record<string, string[]> = {
  // Chest Exercises
  'Bench Press': ['chest', 'triceps', 'front-deltoids'],
  'Chest Fly': ['chest'],
  'Decline Bench Press': ['chest', 'triceps'],
  'Incline Bench Press': ['chest', 'triceps', 'front-deltoids'],
  'Pullover': ['chest', 'upper-back'],
  'Pec Deck': ['chest'],
  'Push Ups': ['chest', 'triceps', 'front-deltoids'],
  'Dips': ['chest', 'triceps', 'front-deltoids'],

  // Shoulder Exercises
  'Arnold Press': ['front-deltoids', 'triceps'],
  'Front Raise': ['front-deltoids'],
  'Lateral Raise': ['front-deltoids'],
  'Overhead Press': ['front-deltoids', 'triceps'],
  'Rear Delt Raise': ['back-deltoids'],
  'Reverse Fly': ['back-deltoids', 'upper-back'],
  'Upright Row': ['front-deltoids', 'trapezius'],

  // Back Exercises
  'Bent Over Row': ['upper-back', 'lower-back', 'biceps'],
  'Seated Row': ['upper-back', 'lower-back', 'biceps'],
  'Chin Ups': ['upper-back', 'biceps'],
  'Deadlift': ['hamstring', 'gluteal', 'lower-back', 'trapezius'],
  'Face Pull': ['back-deltoids', 'upper-back'],
  'Lat Pulldown': ['upper-back', 'biceps'],
  'Pull Ups': ['upper-back', 'biceps'],
  'Romanian Deadlift': ['hamstring', 'gluteal', 'lower-back'],
  'Shrugs': ['trapezius'],
  'Straight Arm Pulldown': ['upper-back'],
  'T-Bar Row': ['upper-back', 'lower-back', 'biceps'],

  // Bicep Exercises
  'Bicep Curl': ['biceps'],
  'Concentration Curl': ['biceps'],
  'Hammer Curl': ['biceps', 'forearm'],
  'Preacher Curl': ['biceps'],

  // Tricep Exercises
  'Close Grip Bench Press': ['triceps', 'chest'],
  'Tricep Kickback': ['triceps'],
  'Overhead Extension': ['triceps'],
  'Skull Crushers': ['triceps'],
  'Tricep Pushdown': ['triceps'],

  // Forearm Exercises
  'Reverse Wrist Curls': ['forearm'],
  'Wrist Curls': ['forearm'],

  // Leg Exercises
  'Bulgarian Split Squat': ['quadriceps', 'gluteal'],
  'Front Squat': ['quadriceps', 'gluteal', 'hamstring'],
  'Good Mornings': ['hamstring', 'gluteal', 'lower-back'],
  'Leg Curl': ['hamstring'],
  'Leg Extension': ['quadriceps'],
  'Leg Press': ['quadriceps', 'gluteal'],
  'Lunges': ['quadriceps', 'gluteal', 'hamstring'],
  'Squat': ['quadriceps', 'gluteal', 'hamstring'],
  'Stiff Leg Deadlift': ['hamstring', 'gluteal', 'lower-back'],

  // Glute Exercises
  'Glute Bridge': ['gluteal', 'hamstring'],
  'Hip Thrust': ['gluteal', 'hamstring'],

  // Calf Exercises
  'Seated Calf Raise': ['calves'],
  'Standing Calf Raise': ['calves'],

  // Core/Ab Exercises
  'Ab Wheel': ['abs'],
  'Bicycle Crunch': ['abs', 'obliques'],
  'Crunch': ['abs'],
  'Crunches': ['abs'],
  'Hanging Leg Raise': ['abs'],
  'Leg Raises': ['abs'],
  'Plank': ['abs'],
  'Russian Twists': ['abs', 'obliques'],
  'Side Plank': ['abs', 'obliques'],
  'Sit Ups': ['abs'],
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

