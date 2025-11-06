import React from 'react';
import type { WorkoutType } from '../types';

interface StartWorkoutProps {
  onSelectType: (type: WorkoutType) => void;
}

export const StartWorkout: React.FC<StartWorkoutProps> = ({ onSelectType }) => {
  const workoutTypes: WorkoutType[] = ['Push', 'Pull', 'Legs'];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-light-text mb-6">Select Workout Type</h2>
      <div className="grid grid-cols-1 gap-4">
        {workoutTypes.map((type) => (
          <button
            key={type}
            onClick={() => onSelectType(type)}
            className="bg-dark-surface border border-dark-border rounded-lg p-6 text-left hover:border-light-muted transition-colors min-h-[60px] flex items-center justify-center"
          >
            <span className="text-xl font-medium text-light-text">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

