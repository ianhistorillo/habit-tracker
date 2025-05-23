import { format, parseISO, startOfWeek, addDays, isSameDay, subDays, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, setHours, setMinutes } from 'date-fns';

// Format date as YYYY-MM-DD
export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

// Format date for display
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
};

// Get day of week from date
export const getDayOfWeek = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getDay();
};

// Get days of week starting from Sunday
export const getDaysOfWeek = (
  weekStartsOn: 0 | 1 = 0 // 0 = Sunday, 1 = Monday
): string[] => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (weekStartsOn === 1) {
    return [...daysOfWeek.slice(1), daysOfWeek[0]];
  }
  
  return daysOfWeek;
};

// Get dates for current week
export const getDatesForWeek = (
  date: Date = new Date(),
  weekStartsOn: 0 | 1 = 0 // 0 = Sunday, 1 = Monday
): Date[] => {
  const startDate = startOfWeek(date, { weekStartsOn });
  
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

// Get dates for current month as a calendar grid (6 weeks)
export const getDatesForMonth = (
  date: Date = new Date(),
  weekStartsOn: 0 | 1 = 0 // 0 = Sunday, 1 = Monday
): Date[][] => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn });
  
  // 6 weeks to ensure we cover the full month view
  return Array.from({ length: 6 }, (_, weekIndex) => {
    const weekStart = addDays(startDate, weekIndex * 7);
    return Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex));
  });
};

// Get previous week dates
export const getPreviousWeek = (
  date: Date = new Date()
): Date => {
  return subWeeks(date, 1);
};

// Get next week dates
export const getNextWeek = (
  date: Date = new Date()
): Date => {
  return addWeeks(date, 1);
};

// Get previous month
export const getPreviousMonth = (
  date: Date = new Date()
): Date => {
  return subMonths(date, 1);
};

// Get next month
export const getNextMonth = (
  date: Date = new Date()
): Date => {
  return addMonths(date, 1);
};

// Check if date is today
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(dateObj, new Date());
};

// Get yesterday
export const getYesterday = (): Date => {
  return subDays(new Date(), 1);
};

// Get tomorrow
export const getTomorrow = (): Date => {
  return addDays(new Date(), 1);
};

// Get the start of day (00:00:00)
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return setHours(setMinutes(dateObj, 0), 0);
};

// Format month for display
export const formatMonthForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM yyyy');
};