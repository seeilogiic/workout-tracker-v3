import React from 'react';
import { demoPlan, getDayTemplateForSchedule, validatePlanSchedule } from '../lib/planService';
import type { WorkoutPlan } from '../types';

interface PlanSchedulePreviewProps {
  plan?: WorkoutPlan;
}

export const PlanSchedulePreview: React.FC<PlanSchedulePreviewProps> = ({ plan = demoPlan }) => {
  const schedulePlan = plan;
  const scheduleIssues = validatePlanSchedule(schedulePlan);

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-light-muted">Plan schedule</p>
          <h3 className="text-xl font-semibold text-light-text">{schedulePlan.name}</h3>
        </div>
        {scheduleIssues.length === 0 ? (
          <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/50">
            Schedule verified
          </span>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/50">
            Review mapping
          </span>
        )}
      </div>

      {scheduleIssues.length > 0 && (
        <div className="mb-3 text-sm text-amber-200">
          <ul className="list-disc list-inside space-y-1">
            {scheduleIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {Object.keys(schedulePlan.schedule).map((dayKey) => {
          const template = getDayTemplateForSchedule(schedulePlan, dayKey);
          const scheduleEntry = schedulePlan.schedule[dayKey];

          return (
            <div key={dayKey} className="p-3 rounded-md bg-black/30 border border-dark-border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-light-text font-medium capitalize">{dayKey}</h4>
                <span className="text-xs text-light-muted">{scheduleEntry.dayTemplateId}</span>
              </div>
              {template ? (
                <div>
                  <p className="text-sm text-light-text">{template.name}</p>
                  <p className="text-xs text-light-muted">{template.notes || 'Template ready for logging.'}</p>
                  <div className="mt-2 text-xs text-light-muted">
                    <p className="font-semibold text-light-text">Exercises</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {template.exercises.map((exercise) => (
                        <li key={exercise.id}>
                          <span className="text-light-text">{exercise.name}</span>
                          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                            <span className="ml-2 text-light-muted">({exercise.primaryMuscles.join(', ')})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-amber-200">Template missing for this schedule key.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
