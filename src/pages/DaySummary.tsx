import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { parseLocalDate, getLocalDateString } from '../lib/dateUtils';
import { MuscleMap } from '../components/MuscleMap';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
    return type.substring(7);
  }
  return type;
};

export const DaySummary: React.FC = () => {
  const navigate = useNavigate();
  const { date: dateParam } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();
  const { allWorkouts } = useWorkout();

  // Get date from URL params or route param
  const dateString = dateParam || searchParams.get('date') || getLocalDateString();
  const date = parseLocalDate(dateString);
  
  // Get view params for back navigation
  const viewParam = searchParams.get('view');
  const calendarDateParam = searchParams.get('calendarDate');

  // Get workouts for this date
  const workouts = allWorkouts.filter(workout => workout.date === dateString);

  // Collect all exercises from all workouts for this day
  const allExercises = workouts.flatMap(workout => workout.exercises || []);

  const handleBack = () => {
    if (viewParam && calendarDateParam) {
      navigate(`/calendar?view=${viewParam}&date=${calendarDateParam}`);
    } else {
      navigate('/calendar');
    }
  };

  const handleEdit = (workoutId: string) => {
    navigate(`/edit/${workoutId}`);
  };

  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-8 pb-safe">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text mb-1 sm:mb-2">
            {dayName}, {formattedDate}
          </h1>
          <p className="text-sm sm:text-base text-light-muted">
            {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}
          </p>
        </div>

        {/* Workouts Summary */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-4 text-light-muted hover:text-light-text transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">
              {calendarDateParam ? parseLocalDate(calendarDateParam).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : 'Calendar'}
            </span>
          </button>

          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-light-muted">No workouts found for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-light-muted transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-light-text mb-1">
                        {formatWorkoutType(workout.type)} Workout
                      </h3>
                      <p className="text-light-muted text-sm">
                        {workout.exercises?.length || 0} {workout.exercises?.length === 1 ? 'exercise' : 'exercises'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(workout.id)}
                      className="ml-4 bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text hover:border-light-muted active:bg-dark-border transition-colors font-medium flex items-center gap-2 min-w-[100px] justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  </div>

                  {/* Exercises Summary */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <div className="space-y-2">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="text-sm text-light-muted"
                          >
                            <span className="font-medium text-light-text">{exercise.exercise_name}</span>
                            {exercise.sets && exercise.reps && (
                              <span className="ml-2">
                                {exercise.sets} × {exercise.reps}
                                {exercise.weight && ` @ ${exercise.weight}${exercise.weight % 1 === 0 ? '' : '0'} lbs`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Muscle Visualization */}
        {allExercises.length > 0 && (
          <div className="mt-6 bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-light-text mb-4">
              Muscles Targeted
            </h2>
            <ErrorBoundary fallback={<p className="text-light-muted text-sm">Unable to load muscle visualization</p>}>
              <MuscleMap exercises={allExercises} />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

