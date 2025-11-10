import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutForm } from '../components/WorkoutForm';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';
import { StartWorkout } from '../components/StartWorkout';

export const EditWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    currentWorkoutType,
    currentWorkoutDate,
    currentExercises,
    editingWorkoutId,
    isLoading,
    isSaving,
    loadWorkoutForEdit,
    setWorkoutDate,
    setWorkoutType,
    addExerciseToWorkout,
    editExerciseInWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    clearCurrentWorkout,
    removeWorkout,
  } = useWorkout();

  const [isEditingType, setIsEditingType] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const error = getSupabaseError();

  useEffect(() => {
    if (id && !editingWorkoutId && !isDeleting) {
      loadWorkoutForEdit(id);
    }
  }, [id, editingWorkoutId, loadWorkoutForEdit, isDeleting]);

  const handleSaveWorkout = async () => {
    const success = await saveWorkout();
    if (success) {
      navigate('/history');
    } else {
      alert('Failed to save workout. Please try again.');
    }
  };

  const handleDeleteWorkout = async () => {
    if (!editingWorkoutId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout? This action cannot be undone.'
    );
    
    if (confirmed) {
      setIsDeleting(true);
      const success = await removeWorkout(editingWorkoutId);
      if (success) {
        clearCurrentWorkout();
        navigate('/history');
      } else {
        setIsDeleting(false);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  const displayWorkoutType = (type: string | null): string => {
    if (!type) return '';
    if (type.startsWith('Other: ')) {
      return type.substring(7); // Remove "Other: " prefix
    }
    return type;
  };

  const handleTypeSelect = (type: string) => {
    setWorkoutType(type);
    setIsEditingType(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-light-muted">Loading workout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-light-muted">Workout not found</p>
            <button
              onClick={() => navigate('/history')}
              className="mt-4 text-light-text underline hover:text-light-muted"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-light-text">Edit Workout</h1>
        </div>

        {error && <SupabaseError message={error} />}

        {isEditingType ? (
          <StartWorkout onSelectType={handleTypeSelect} />
        ) : currentWorkoutType ? (
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-light-text mb-2">
                    {displayWorkoutType(currentWorkoutType)} Workout
                  </h2>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="workout_date" className="block text-sm font-medium text-light-text mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        id="workout_date"
                        value={currentWorkoutDate}
                        onChange={(e) => setWorkoutDate(e.target.value)}
                        className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text focus:outline-none focus:border-light-muted"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingType(true)}
                  className="ml-4 text-light-muted hover:text-light-text transition-colors p-2"
                  aria-label="Edit workout type"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            <WorkoutForm
              exercises={currentExercises}
              onAddExercise={addExerciseToWorkout}
              onEditExercise={editExerciseInWorkout}
              onRemoveExercise={removeExerciseFromWorkout}
              onSaveWorkout={handleSaveWorkout}
              isSaving={isSaving}
            />

            {/* Delete Workout Button */}
            <div className="pt-4 border-t border-dark-border">
              <button
                onClick={handleDeleteWorkout}
                disabled={isSaving}
                className="w-full bg-dark-surface border border-red-600/50 rounded-lg px-4 py-3 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Delete Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-muted">Loading workout...</p>
          </div>
        )}
      </div>
    </div>
  );
};

