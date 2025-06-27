export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: "daily" | "weekly" | "custom";
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
    type: "streak" | "completionRate" | "totalCompleted";
    value: number;
    habitId?: string; // If specific to a habit
  };
}

export interface UserSettings {
  reminderTime?: string; // HH:MM format
  reminderEnabled: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export type ThemeMode = "light" | "dark";

export interface HabitGoal {
  id: string;
  habitId: string;
  targetDays: number;
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
}

export interface GoalAssessment {
  id: string;
  goalId: string;
  date: string;
  status: "hit" | "miss";
  notes?: string;
  createdAt: string;
}

// Routine Types
export interface Routine {
  id: string;
  name: string;
  description?: string;
  habitIds: string[];
  reminderTime?: string; // HH:MM format
  color: string;
  icon: string;
  createdAt: string;
  archivedAt?: string;
}

export interface RoutineLog {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedHabits: string[]; // Array of habit IDs that were completed
  notes?: string;
  createdAt: string;
}

export interface RoutineStreak {
  routineId: string;
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

// New Enhanced Features Types
export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "morning"
    | "evening"
    | "fitness"
    | "productivity"
    | "wellness"
    | "custom";
  icon: string;
  color: string;
  estimatedDuration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  habits: {
    name: string;
    description: string;
    icon: string;
    frequency: "daily" | "weekly" | "custom";
    targetDays: number[];
    targetValue?: number;
    unit?: string;
  }[];
  tags: string[];
  popularity: number; // 1-5 rating
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  type: "routine" | "habit" | "reminder";
  relatedId: string; // routine or habit ID
  color: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
  };
}

export interface SmartSuggestion {
  id: string;
  type: "routine" | "habit" | "optimization";
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-1 score
  category: string;
  actionData: {
    templateId?: string;
    habitSuggestions?: Partial<Habit>[];
    routineData?: Partial<Routine>;
    optimizationTips?: string[];
  };
  createdAt: string;
  dismissed?: boolean;
  applied?: boolean;
}

export interface UserPattern {
  userId: string;
  completionTimes: Record<string, string[]>; // habitId -> array of completion times
  streakPatterns: Record<string, number[]>; // habitId -> streak lengths
  weeklyPatterns: Record<string, number[]>; // habitId -> completion by day of week
  seasonalPatterns: Record<string, Record<string, number>>; // habitId -> month -> completion rate
  correlations: Array<{
    habit1: string;
    habit2: string;
    correlation: number;
  }>;
  lastAnalyzed: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  age?: number;
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  occupationCategory?:
    | "student"
    | "professional"
    | "retired"
    | "unemployed"
    | "self-employed"
    | "other";
  heightCm?: number;
  weightKg?: number;
  lifestyleFocus?: LifestyleFocus[];
  surveyCompleted: boolean;
  surveyCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LifestyleFocus =
  | "health-wellness"
  | "work-career"
  | "family-relationship"
  | "financial"
  | "social-leisure"
  | "technological"
  | "cultural-spiritual"
  | "environment-ethical";

export interface HabitRecommendation {
  id: string;
  userId: string;
  category: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: "daily" | "weekly" | "custom";
  targetDays: number[];
  targetValue?: number;
  unit?: string;
  reasoning: string;
  confidenceScore: number;
  tags: string[];
  isApplied: boolean;
  createdAt: string;
}

export interface SurveyData {
  displayName: string;
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  occupationCategory:
    | "student"
    | "professional"
    | "retired"
    | "unemployed"
    | "self-employed"
    | "other";
  heightCm?: number;
  weightKg?: number;
  lifestyleFocus: LifestyleFocus[];
}
