import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import type { Workout } from '../types';
import { 
  getLocalDateString,
  getWeekRange,
  formatWeekRange,
  parseLocalDate
} from '../lib/dateUtils';
import { WorkoutModal } from '../components/WorkoutModal';
import { MuscleFrequencyMap } from '../components/MuscleFrequencyMap';
import { getMuscleHitCounts } from '../lib/muscleMapping';

type ViewType = 'year' | 'month' | 'week';

interface WorkoutTimeRange {
  workout: Workout;
  startTime: Date;
  endTime: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export const Calendar: React.FC = () => {
  const { allWorkouts } = useWorkout();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters if present (using lazy initializer)
  const [viewType, setViewType] = useState<ViewType>(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && (viewParam === 'year' || viewParam === 'month' || viewParam === 'week')) {
      return viewParam as ViewType;
    }
    return 'month';
  });
  
  const [currentDate, setCurrentDate] = useState(() => {
    const viewParam = searchParams.get('view');
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsedDate = parseLocalDate(dateParam);
      if (viewParam === 'month') {
        return parsedDate;
      } else if (viewParam === 'year') {
        return new Date(parsedDate.getFullYear(), 0, 1);
      }
    }
    return new Date();
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const viewParam = searchParams.get('view');
    const dateParam = searchParams.get('date');
    if (viewParam === 'week' && dateParam) {
      return parseLocalDate(dateParam);
    }
    return null;
  });
  
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const viewParam = searchParams.get('view');
    const dateParam = searchParams.get('date');
    if (viewParam === 'year' && dateParam) {
      return parseLocalDate(dateParam).getFullYear();
    }
    return new Date().getFullYear();
  });
  
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMuscleFrequencyInMonthView, setShowMuscleFrequencyInMonthView] = useState(false);
  const [showMuscleFrequencyInYearView, setShowMuscleFrequencyInYearView] = useState(false);
  const [showMuscleFrequencyInWeekView, setShowMuscleFrequencyInWeekView] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const initializedFromURL = useRef(false);

  // Mark that we initialized from URL if params exist
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const dateParam = searchParams.get('date');
    if (viewParam || dateParam) {
      initializedFromURL.current = true;
    }
  }, []);

  // Clear URL params after reading them (only once on mount)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const dateParam = searchParams.get('date');
    
    if (viewParam || dateParam) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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

  // Update selected year when default changes (e.g., when data loads), but only if not initialized from URL
  useEffect(() => {
    if (!initializedFromURL.current) {
      setSelectedYear(defaultYear);
      if (viewType === 'year') {
        setCurrentDate(new Date(defaultYear, 0, 1));
      } else if (viewType === 'month') {
        const currentYear = new Date().getFullYear();
        // If defaultYear is the current year, show current month; otherwise show January
        const monthToShow = defaultYear === currentYear ? new Date().getMonth() : 0;
        setCurrentDate(new Date(defaultYear, monthToShow, 1));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultYear]); // Only run when defaultYear changes, not when viewType changes

  // Helper functions - defined before useMemo hooks that use them
  // Calculate workout time ranges for timeline display
  const getWorkoutTimeRange = (workout: Workout): WorkoutTimeRange | null => {
    if (!workout.created_at) return null;
    
    const startTime = new Date(workout.created_at);
    let endTime = startTime;
    
    // Use last exercise's created_at as end time if available
    if (workout.exercises && workout.exercises.length > 0) {
      const exerciseTimes = workout.exercises
        .map(ex => ex.created_at ? new Date(ex.created_at) : null)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending
      
      if (exerciseTimes.length > 0) {
        endTime = exerciseTimes[0]; // Most recent exercise
      }
    }
    
    return {
      workout,
      startTime,
      endTime,
      startHour: startTime.getHours(),
      startMinute: startTime.getMinutes(),
      endHour: endTime.getHours(),
      endMinute: endTime.getMinutes(),
    };
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = (date: Date): Workout[] => {
    const dateStr = getLocalDateString(date);
    return allWorkouts.filter(workout => workout.date === dateStr);
  };

  // Calculate workout time ranges for selected date (for week view)
  const workoutTimeRangesForSelectedDate = useMemo(() => {
    if (!selectedDate || viewType !== 'week') return [];
    const workouts = getWorkoutsForDate(selectedDate);
    return workouts
      .map(getWorkoutTimeRange)
      .filter((range): range is WorkoutTimeRange => range !== null)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [selectedDate, viewType, allWorkouts]);

  // Calculate initial scroll position (1 hour before first workout)
  const initialScrollHour = useMemo(() => {
    if (workoutTimeRangesForSelectedDate.length === 0) return 8; // Default to 8 AM if no workouts
    const firstWorkout = workoutTimeRangesForSelectedDate[0];
    const firstHour = firstWorkout.startHour;
    return Math.max(0, firstHour - 1);
  }, [workoutTimeRangesForSelectedDate]);

  // Scroll to initial position when entering week view or date changes
  useEffect(() => {
    if (viewType === 'week' && selectedDate && timelineRef.current) {
      const hourHeight = 60; // Height per hour in pixels
      const scrollPosition = initialScrollHour * hourHeight;
      timelineRef.current.scrollTop = scrollPosition;
    }
  }, [viewType, selectedDate, initialScrollHour]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate muscle frequencies based on current view
  const muscleFrequencies = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (viewType === 'week' && selectedDate) {
      // Weekly view: Sunday to Saturday of the selected week
      const weekRange = getWeekRange(selectedDate);
      startDate = weekRange.start;
      endDate = weekRange.end;
    } else if (viewType === 'month') {
      // Monthly view: 1st to last day of the current month
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else {
      // Yearly view: Jan 1 to Dec 31 of the selected year
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    }

    // Get all workouts in the date range
    const workoutsInRange = allWorkouts.filter(workout => {
      const workoutDate = parseLocalDate(workout.date);
      // Compare dates at midnight to ensure accurate comparison
      const workoutDateStart = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
      const startDateStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return workoutDateStart >= startDateStart && workoutDateStart <= endDateStart;
    });

    // Collect all exercises from workouts in range
    const allExercises = workoutsInRange.flatMap(workout => workout.exercises || []);

    // Calculate muscle hit counts
    const muscleHitCounts = getMuscleHitCounts(allExercises);

    return muscleHitCounts;
  }, [viewType, selectedDate, year, month, selectedYear, allWorkouts]);

  const today = new Date();
  const todayStr = getLocalDateString(today);

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Week navigation functions
  const goToPreviousWeek = () => {
    if (selectedDate) {
      const weekRange = getWeekRange(selectedDate);
      const newDate = new Date(weekRange.start);
      newDate.setDate(newDate.getDate() - 7);
      setSelectedDate(newDate);
    }
  };

  const goToNextWeek = () => {
    if (selectedDate) {
      const weekRange = getWeekRange(selectedDate);
      const newDate = new Date(weekRange.start);
      newDate.setDate(newDate.getDate() + 7);
      setSelectedDate(newDate);
    }
  };

  // Check if a date has workouts
  const dateHasWorkout = (date: Date): boolean => {
    return getWorkoutsForDate(date).length > 0;
  };

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    return getLocalDateString(date) === todayStr;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setViewType('week');
    setShowMuscleFrequencyInWeekView(false); // Reset to calendar view when entering week view
  };

  const handleMonthClick = (monthIndex: number) => {
    setCurrentDate(new Date(selectedYear, monthIndex, 1));
    setViewType('month');
    setShowMuscleFrequencyInMonthView(false); // Reset to calendar view when entering month view
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalDate(null);
  };

  // Handle year change
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    setCurrentDate(new Date(newYear, 0, 1));
  };

  const goToPreviousYear = () => {
    const newYear = selectedYear - 1;
    handleYearChange(newYear);
  };

  const goToNextYear = () => {
    const newYear = selectedYear + 1;
    handleYearChange(newYear);
  };

  // Render year view with mini calendars showing boxes instead of dates
  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-light-muted hover:text-light-text transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Dashboard</span>
          </button>

          {/* Toggle Button */}
          <button
            onClick={() => setShowMuscleFrequencyInYearView(!showMuscleFrequencyInYearView)}
            className="text-sm sm:text-base px-3 py-1.5 rounded-lg bg-dark-border hover:bg-dark-border/80 text-light-text transition-colors touch-manipulation"
          >
            {showMuscleFrequencyInYearView ? 'Yearly View' : 'Muscles Worked'}
          </button>
        </div>

        {/* Year Navigation */}
        <div className="mb-4 flex items-center justify-center gap-4">
          <button
            onClick={goToPreviousYear}
            className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
            aria-label="Previous year"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-lg sm:text-xl font-semibold text-light-text">
            {selectedYear}
          </div>

          <button
            onClick={goToNextYear}
            className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
            aria-label="Next year"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {showMuscleFrequencyInYearView ? (
          /* Muscle Frequency Visualization */
          <div className="py-4">
            <MuscleFrequencyMap muscleFrequencies={muscleFrequencies} />
          </div>
        ) : (
          /* Month Grid */
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {months.map((monthIndex) => {
              const monthStart = new Date(selectedYear, monthIndex, 1);
              const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
              const daysInMonth = monthEnd.getDate();
              const firstDayOfWeek = monthStart.getDay();
              
              // Get dates for this month
              const monthDates: (number | null)[] = [];
              for (let i = 0; i < firstDayOfWeek; i++) {
                monthDates.push(null);
              }
              for (let day = 1; day <= daysInMonth; day++) {
                monthDates.push(day);
              }

              return (
                <button
                  key={monthIndex}
                  onClick={() => handleMonthClick(monthIndex)}
                  className="text-left p-2 sm:p-3 rounded-lg hover:bg-dark-border transition-colors"
                >
                  <div className="text-sm sm:text-base font-semibold text-light-text mb-2">
                    {fullMonthNames[monthIndex]}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {dayNames.map(day => (
                      <div key={day} className="text-light-muted text-center py-0.5 text-[8px] sm:text-[9px]">
                        {day[0]}
                      </div>
                    ))}
                    {monthDates.map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                      }
                      const dayDate = new Date(selectedYear, monthIndex, day);
                      const hasWorkout = dateHasWorkout(dayDate);
                      const dayIsToday = isToday(dayDate);
                      
                      return (
                        <div
                          key={day}
                          className={`aspect-square rounded ${
                            hasWorkout
                              ? dayIsToday
                                ? 'bg-emerald-600/60 ring-1 ring-white' // Green with white border
                                : 'bg-emerald-600/60' // Just green
                              : dayIsToday
                                ? 'ring-1 ring-white' // White ring only if no workout
                                : 'bg-dark-border'
                          }`}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render monthly calendar days
  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
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
      const dayIsToday = isToday(dayDate);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className="aspect-square flex items-center justify-center rounded-lg active:bg-dark-border transition-colors touch-manipulation text-sm sm:text-base"
        >
          <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
            hasWorkout
              ? dayIsToday
                ? 'bg-emerald-600/60 ring-2 ring-white text-white' // Green with white border
                : 'bg-emerald-600/60 text-white' // Just green
              : dayIsToday
                ? 'ring-2 ring-white text-white' // White ring only if no workout
                : 'text-light-text'
          }`}>
            {day}
          </span>
        </button>
      );
    }

    return days;
  };

  // Render monthly view
  const renderMonthlyView = () => {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              setViewType('year');
              setShowMuscleFrequencyInYearView(false); // Reset to calendar view when navigating back
            }}
            className="text-light-muted hover:text-light-text transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">{year}</span>
          </button>

          {/* Toggle Button */}
          <button
            onClick={() => setShowMuscleFrequencyInMonthView(!showMuscleFrequencyInMonthView)}
            className="text-sm sm:text-base px-3 py-1.5 rounded-lg bg-dark-border hover:bg-dark-border/80 text-light-text transition-colors touch-manipulation"
          >
            {showMuscleFrequencyInMonthView ? 'Monthly View' : 'Muscles Worked'}
          </button>
        </div>

        {showMuscleFrequencyInMonthView ? (
          /* Muscle Frequency Visualization */
          <div>
            {/* Month Header with Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                onClick={goToPreviousMonth}
                className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Previous month"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h2 className="text-lg sm:text-xl font-semibold text-light-text px-2">
                {fullMonthNames[month]} {year}
              </h2>

              <button
                onClick={goToNextMonth}
                className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Next month"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Muscle Frequency Map */}
            <div className="py-4">
              <MuscleFrequencyMap muscleFrequencies={muscleFrequencies} />
            </div>
          </div>
        ) : (
          <>
            {/* Month Header with Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                onClick={goToPreviousMonth}
                className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Previous month"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h2 className="text-lg sm:text-xl font-semibold text-light-text px-2">
                {fullMonthNames[month]} {year}
              </h2>

              <button
                onClick={goToNextMonth}
                className="min-w-[44px] min-h-[44px] p-3 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Next month"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          </>
        )}
      </div>
    );
  };

  // Render week view with single day timeline
  const renderWeekView = () => {
    if (!selectedDate) return null;

    // Get current week range
    const weekRange = getWeekRange(selectedDate);
    const weekDays: Date[] = [];
    const startDate = new Date(weekRange.start);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      weekDays.push(day);
    }

    // Generate all hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-3 sm:p-4 md:p-6">
        {/* Back Button with Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              setViewType('month');
              setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
              setSelectedDate(null);
              setShowMuscleFrequencyInMonthView(false); // Reset to calendar view when navigating back
            }}
            className="text-light-muted hover:text-light-text transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">{fullMonthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
          </button>

          {/* Toggle Button */}
          <button
            onClick={() => setShowMuscleFrequencyInWeekView(!showMuscleFrequencyInWeekView)}
            className="text-sm sm:text-base px-3 py-1.5 rounded-lg bg-dark-border hover:bg-dark-border/80 text-light-text transition-colors touch-manipulation"
          >
            {showMuscleFrequencyInWeekView ? 'Weekly View' : 'Muscles Worked'}
          </button>
        </div>

        {showMuscleFrequencyInWeekView ? (
          /* Muscle Frequency Visualization */
          <div>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousWeek}
                className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Previous week"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-sm sm:text-base text-light-text font-medium">
                {formatWeekRange(weekRange.start, weekRange.end)}
              </div>

              <button
                onClick={goToNextWeek}
                className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                aria-label="Next week"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Muscle Frequency Map */}
            <div className="py-4">
              <MuscleFrequencyMap muscleFrequencies={muscleFrequencies} />
            </div>
          </div>
        ) : (
          <>
            {/* Week Selector Bar */}
            <div className="mb-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPreviousWeek}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                  aria-label="Previous week"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-sm sm:text-base text-light-text font-medium">
                  {formatWeekRange(weekRange.start, weekRange.end)}
                </div>

                <button
                  onClick={goToNextWeek}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-full text-light-text active:bg-dark-border active:text-light-muted transition-colors touch-manipulation"
                  aria-label="Next week"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Days Bar */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dayHasWorkout = dateHasWorkout(day);
                  const dayIsTodayInWeek = isToday(day);
                  const isSelected = getLocalDateString(day) === getLocalDateString(selectedDate);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                        isSelected ? 'bg-dark-border' : 'hover:bg-dark-border/50'
                      }`}
                    >
                      <div className="text-xs text-light-muted">{dayNames[idx]}</div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        dayHasWorkout
                          ? dayIsTodayInWeek
                            ? 'bg-emerald-600/60 ring-2 ring-white' // Green with white border
                            : 'bg-emerald-600/60' // Just green
                          : dayIsTodayInWeek
                            ? 'ring-2 ring-white text-white' // White ring only if no workout
                            : ''
                      } ${
                        isSelected && !dayHasWorkout
                          ? 'text-light-text'
                          : dayHasWorkout
                            ? 'text-white'
                            : 'text-light-muted'
                      }`}>
                        {day.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div 
              ref={timelineRef}
              className="border border-dark-border rounded-lg overflow-y-auto relative"
              style={{ height: '400px' }} // Shows ~5-6 hours at a time
            >
              {/* Hour Labels and Grid with Workout Blocks */}
              <div className="relative" style={{ minHeight: '1440px' }}> {/* 24 hours * 60px */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="relative border-t border-dark-border/30"
                    style={{ height: '60px' }}
                  >
                    <div className="absolute left-2 top-1 text-[10px] text-light-muted">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  </div>
                ))}

                {/* Workout Blocks */}
                {workoutTimeRangesForSelectedDate.map((timeRange, workoutIdx) => {
                  const startMinutes = timeRange.startHour * 60 + timeRange.startMinute;
                  const endMinutes = timeRange.endHour * 60 + timeRange.endMinute;
                  const duration = endMinutes - startMinutes;
                  const topPixels = (startMinutes / 60) * 60; // 60px per hour
                  const heightPixels = (duration / 60) * 60;

                  const handleWorkoutClick = () => {
                    if (selectedDate) {
                      const dateString = getLocalDateString(selectedDate);
                      navigate(`/calendar/day/${dateString}?view=week&calendarDate=${dateString}`);
                    }
                  };

                  return (
                    <div
                      key={workoutIdx}
                      className="absolute left-12 right-2 bg-emerald-600/60 border border-emerald-500/50 rounded px-2 py-1 cursor-pointer hover:bg-emerald-600/80 transition-colors z-10"
                      style={{
                        top: `${topPixels}px`,
                        height: `${Math.max(heightPixels, 40)}px`,
                        minHeight: '40px',
                      }}
                      onClick={handleWorkoutClick}
                      title={`${timeRange.workout.type} - ${timeRange.startHour}:${String(timeRange.startMinute).padStart(2, '0')} - ${timeRange.endHour}:${String(timeRange.endMinute).padStart(2, '0')}`}
                    >
                      <div className="text-xs text-white font-medium truncate">
                        {timeRange.workout.type.startsWith('Other: ') 
                          ? timeRange.workout.type.substring(7)
                          : timeRange.workout.type}
                      </div>
                      <div className="text-[10px] text-emerald-100 truncate">
                        {timeRange.startHour}:{String(timeRange.startMinute).padStart(2, '0')} - {timeRange.endHour}:{String(timeRange.endMinute).padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ============================================
   * LEGACY CODE - UNUSED
   * This code was for the previous yearly calendar view
   * Kept for reference but not currently used
   * ============================================ */
  
  // GitHub-style calendar: Generate all days from Jan 1 to Dec 31 for selected year
  // const githubCalendarData = useMemo(() => {
  //   const startDate = new Date(selectedYear, 0, 1); // Jan 1
  //   const endDate = new Date(selectedYear, 11, 31); // Dec 31
  //   
  //   // Filter workouts for the selected year and create a Set of workout dates for quick lookup
  //   const workoutDates = new Set(
  //     allWorkouts
  //       .filter(workout => {
  //         const workoutYear = new Date(workout.date).getFullYear();
  //         return workoutYear === selectedYear;
  //       })
  //       .map(workout => workout.date)
  //   );

  //   // Generate all days of the year
  //   const days: Array<{ date: Date; hasWorkout: boolean }> = [];
  //   const currentDate = new Date(startDate);
  //   
  //   while (currentDate <= endDate) {
  //     const dateStr = getLocalDateString(currentDate);
  //     days.push({
  //       date: new Date(currentDate),
  //       hasWorkout: workoutDates.has(dateStr),
  //     });
  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }

  //   // Group days by week (starting from the first day of the year's week)
  //   const weeks: Array<Array<{ date: Date; hasWorkout: boolean } | null>> = [];
  //   const firstDayOfYear = startDate.getDay(); // 0 = Sunday, 6 = Saturday
  //   
  //   // Add empty cells for days before Jan 1
  //   const firstWeek: Array<{ date: Date; hasWorkout: boolean } | null> = [];
  //   for (let i = 0; i < firstDayOfYear; i++) {
  //     firstWeek.push(null);
  //   }
  //   
  //   // Add days to weeks
  //   let currentWeek = [...firstWeek];
  //   days.forEach((day) => {
  //     if (currentWeek.length === 7) {
  //       weeks.push(currentWeek);
  //       currentWeek = [];
  //     }
  //     currentWeek.push(day);
  //   });
  //   
  //   // Add remaining days to last week
  //   if (currentWeek.length > 0) {
  //     while (currentWeek.length < 7) {
  //       currentWeek.push(null);
  //     }
  //     weeks.push(currentWeek);
  //   }

  //   return weeks;
  // }, [allWorkouts, selectedYear]);

  // // Calculate which week each month starts in
  // const monthPositions = useMemo(() => {
  //   const positions: Map<number, number> = new Map(); // month index -> week index
  //   const startDate = new Date(selectedYear, 0, 1);
  //   const firstDayOfYear = startDate.getDay();
  //   
  //   // Calculate week index for each month's first day
  //   // The first week has firstDayOfYear empty cells, then the days start
  //   for (let month = 0; month < 12; month++) {
  //     const monthStart = new Date(selectedYear, month, 1);
  //     const dayOfYear = Math.floor((monthStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  //     // Week index accounts for the first week having empty cells
  //     const weekIndex = Math.floor((dayOfYear + firstDayOfYear) / 7);
  //     positions.set(month, weekIndex);
  //   }
  //   
  //   return positions;
  // }, [selectedYear]);

  // const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // // Render yearly view (LEGACY - UNUSED)
  // const renderYearlyView = () => {
  //   return (
  //     <div className="bg-dark-surface border border-dark-border rounded-2xl p-2 sm:p-3 md:p-4 min-h-[600px] flex flex-col">
  //       <div className="flex-1 flex flex-col">
  //         <div className="w-full flex-1">
  //           <div className="flex gap-px h-full">
  //             {/* Day Labels */}
  //             <div className="flex flex-col gap-px pr-0.5 mt-4 sm:mt-5">
  //               {dayLabels.map((label, idx) => {
  //                 return (
  //                   <div
  //                     key={label}
  //                     className={`text-[7px] sm:text-[8px] text-light-muted flex items-start justify-start h-2 sm:h-2.5 md:h-2.5 ${
  //                       idx % 2 === 0 ? 'opacity-100' : 'opacity-0'
  //                     }`}
  //                   >
  //                     {idx % 2 === 0 ? label : ''}
  //                   </div>
  //                 );
  //               })}
  //             </div>

  //             {/* Calendar Grid */}
  //             <div className="flex gap-px flex-1 min-w-0 relative">
  //               {/* Month Labels Row */}
  //               <div className="absolute top-0 left-0 right-0 flex gap-px" style={{ height: '16px' }}>
  //                 {githubCalendarData.map((_week, weekIdx) => {
  //                   // Check if this week contains the first day of any month
  //                   const monthForWeek = Array.from(monthPositions.entries()).find(
  //                     ([_month, weekIndex]) => weekIndex === weekIdx
  //                   );
  //                   
  //                   return (
  //                     <div
  //                       key={`month-label-${weekIdx}`}
  //                       className="flex-1 min-w-0 flex items-start justify-start"
  //                     >
  //                       {monthForWeek && (
  //                         <span className="text-[9px] sm:text-[10px] text-light-muted px-0.5">
  //                           {monthNames[monthForWeek[0]]}
  //                         </span>
  //                       )}
  //                     </div>
  //                   );
  //                 })}
  //               </div>

  //               {/* Calendar Days */}
  //               <div className="flex gap-px flex-1 min-w-0 mt-4 sm:mt-5">
  //                 {githubCalendarData.map((week, weekIdx) => (
  //                   <div key={weekIdx} className="flex flex-col gap-px flex-1 min-w-0">
  //                     {week.map((day, dayIdx) => {
  //                       if (day === null) {
  //                         return (
  //                           <div
  //                             key={`empty-${weekIdx}-${dayIdx}`}
  //                             className="w-full h-2 sm:h-2.5 md:h-2.5 rounded-sm"
  //                           />
  //                         );
  //                       }
  //                       
  //                       return (
  //                         <div
  //                           key={`${day.date.toISOString()}`}
  //                           className={`w-full h-2 sm:h-2.5 md:h-2.5 rounded-sm ${
  //                             day.hasWorkout
  //                               ? 'bg-emerald-600/60 shadow-[0_0_2px_rgba(5,150,105,0.3)]'
  //                               : 'bg-dark-border'
  //                           }`}
  //                           title={day.date.toLocaleDateString()}
  //                         />
  //                       );
  //                     })}
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Stats Placeholder - Takes remaining space to match other views */}
  //       <div className="mt-6 pt-6 border-t border-dark-border flex-1 flex items-center justify-center min-h-[100px]">
  //         <p className="text-light-muted text-sm text-center">
  //           Stats coming soon...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-8 pb-safe">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text mb-1 sm:mb-2">Calendar</h1>
          <p className="text-sm sm:text-base text-light-muted">View your calendar</p>
        </div>

        {/* Render Current View */}
        {viewType === 'year' && renderYearView()}
        {viewType === 'month' && renderMonthlyView()}
        {viewType === 'week' && renderWeekView()}
      </div>

      {/* Workout Modal */}
      {isModalOpen && modalDate && (
        <WorkoutModal
          workouts={getWorkoutsForDate(modalDate)}
          date={modalDate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
