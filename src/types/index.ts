export type WorkoutType = 'Push' | 'Pull' | 'Legs';

export type EquipmentType = 'machine' | 'dumbbell' | 'bar' | 'cable' | 'bodyweight' | 'other';

export interface Exercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  equipment: EquipmentType | null;
  notes: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  date: string;
  type: WorkoutType;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export interface ExerciseData {
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  equipment: EquipmentType | null;
  notes?: string | null;
}

export interface WorkoutData {
  date: string;
  type: WorkoutType;
}

