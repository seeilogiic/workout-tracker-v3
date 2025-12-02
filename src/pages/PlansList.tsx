import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWorkoutPlans } from '../lib/planService';
import type { WorkoutPlan } from '../types';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';

export const PlansList: React.FC = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseError = getSupabaseError();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getWorkoutPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load plans right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text mb-2">Plans</h1>
          <p className="text-light-muted">Browse available training plans</p>
        </div>

        {supabaseError && <SupabaseError message={supabaseError} />}
        {error && <SupabaseError message={error} />}

        <div className="flex gap-4">
          <Link
            to="/plans/upload"
            className="inline-block bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text hover:border-light-muted transition-colors"
          >
            Upload Plan JSON
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-light-muted">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 text-center">
            <p className="text-light-muted mb-4">No plans found</p>
            <Link to="/plans/upload" className="text-light-text underline hover:text-light-muted">
              Upload a plan to get started
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className="block bg-dark-surface border border-dark-border rounded-lg p-5 hover:border-light-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-semibold text-light-text">{plan.name}</h2>
                    <p className="text-light-muted">{plan.goal}</p>
                  </div>
                  <span className="text-sm text-light-muted bg-dark-border px-3 py-1 rounded-full">
                    {plan.duration_weeks} weeks
                  </span>
                </div>
                <p className="text-light-muted text-sm">
                  {plan.weekly_schedule?.length || 0} day schedule
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
