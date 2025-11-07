import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HamburgerMenu } from './HamburgerMenu';

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 min-w-[44px] min-h-[44px] p-3 text-light-text active:text-light-muted transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Outlet />
      </div>
    </div>
  );
};

