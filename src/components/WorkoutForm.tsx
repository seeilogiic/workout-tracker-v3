import React, { useState, useMemo } from 'react';
import type { ExerciseData, EquipmentType, Exercise } from '../types';
import { useExerciseAutofill } from '../hooks/useExerciseAutofill';
import { getAllExerciseNames } from '../lib/muscleMapping';
import { WorkoutEntry } from './WorkoutEntry';

interface WorkoutFormProps {
  exercises: Exercise[];
  onAddExercise: (exercise: ExerciseData) => void;
  onEditExercise: (exerciseId: string, exerciseData: Partial<ExerciseData>) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onSaveWorkout: () => void;
  isSaving?: boolean;
}

const equipmentOptions: EquipmentType[] = ['machine', 'dumbbell', 'bar', 'cable', 'bodyweight', 'smith_machine', 'other'];

// Helper to format equipment name for display
const formatEquipmentName = (equipment: string): string => {
  if (equipment === 'smith_machine') {
    return 'Smith Machine';
  }
  return equipment.charAt(0).toUpperCase() + equipment.slice(1);
};

// Helper to convert string to number or null
const parseNumberOrNull = (value: string): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Helper to convert number or null to string for input
const numberToString = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString();
};

export const WorkoutForm: React.FC<WorkoutFormProps> = ({
  exercises,
  onAddExercise,
  onEditExercise,
  onRemoveExercise,
  onSaveWorkout,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<{
    exercise_name: string;
    sets: string;
    reps: string;
    weight: string;
    equipment: EquipmentType | null;
    notes: string;
  }>({
    exercise_name: '',
    sets: '',
    reps: '',
    weight: '',
    equipment: null,
    notes: '',
  });

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addExerciseName } = useExerciseAutofill();
  
  // Get all available exercise names from muscle mapping
  const availableExercises = useMemo(() => getAllExerciseNames(), []);
  
  // Filter exercises based on input
  const filteredExercises = useMemo(() => {
    if (!formData.exercise_name.trim()) {
      return availableExercises;
    }
    const lowerInput = formData.exercise_name.toLowerCase();
    return availableExercises.filter(ex => 
      ex.toLowerCase().includes(lowerInput)
    );
  }, [formData.exercise_name, availableExercises]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.exercise_name.trim()) {
      newErrors.exercise_name = 'Exercise name is required';
    } else if (!editingExerciseId) {
      // For new exercises, must be from the predefined list
      const lowerInput = formData.exercise_name.toLowerCase();
      const isValidExercise = availableExercises.some(ex => 
        ex.toLowerCase() === lowerInput
      );
      if (!isValidExercise) {
        newErrors.exercise_name = 'Please select an exercise from the list';
      }
    }
    // For editing existing exercises, allow any name (for backward compatibility)

    const setsValue = parseNumberOrNull(formData.sets);
    if (setsValue !== null && setsValue < 0) {
      newErrors.sets = 'Sets cannot be negative';
    }

    const repsValue = parseNumberOrNull(formData.reps);
    if (repsValue !== null && repsValue < 0) {
      newErrors.reps = 'Reps cannot be negative';
    }

    const weightValue = parseNumberOrNull(formData.weight);
    if (weightValue !== null && weightValue < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert string inputs to numbers or null, defaulting to 0 if null
    const exerciseData: ExerciseData = {
      exercise_name: formData.exercise_name,
      sets: parseNumberOrNull(formData.sets) ?? 0,
      reps: parseNumberOrNull(formData.reps) ?? 0,
      weight: parseNumberOrNull(formData.weight) ?? 0,
      equipment: formData.equipment,
      notes: formData.notes || null,
    };

    if (editingExerciseId) {
      // When editing, normalize if it matches a predefined exercise, otherwise keep as-is
      const normalizedName = availableExercises.find(ex => 
        ex.toLowerCase() === exerciseData.exercise_name.toLowerCase()
      ) || exerciseData.exercise_name;
      
      onEditExercise(editingExerciseId, { ...exerciseData, exercise_name: normalizedName });
      setEditingExerciseId(null);
    } else {
      // Normalize exercise name to match the exact case from available exercises
      const normalizedName = availableExercises.find(ex => 
        ex.toLowerCase() === exerciseData.exercise_name.toLowerCase()
      ) || exerciseData.exercise_name;
      
      onAddExercise({ ...exerciseData, exercise_name: normalizedName });
      addExerciseName(normalizedName);
    }

    // Reset form
    setFormData({
      exercise_name: '',
      sets: '',
      reps: '',
      weight: '',
      equipment: null,
      notes: '',
    });
    setErrors({});
    setShowSuggestions(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      exercise_name: exercise.exercise_name,
      sets: numberToString(exercise.sets),
      reps: numberToString(exercise.reps),
      weight: numberToString(exercise.weight),
      equipment: exercise.equipment,
      notes: exercise.notes || '',
    });
    setEditingExerciseId(exercise.id);
    setShowSuggestions(false);
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setFormData({
      exercise_name: '',
      sets: '',
      reps: '',
      weight: '',
      equipment: null,
      notes: '',
    });
    setErrors({});
    setShowSuggestions(false);
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setFormData({ ...formData, exercise_name: exerciseName });
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exercise_name" className="block text-sm font-medium text-light-text mb-2">
            Exercise Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="exercise_name"
              value={formData.exercise_name}
              onChange={(e) => {
                setFormData({ ...formData, exercise_name: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
              placeholder="Type to search exercises..."
            />
            {showSuggestions && filteredExercises.length > 0 && filteredExercises.length <= 10 && (
              <div className="absolute z-10 w-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise}
                    type="button"
                    onClick={() => handleExerciseSelect(exercise)}
                    className="w-full text-left px-4 py-2 hover:bg-dark-border text-light-text"
                  >
                    {exercise}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.exercise_name && (
            <p className="mt-1 text-sm text-red-400">{errors.exercise_name}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="sets" className="block text-sm font-medium text-light-text mb-2">
              Sets *
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="sets"
              value={formData.sets}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string, numbers, and decimal points
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, sets: value });
                }
              }}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
              placeholder="0"
            />
            {errors.sets && (
              <p className="mt-1 text-sm text-red-400">{errors.sets}</p>
            )}
          </div>

          <div>
            <label htmlFor="reps" className="block text-sm font-medium text-light-text mb-2">
              Reps *
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="reps"
              value={formData.reps}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string, numbers, and decimal points
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, reps: value });
                }
              }}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
              placeholder="0"
            />
            {errors.reps && (
              <p className="mt-1 text-sm text-red-400">{errors.reps}</p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-light-text mb-2">
              Weight (lbs) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              id="weight"
              value={formData.weight}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string, numbers, and decimal points
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, weight: value });
                }
              }}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
              placeholder="0"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-400">{errors.weight}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-light-text mb-2">
            Equipment
          </label>
          <select
            id="equipment"
            value={formData.equipment || ''}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value as EquipmentType || null })}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
          >
            <option value="">None</option>
            {equipmentOptions.map((option) => (
              <option key={option} value={option}>
                {formatEquipmentName(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-light-text mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted resize-none"
            placeholder="Add any notes about this exercise..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text hover:border-light-muted transition-colors"
          >
            {editingExerciseId ? 'Update Exercise' : 'Add Exercise'}
          </button>
          {editingExerciseId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-dark-border rounded-lg text-light-text hover:border-light-muted transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {exercises.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-light-text">Exercises ({exercises.length})</h3>
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <WorkoutEntry
                key={exercise.id}
                exercise={exercise}
                onEdit={handleEdit}
                onDelete={onRemoveExercise}
                showActions={true}
              />
            ))}
          </div>
          <button
            onClick={onSaveWorkout}
            disabled={isSaving}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-light-text hover:border-light-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      )}
    </div>
  );
};
