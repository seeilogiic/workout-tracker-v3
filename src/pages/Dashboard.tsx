import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutList } from '../components/WorkoutList';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';
import { PlanSchedulePreview } from '../components/PlanSchedulePreview';

export const Dashboard: React.FC = () => {
  const { recentWorkouts, isLoading, refreshWorkouts, supabaseError } = useWorkout();
  const error = getSupabaseError();

  useEffect(() => {
    refreshWorkouts();
  }, [refreshWorkouts]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text mb-2">Workout Tracker</h1>
          <p className="text-light-muted">Track your daily workouts</p>
        </div>

        {error && <SupabaseError message={error} />}

        <div className="mb-6">
          <Link
            to="/log"
            className="inline-block bg-dark-surface border border-dark-border rounded-lg px-6 py-3 text-light-text hover:border-light-muted transition-colors font-medium"
          >
            Start New Workout
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-light-text mb-4">Recent Workouts</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-light-muted">Loading...</p>
            </div>
          ) : recentWorkouts.length === 0 && !supabaseError ? (
            <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-lg">
              <p className="text-light-muted mb-4">No workouts yet</p>
              <Link
                to="/log"
                className="text-light-text underline hover:text-light-muted"
              >
                Start your first workout
              </Link>
            </div>
          ) : (
            <WorkoutList workouts={recentWorkouts} />
          )}
        </div>

        <div className="mb-8">
          <PlanSchedulePreview />
        </div>

        <div className="mt-8">
          <Link
            to="/history"
            className="text-light-muted hover:text-light-text transition-colors underline"
          >
            View All Workouts →
          </Link>
        </div>
      </div>
    </div>
  );
};

