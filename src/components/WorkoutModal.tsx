import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout } from '../types';
import { parseLocalDate, getLocalDateString } from '../lib/dateUtils';

interface WorkoutModalProps {
  workouts: Workout[];
  date: Date;
  onClose: () => void;
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

export const WorkoutModal: React.FC<WorkoutModalProps> = ({ workouts, date, onClose }) => {
  const navigate = useNavigate();

  const handleWorkoutClick = (workoutId: string) => {
    // Navigate to day summary instead of individual workout
    const dateString = getLocalDateString(date);
    navigate(`/calendar/day/${dateString}?view=month&calendarDate=${dateString}`);
    onClose();
  };

  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-dark-border">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-light-text">
              Workouts on {formattedDate}
            </h2>
            <p className="text-light-muted text-sm mt-1">
              {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light-text transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6">
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-light-muted">No workouts found for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => handleWorkoutClick(workout.id)}
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
          )}
        </div>
      </div>
    </div>
  );
};

