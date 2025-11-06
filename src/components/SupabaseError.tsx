import React from 'react';

interface SupabaseErrorProps {
  message?: string;
}

export const SupabaseError: React.FC<SupabaseErrorProps> = ({ 
  message = 'Could not contact Supabase' 
}) => {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-light-muted" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p className="text-light-text text-sm">{message}</p>
      </div>
    </div>
  );
};

