import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const formatWorkoutType = (type: string): string => {
  if (type.startsWith('Other: ')) {
    return type.substring(7); // Remove "Other: " prefix
  }
  return type;
};

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts }) => {
  const navigate = useNavigate();
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
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => toggleWorkout(workout.id)}
                  className="flex-1 text-left hover:opacity-80 transition-opacity"
                >
                  <div>
                    <h3 className="text-lg font-medium text-light-text mb-1">
                      {formatWorkoutType(workout.type)} Workout
                    </h3>
                    <p className="text-light-muted text-sm">{formatDate(workout.date)}</p>
                  </div>
                </button>
                <div className="flex items-center gap-3 ml-4">
                  <p className="text-light-text font-medium text-sm">
                    {workout.exercises?.length || 0} {workout.exercises?.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${workout.id}`);
                    }}
                    className="text-light-muted hover:text-light-text transition-colors p-1"
                    aria-label="Edit workout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleWorkout(workout.id)}
                    className="text-light-muted hover:text-light-text transition-colors p-1"
                    aria-label={isExpanded ? 'Collapse workout' : 'Expand workout'}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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
