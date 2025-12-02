import React from 'react';

interface BottomNavProps {
  onHome?: () => void;
  onPlan?: () => void;
  onAdd?: () => void;
  onStats?: () => void;
  onProfile?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onHome,
  onPlan,
  onAdd,
  onStats,
  onProfile,
}) => (
  <nav className="bottom-nav" aria-label="Primary">
    <button className="nav-btn" aria-label="Home" onClick={onHome}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5a.5.5 0 0 1-.5-.5v-4a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v4a.5.5 0 0 1-.5.5H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    </button>
    <button className="nav-btn" aria-label="Plan" onClick={onPlan}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h6" />
      </svg>
    </button>
    <button className="nav-btn plus" aria-label="Add" onClick={onAdd}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
    <button className="nav-btn" aria-label="Stats" onClick={onStats}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 15v4M12 10v9M18 6v13" />
      </svg>
    </button>
    <button className="nav-btn" aria-label="Profile" onClick={onProfile}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c0-2.8 2.7-5 6-5s6 2.2 6 5" />
      </svg>
    </button>
  </nav>
);
