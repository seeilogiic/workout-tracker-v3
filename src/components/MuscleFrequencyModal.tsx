import React from 'react';
import { MuscleFrequencyMap } from './MuscleFrequencyMap';

interface MuscleFrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  muscleFrequencies: Map<string, number>;
  periodLabel: string;
}

export const MuscleFrequencyModal: React.FC<MuscleFrequencyModalProps> = ({
  isOpen,
  onClose,
  muscleFrequencies,
  periodLabel,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Modal/Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-dark-surface border-t sm:border border-dark-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col shadow-2xl max-h-[85vh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-dark-border">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-light-text">
                Muscle Frequency
              </h2>
              <p className="text-light-muted text-sm mt-1">
                {periodLabel}
              </p>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-light-muted hover:text-light-text active:text-light-text transition-colors touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 md:p-6">
            <MuscleFrequencyMap muscleFrequencies={muscleFrequencies} />
          </div>
        </div>
      </div>
    </>
  );
};

