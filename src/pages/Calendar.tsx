import React, { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';

export const Calendar: React.FC = () => {
  const { allWorkouts } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());

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
      days.push(
        <div
          key={day}
          className="aspect-square flex items-center justify-center text-light-text rounded-lg active:bg-dark-border transition-colors touch-manipulation text-sm sm:text-base"
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // GitHub-style calendar: Generate all days from Jan 1 to Dec 31
  const githubCalendarData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // Jan 1
    const endDate = new Date(currentYear, 11, 31); // Dec 31
    
    // Create a Set of workout dates for quick lookup
    const workoutDates = new Set(
      allWorkouts.map(workout => workout.date)
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
  }, [allWorkouts]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        <div className="mt-6 bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-light-text mb-4">
            {new Date().getFullYear()} Workout Activity
          </h2>
          
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {/* Day Labels */}
              <div className="flex flex-col gap-1 pr-2">
                {dayLabels.map((label, idx) => (
                  <div
                    key={label}
                    className={`text-xs sm:text-sm text-light-muted flex items-center justify-end h-3 sm:h-4 ${
                      idx % 2 === 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ minHeight: '12px' }}
                  >
                    {idx % 2 === 0 ? label : ''}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="flex gap-1">
                {githubCalendarData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => {
                      if (day === null) {
                        return (
                          <div
                            key={`empty-${weekIdx}-${dayIdx}`}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                          />
                        );
                      }
                      
                      return (
                        <div
                          key={`${day.date.toISOString()}`}
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${
                            day.hasWorkout
                              ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]'
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

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs sm:text-sm text-light-muted">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-dark-border" />
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

