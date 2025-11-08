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

