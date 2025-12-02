export type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Upper body' | 'Other';

export type EquipmentType = 'machine' | 'dumbbell' | 'bar' | 'cable' | 'bodyweight' | 'smith_machine' | 'other';

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

export interface ExerciseSetTemplate {
  targetReps: number | null;
  targetWeight?: number | null;
  rir?: number | null;
  tempo?: string | null;
  notes?: string | null;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  equipment?: EquipmentType | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  notes?: string | null;
  sets: ExerciseSetTemplate[];
}

export interface DayTemplate {
  id: string;
  key: string;
  name: string;
  focus: WorkoutType | 'Rest';
  notes?: string | null;
  exercises: ExerciseTemplate[];
}

export interface ScheduleEntry {
  dayTemplateId: string;
  isRestDay?: boolean;
export interface WeeklyScheduleEntry {
  day: string;
  focus: string;
  notes?: string | null;
}

export interface DayTemplateExercise {
  name: string;
  sets?: number | null;
  reps?: number | null;
  duration?: string | null;
  notes?: string | null;
}

export interface DayTemplate {
  day: string;
  exercises: DayTemplateExercise[];
  notes?: string | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string | null;
  durationWeeks?: number | null;
  schedule: Record<string, ScheduleEntry>;
  dayTemplates: DayTemplate[];
  metadata?: Record<string, unknown>;
  goal: string;
  duration_weeks: number;
  weekly_schedule: WeeklyScheduleEntry[];
  day_templates: DayTemplate[];
  created_at: string;
}

export interface WorkoutPlanInput {
  name: string;
  goal: string;
  duration_weeks: number;
  weekly_schedule: WeeklyScheduleEntry[];
  day_templates: DayTemplate[];
}

