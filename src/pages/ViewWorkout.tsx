import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutEntry } from '../components/WorkoutEntry';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';
import { getWorkoutById } from '../lib/workoutService';
import type { Workout } from '../types';
import { parseLocalDate } from '../lib/dateUtils';

export const ViewWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { removeWorkout, refreshWorkouts } = useWorkout();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExercisesExpanded, setIsExercisesExpanded] = useState(false);
  const error = getSupabaseError();

  useEffect(() => {
    const loadWorkout = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const loadedWorkout = await getWorkoutById(id);
        setWorkout(loadedWorkout);
      } catch (error) {
        console.error('Error loading workout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [id]);

  const handleEdit = () => {
    if (id) {
      navigate(`/edit/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout? This action cannot be undone.'
    );
    
    if (confirmed) {
      setIsDeleting(true);
      const success = await removeWorkout(id);
      if (success) {
        await refreshWorkouts();
        navigate('/history');
      } else {
        setIsDeleting(false);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-light-muted">Loading workout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-light-muted mb-4">Workout not found</p>
            <button
              onClick={() => navigate('/history')}
              className="text-light-text underline hover:text-light-muted"
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-light-muted hover:text-light-text transition-colors mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-light-text mb-2">
              {formatWorkoutType(workout.type)} Workout
            </h1>
            <p className="text-light-muted">{formatDate(workout.date)}</p>
          </div>
        </div>

        {error && <SupabaseError message={error} />}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleEdit}
            className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-6 py-3 text-light-text hover:border-light-muted transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Workout
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-dark-surface border border-red-600/50 rounded-lg px-6 py-3 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? 'Deleting...' : 'Delete Workout'}
          </button>
        </div>

        {/* Exercises Section */}
        <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
          <button
            onClick={() => setIsExercisesExpanded(!isExercisesExpanded)}
            className="w-full p-6 flex justify-between items-center hover:bg-dark-border transition-colors text-left"
          >
            <h2 className="text-xl font-semibold text-light-text">
              Exercises ({workout.exercises?.length || 0})
            </h2>
            <svg
              className={`w-5 h-5 text-light-muted transition-transform ${isExercisesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExercisesExpanded && (
            <div className="px-6 pb-6">
              {workout.exercises && workout.exercises.length > 0 ? (
                <div className="space-y-4 pt-4">
                  {workout.exercises.map((exercise) => (
                    <WorkoutEntry
                      key={exercise.id}
                      exercise={exercise}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-light-muted">No exercises recorded for this workout</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Section - Placeholder for future implementation */}
        <div className="mt-6 bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-light-text mb-4">Statistics</h2>
          <p className="text-light-muted text-sm">Workout statistics coming soon...</p>
        </div>
      </div>
    </div>
  );
};

