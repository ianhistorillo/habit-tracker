export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays: number[]; // 0 = Sunday, 6 = Saturday
  targetValue?: number; // For quantifiable habits (e.g., drink 8 glasses of water)
  unit?: string; // For quantifiable habits (e.g., "glasses", "minutes")
  createdAt: string;
  archivedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // For quantifiable habits
  notes?: string;
}

export interface DailyHabitStatus {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
}

export interface Streak {
  habitId: string;
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  criteria: {
    type: 'streak' | 'completionRate' | 'totalCompleted';
    value: number;
    habitId?: string; // If specific to a habit
  };
}

export interface UserSettings {
  reminderTime?: string; // HH:MM format
  reminderEnabled: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export type ThemeMode = 'light' | 'dark';