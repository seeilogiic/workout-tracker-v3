import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorkoutPlanById } from '../lib/planService';
import type { WorkoutPlan } from '../types';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';

export const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseError = getSupabaseError();

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        const data = await getWorkoutPlanById(id);
        if (!data) {
          setError('Plan not found');
        }
        setPlan(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load plan right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text mb-2">{plan?.name || 'Plan'}</h1>
            <p className="text-light-muted">{plan?.goal}</p>
          </div>
          <Link
            to="/plans"
            className="text-light-muted hover:text-light-text transition-colors underline"
          >
            ← Back to plans
          </Link>
        </div>

        {supabaseError && <SupabaseError message={supabaseError} />}
        {error && <SupabaseError message={error} />}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-light-muted">Loading plan...</p>
          </div>
        ) : plan ? (
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4 flex flex-wrap gap-4 items-center">
              <span className="text-light-text font-semibold">Duration:</span>
              <span className="text-light-muted">{plan.duration_weeks} weeks</span>
              <span className="text-light-muted">{plan.weekly_schedule.length} scheduled days</span>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-lg">
              <div className="p-4 border-b border-dark-border">
                <h2 className="text-xl font-semibold text-light-text">Weekly schedule</h2>
                <p className="text-light-muted text-sm">Overview of the weekly focus</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-dark-border text-light-muted text-sm">
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Focus</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.weekly_schedule.map((entry) => (
                      <tr key={`${entry.day}-${entry.focus}`} className="border-b border-dark-border/50 last:border-b-0">
                        <td className="px-4 py-3 text-light-text">{entry.day}</td>
                        <td className="px-4 py-3 text-light-muted">{entry.focus}</td>
                        <td className="px-4 py-3 text-light-muted">{entry.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-light-text">Day templates</h2>
                <span className="text-sm text-light-muted">Guides for each training day</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {plan.day_templates.map((template) => (
                  <div key={template.day} className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-light-text">{template.day}</h3>
                      {template.notes && (
                        <span className="text-xs text-light-muted bg-dark-border px-3 py-1 rounded-full">
                          {template.notes}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {template.exercises.map((exercise, index) => (
                        <div
                          key={`${exercise.name}-${index}`}
                          className="p-3 bg-black/40 border border-dark-border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-light-text font-medium">{exercise.name}</p>
                            {(exercise.sets || exercise.reps || exercise.duration) && (
                              <span className="text-xs text-light-muted bg-dark-border px-2 py-1 rounded">
                                {[exercise.sets && `${exercise.sets} sets`, exercise.reps && `${exercise.reps} reps`, exercise.duration]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            )}
                          </div>
                          {exercise.notes && (
                            <p className="text-light-muted text-sm">{exercise.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-muted">Plan details unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
};
