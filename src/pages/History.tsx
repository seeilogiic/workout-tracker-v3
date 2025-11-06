import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutList } from '../components/WorkoutList';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';

export const History: React.FC = () => {
  const { allWorkouts, isLoading, refreshWorkouts, supabaseError } = useWorkout();
  const error = getSupabaseError();

  useEffect(() => {
    refreshWorkouts();
  }, [refreshWorkouts]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-light-text mb-2">Workout History</h1>
            <p className="text-light-muted">View all your past workouts</p>
          </div>
          <Link
            to="/"
            className="text-light-muted hover:text-light-text transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && <SupabaseError message={error} />}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-light-muted">Loading...</p>
          </div>
        ) : allWorkouts.length === 0 && !supabaseError ? (
          <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-lg">
            <p className="text-light-muted mb-4">No workouts found</p>
            <Link
              to="/log"
              className="text-light-text underline hover:text-light-muted"
            >
              Start your first workout
            </Link>
          </div>
        ) : (
          <WorkoutList workouts={allWorkouts} />
        )}
      </div>
    </div>
  );
};

