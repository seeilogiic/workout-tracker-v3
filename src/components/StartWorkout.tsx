import React, { useState } from 'react';
import type { WorkoutType } from '../types';

interface StartWorkoutProps {
  onSelectType: (type: WorkoutType | string) => void;
}

export const StartWorkout: React.FC<StartWorkoutProps> = ({ onSelectType }) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherWorkoutType, setOtherWorkoutType] = useState('');

  const workoutTypes: WorkoutType[] = ['Push', 'Pull', 'Legs', 'Upper body'];

  const handleOtherClick = () => {
    setShowOtherInput(true);
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otherWorkoutType.trim()) {
      onSelectType(`Other: ${otherWorkoutType.trim()}`);
    }
  };

  const handleOtherCancel = () => {
    setShowOtherInput(false);
    setOtherWorkoutType('');
  };

  if (showOtherInput) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-light-text mb-6">Enter Custom Workout Type</h2>
        <form onSubmit={handleOtherSubmit} className="space-y-4">
          <div>
            <label htmlFor="other_workout_type" className="block text-sm font-medium text-light-text mb-2">
              Workout Type
            </label>
            <input
              type="text"
              id="other_workout_type"
              value={otherWorkoutType}
              onChange={(e) => setOtherWorkoutType(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
              placeholder="e.g., Full Body, Cardio, etc."
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!otherWorkoutType.trim()}
              className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text hover:border-light-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleOtherCancel}
              className="px-4 py-2 border border-dark-border rounded-lg text-light-text hover:border-light-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

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
        <button
          onClick={handleOtherClick}
          className="bg-dark-surface border border-dark-border rounded-lg p-6 text-left hover:border-light-muted transition-colors min-h-[60px] flex items-center justify-center"
        >
          <span className="text-xl font-medium text-light-text">Other</span>
        </button>
      </div>
    </div>
  );
};
