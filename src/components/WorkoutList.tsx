import React, { useState } from 'react';
import type { Workout } from '../types';
import { WorkoutEntry } from './WorkoutEntry';

interface WorkoutListProps {
  workouts: Workout[];
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts }) => {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts((prev) => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-light-muted">No workouts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const isExpanded = expandedWorkouts.has(workout.id);
        return (
          <div
            key={workout.id}
            className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleWorkout(workout.id)}
              className="w-full p-4 text-left hover:bg-dark-border transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-light-text mb-1">
                    {workout.type} Workout
                  </h3>
                  <p className="text-light-muted text-sm">{formatDate(workout.date)}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-light-text font-medium">
                    {workout.exercises?.length || 0} {workout.exercises?.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                  <svg
                    className={`w-5 h-5 text-light-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
            {isExpanded && workout.exercises && workout.exercises.length > 0 && (
              <div className="border-t border-dark-border p-4 space-y-3">
                {workout.exercises.map((exercise) => (
                  <WorkoutEntry
                    key={exercise.id}
                    exercise={exercise}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
