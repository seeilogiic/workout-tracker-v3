import React, { useState, useMemo, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import type { Workout } from '../types';
import { WorkoutEntry } from '../components/WorkoutEntry';

export const Calendar: React.FC = () => {
  const { allWorkouts } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get available years from workouts
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allWorkouts.forEach(workout => {
      const workoutYear = new Date(workout.date).getFullYear();
      years.add(workoutYear);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [allWorkouts]);

  // Determine default year: current year if available, otherwise earliest year, otherwise current year
  const defaultYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (availableYears.length === 0) {
      return currentYear;
    }
    if (availableYears.includes(currentYear)) {
      return currentYear;
    }
    return availableYears[0]; // Most recent year with data
  }, [availableYears]);

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Update selected year when default changes (e.g., when data loads)
  useEffect(() => {
    setSelectedYear(defaultYear);
  }, [defaultYear]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = (date: Date): Workout[] => {
    const dateStr = date.toISOString().split('T')[0];
    return allWorkouts.filter(workout => workout.date === dateStr);
  };

  // Check if a date has workouts
  const dateHasWorkout = (date: Date): boolean => {
    return getWorkoutsForDate(date).length > 0;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const hasWorkout = dateHasWorkout(dayDate);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className="aspect-square flex items-center justify-center text-light-text rounded-lg active:bg-dark-border transition-colors touch-manipulation text-sm sm:text-base"
        >
          <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
            hasWorkout ? 'bg-emerald-600/60 shadow-[0_0_2px_rgba(5,150,105,0.3)]' : ''
          }`}>
            {day}
          </span>
        </button>
      );
    }

    return days;
  };

  // GitHub-style calendar: Generate all days from Jan 1 to Dec 31 for selected year
  const githubCalendarData = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1); // Jan 1
    const endDate = new Date(selectedYear, 11, 31); // Dec 31
    
    // Filter workouts for the selected year and create a Set of workout dates for quick lookup
    const workoutDates = new Set(
      allWorkouts
        .filter(workout => {
          const workoutYear = new Date(workout.date).getFullYear();
          return workoutYear === selectedYear;
        })
        .map(workout => workout.date)
    );

    // Generate all days of the year
    const days: Array<{ date: Date; hasWorkout: boolean }> = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days.push({
        date: new Date(currentDate),
        hasWorkout: workoutDates.has(dateStr),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group days by week (starting from the first day of the year's week)
    const weeks: Array<Array<{ date: Date; hasWorkout: boolean } | null>> = [];
    const firstDayOfYear = startDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Add empty cells for days before Jan 1
    const firstWeek: Array<{ date: Date; hasWorkout: boolean } | null> = [];
    for (let i = 0; i < firstDayOfYear; i++) {
      firstWeek.push(null);
    }
    
    // Add days to weeks
    let currentWeek = [...firstWeek];
    days.forEach((day) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    // Add remaining days to last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [allWorkouts, selectedYear]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get workouts for selected date
  const selectedWorkouts = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate;
    return allWorkouts.filter(workout => workout.date === dateStr);
  }, [selectedDate, allWorkouts]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatWorkoutType = (type: string): string => {
    if (type.startsWith('Other: ')) {
      return type.substring(7);
    }
    return type;
  };

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-8 pb-safe">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text mb-1 sm:mb-2">Calendar</h1>
          <p className="text-sm sm:text-base text-light-muted">View your calendar</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
          {/* Month Header with Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <button
              onClick={goToPreviousMonth}
              className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
              aria-label="Previous month"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-light-text px-2">
              {year} {monthNames[month]}
            </h2>

            <button
              onClick={goToNextMonth}
              className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
              aria-label="Next month"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="aspect-square flex items-center justify-center text-light-muted text-xs sm:text-sm font-medium"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {renderCalendarDays()}
          </div>
        </div>

        {/* GitHub-style Year Calendar */}
        <div className="mt-6 bg-dark-surface border border-dark-border rounded-2xl p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-light-text">
              Yearly Activity
            </h2>
            {availableYears.length > 0 ? (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-light-text text-sm sm:text-base focus:outline-none focus:border-light-muted transition-colors touch-manipulation"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-light-text text-sm sm:text-base focus:outline-none focus:border-light-muted transition-colors touch-manipulation"
              >
                <option value={selectedYear}>{selectedYear}</option>
              </select>
            )}
          </div>
          
          <div className="w-full">
            <div className="flex gap-px">
              {/* Day Labels */}
              <div className="flex flex-col gap-px pr-0.5">
                {dayLabels.map((label, idx) => {
                  // Match the exact height of boxes: h-2 = 8px (0.5rem)
                  const boxHeight = '8px';
                  return (
                    <div
                      key={label}
                      className={`text-[7px] sm:text-[8px] text-light-muted flex items-center justify-start ${
                        idx % 2 === 0 ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        height: boxHeight, 
                        minHeight: boxHeight,
                        maxHeight: boxHeight
                      }}
                    >
                      {idx % 2 === 0 ? label : ''}
                    </div>
                  );
                })}
              </div>

              {/* Calendar Grid */}
              <div className="flex gap-px flex-1 min-w-0">
                {githubCalendarData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-px flex-1 min-w-0">
                    {week.map((day, dayIdx) => {
                      if (day === null) {
                        return (
                          <div
                            key={`empty-${weekIdx}-${dayIdx}`}
                            className="w-full h-2 sm:h-2.5 md:h-2.5 rounded-sm"
                          />
                        );
                      }
                      
                      return (
                        <div
                          key={`${day.date.toISOString()}`}
                          className={`w-full h-2 sm:h-2.5 md:h-2.5 rounded-sm ${
                            day.hasWorkout
                              ? 'bg-emerald-600/60 shadow-[0_0_2px_rgba(5,150,105,0.3)]'
                              : 'bg-dark-border'
                          }`}
                          title={day.date.toLocaleDateString()}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Modal */}
      {isModalOpen && selectedDate && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-border sticky top-0 bg-dark-surface">
                <h2 className="text-xl font-semibold text-light-text">
                  {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-light-muted active:text-light-text transition-colors touch-manipulation"
                  aria-label="Close"
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

              {/* Content */}
              <div className="p-4">
                {selectedWorkouts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-light-muted">No workouts on this day</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-black border border-dark-border rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium text-light-text mb-3">
                          {formatWorkoutType(workout.type)} Workout
                        </h3>
                        {workout.exercises && workout.exercises.length > 0 ? (
                          <div className="space-y-3">
                            {workout.exercises.map((exercise) => (
                              <WorkoutEntry
                                key={exercise.id}
                                exercise={exercise}
                                showActions={false}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-light-muted text-sm">No exercises recorded</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

