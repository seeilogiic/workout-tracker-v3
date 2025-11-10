import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { StartWorkout } from '../components/StartWorkout';
import { WorkoutForm } from '../components/WorkoutForm';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';
export const LogWorkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentWorkoutType,
    currentExercises,
    isSaving,
    startWorkout,
    addExerciseToWorkout,
    editExerciseInWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
  } = useWorkout();

  const error = getSupabaseError();

  const handleSaveWorkout = async () => {
    const success = await saveWorkout();
    if (success) {
      navigate('/');
    } else {
      alert('Failed to save workout. Please try again.');
    }
  };

  const displayWorkoutType = (type: string | null): string => {
    if (!type) return '';
    if (type.startsWith('Other: ')) {
      return type.substring(7); // Remove "Other: " prefix
    }
    return type;
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-light-muted hover:text-light-text transition-colors mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-light-text">Log Workout</h1>
        </div>

        {error && <SupabaseError message={error} />}

        {!currentWorkoutType ? (
          <StartWorkout onSelectType={(type: string) => startWorkout(type as any)} />
        ) : (
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <h2 className="text-xl font-semibold text-light-text mb-2">
                {displayWorkoutType(currentWorkoutType)} Workout
              </h2>
              <p className="text-light-muted text-sm">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <WorkoutForm
              exercises={currentExercises}
              onAddExercise={addExerciseToWorkout}
              onEditExercise={editExerciseInWorkout}
              onRemoveExercise={removeExerciseFromWorkout}
              onSaveWorkout={handleSaveWorkout}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
};

