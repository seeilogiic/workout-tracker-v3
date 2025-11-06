import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { StartWorkout } from '../components/StartWorkout';
import { WorkoutForm } from '../components/WorkoutForm';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';
import type { WorkoutType } from '../types';

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
    clearCurrentWorkout,
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

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved exercises will be lost.')) {
      clearCurrentWorkout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-light-text">Log Workout</h1>
          <button
            onClick={handleCancel}
            className="text-light-muted hover:text-light-text transition-colors"
          >
            Cancel
          </button>
        </div>

        {error && <SupabaseError message={error} />}

        {!currentWorkoutType ? (
          <StartWorkout onSelectType={(type: WorkoutType) => startWorkout(type)} />
        ) : (
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <h2 className="text-xl font-semibold text-light-text mb-2">
                {currentWorkoutType} Workout
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

