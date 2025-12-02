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
}
