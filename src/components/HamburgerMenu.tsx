import React from 'react';
import { Link } from 'react-router-dom';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 sm:w-64 bg-dark-surface border-r border-dark-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-safe">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-border">
            <h2 className="text-xl font-bold text-light-text">Menu</h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-light-muted active:text-light-text transition-colors touch-manipulation"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  onClick={onClose}
                  className="block px-4 py-3 min-h-[44px] flex items-center text-light-text active:bg-dark-border rounded-lg transition-colors touch-manipulation"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/calendar"
                  onClick={onClose}
                  className="block px-4 py-3 min-h-[44px] flex items-center text-light-text active:bg-dark-border rounded-lg transition-colors touch-manipulation"
                >
                  Calendar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

