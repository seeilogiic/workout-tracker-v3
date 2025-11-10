/**
 * Formats a date as YYYY-MM-DD using the local timezone.
 * This ensures dates are based on the user's local time, not UTC.
 * 
 * @param date - The date to format. Defaults to current date if not provided.
 * @returns A string in YYYY-MM-DD format using local timezone
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD date string as a local date (not UTC).
 * This fixes the issue where new Date("2024-01-15") is interpreted as UTC midnight,
 * which can cause dates to display incorrectly in timezones behind UTC.
 * 
 * @param dateString - A date string in YYYY-MM-DD format
 * @returns A Date object representing the date in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the Sunday of the week containing the given date
 * @param date - The date to get the week start for
 * @returns A Date object representing Sunday of that week
 */
export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = d.getDate() - day; // Subtract days to get to Sunday
  return new Date(d.setDate(diff));
}

/**
 * Gets the Saturday of the week containing the given date
 * @param date - The date to get the week end for
 * @returns A Date object representing Saturday of that week
 */
export function getWeekEndDate(date: Date): Date {
  const start = getWeekStartDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Add 6 days to get Saturday
  return end;
}

/**
 * Gets the week range (Sunday to Saturday) for a given date
 * @param date - The date to get the week range for
 * @returns An object with start (Sunday) and end (Saturday) dates
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: getWeekStartDate(date),
    end: getWeekEndDate(date),
  };
}

/**
 * Formats a week range as a readable string
 * @param start - The start date (Sunday)
 * @param end - The end date (Saturday)
 * @returns A formatted string like "Jan 7 - Jan 13, 2024"
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const year = start.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Gets all weeks in a given year
 * @param year - The year to get weeks for
 * @returns An array of week objects with start, end dates and week number
 */
export function getWeeksInYear(year: number): Array<{ start: Date; end: Date; weekNum: number }> {
  const weeks: Array<{ start: Date; end: Date; weekNum: number }> = [];
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  
  // Get the Sunday of the week containing Jan 1
  const firstSunday = getWeekStartDate(jan1);
  
  // If Jan 1 is not Sunday, the first week might start in the previous year
  // We'll start from the first Sunday of the year (or before)
  let currentDate = new Date(firstSunday);
  let weekNum = 1;
  
  while (currentDate <= dec31) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(currentDate.getDate() + 6);
    
    // Only include weeks that have at least one day in the target year
    if (weekEnd >= jan1 && currentDate <= dec31) {
      weeks.push({
        start: new Date(currentDate),
        end: new Date(weekEnd),
        weekNum: weekNum++,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Gets all months in a given year
 * @param year - The year to get months for
 * @returns An array of month objects with month index, year, and label
 */
export function getMonthsInYear(year: number): Array<{ month: number; year: number; label: string }> {
  const months: Array<{ month: number; year: number; label: string }> = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  for (let month = 0; month < 12; month++) {
    months.push({
      month,
      year,
      label: `${monthNames[month]} ${year}`,
    });
  }
  
  return months;
}

