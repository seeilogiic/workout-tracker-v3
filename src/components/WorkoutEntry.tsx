import React from 'react';
import type { Exercise } from '../types';

interface WorkoutEntryProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  showActions?: boolean;
}

export const WorkoutEntry: React.FC<WorkoutEntryProps> = ({ 
  exercise, 
  onEdit, 
  onDelete,
  showActions = true 
}) => {
  const formatNumber = (value: number | null): string => {
    if (value === null) return 'N/A';
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const formatWeight = (weight: number | null): string => {
    if (weight === null) return 'N/A';
    return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
  };

  const formatEquipment = (equipment: string | null): string => {
    if (!equipment) return '';
    if (equipment === 'smith_machine') {
      return 'Smith Machine';
    }
    return equipment.charAt(0).toUpperCase() + equipment.slice(1);
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-light-text mb-2">
            {exercise.exercise_name}
          </h3>
          <div className="text-light-muted text-sm space-y-1">
            <p>
              {formatNumber(exercise.sets)} sets × {formatNumber(exercise.reps)} reps @ {formatWeight(exercise.weight)} lbs
            </p>
            {exercise.equipment && (
              <p className="text-light-subtle">Equipment: {formatEquipment(exercise.equipment)}</p>
            )}
            {exercise.notes && (
              <p className="text-light-subtle mt-2">{exercise.notes}</p>
            )}
          </div>
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(exercise)}
                className="text-light-muted hover:text-light-text transition-colors p-2"
                aria-label="Edit exercise"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(exercise.id)}
                className="text-light-muted hover:text-red-400 transition-colors p-2"
                aria-label="Delete exercise"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

