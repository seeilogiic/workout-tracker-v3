import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout } from '../types';
import { parseLocalDate } from '../lib/dateUtils';

interface WorkoutListProps {
  workouts: Workout[];
}

const formatDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatWorkoutType = (type: string): string => {
  if (type.startsWith('Other: ')) {
    return type.substring(7); // Remove "Other: " prefix
  }
  return type;
};

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts }) => {
  const navigate = useNavigate();

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-light-muted">No workouts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.length > 0 && (
        <p className="text-light-muted text-sm mb-2">
          Tap a workout to view details
        </p>
      )}
      {workouts.map((workout) => (
        <button
          key={workout.id}
          onClick={() => navigate(`/workout/${workout.id}`)}
          className="w-full bg-dark-surface border border-dark-border rounded-lg p-4 text-left hover:border-light-muted active:bg-dark-border transition-all duration-200 group"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-light-text mb-1 group-hover:text-light-text">
                {formatWorkoutType(workout.type)} Workout
              </h3>
              <p className="text-light-muted text-sm">{formatDate(workout.date)}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <p className="text-light-text font-medium text-sm">
                {workout.exercises?.length || 0} {workout.exercises?.length === 1 ? 'exercise' : 'exercises'}
              </p>
              <svg
                className="w-5 h-5 text-light-muted group-hover:text-light-text transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
