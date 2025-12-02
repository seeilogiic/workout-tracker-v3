import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createWorkoutPlan } from '../lib/planService';
import type { WorkoutPlanInput } from '../types';
import { SupabaseError } from '../components/SupabaseError';
import { getSupabaseError } from '../lib/supabase';

const samplePlan = `{
  "name": "Strength Foundations",
  "goal": "Build full-body strength",
  "duration_weeks": 8,
  "weekly_schedule": [
    { "day": "Monday", "focus": "Upper body push" },
    { "day": "Wednesday", "focus": "Lower body" },
    { "day": "Friday", "focus": "Upper body pull" }
  ],
  "day_templates": [
    {
      "day": "Upper body push",
      "notes": "Focus on controlled tempo",
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": 8 },
        { "name": "Overhead Press", "sets": 3, "reps": 10 }
      ]
    },
    {
      "day": "Lower body",
      "exercises": [
        { "name": "Squat", "sets": 4, "reps": 8 },
        { "name": "Romanian Deadlift", "sets": 3, "reps": 10 }
      ]
    }
  ]
}`;

export const PlanUpload: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(samplePlan);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseError = getSupabaseError();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const parsed = JSON.parse(jsonInput) as WorkoutPlanInput;
      if (!parsed.name || !parsed.goal || !parsed.duration_weeks) {
        setError('Plan JSON must include name, goal, and duration_weeks.');
        return;
      }

      setIsSubmitting(true);
      const result = await createWorkoutPlan(parsed);
      if (result) {
        setMessage(`Plan "${result.name}" uploaded successfully.`);
        setJsonInput(samplePlan);
      } else {
        setError('Unable to upload plan right now.');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid JSON format. Please double-check your plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text mb-2">Upload Plan</h1>
            <p className="text-light-muted">Paste a JSON plan definition to add it to your library.</p>
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
        {message && (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 text-light-text">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-light-text font-medium mb-2">Plan JSON</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-96 bg-dark-surface border border-dark-border rounded-lg p-3 text-light-text font-mono text-sm focus:outline-none focus:border-light-muted"
              spellCheck={false}
            />
            <p className="text-light-muted text-sm mt-2">
              Include plan name, goal, duration_weeks, weekly_schedule, and day_templates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-light-text hover:border-light-muted transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Plan'}
            </button>
            <button
              type="button"
              onClick={() => setJsonInput(samplePlan)}
              className="text-light-muted hover:text-light-text underline"
            >
              Reset to sample
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
