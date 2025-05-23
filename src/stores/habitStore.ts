import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, startOfWeek, addDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Habit, HabitLog, Streak } from '../types';

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  streaks: Streak[];
  
  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, habit: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  
  // Log Actions
  toggleHabitCompletion: (habitId: string, date: string, value?: number) => void;
  updateHabitValue: (habitId: string, date: string, value: number) => void;
  updateHabitNote: (habitId: string, date: string, notes: string) => void;
  
  // Getters
  getHabitById: (id: string) => Habit | undefined;
  getActiveHabits: () => Habit[];
  getArchivedHabits: () => Habit[];
  getHabitLogsForDate: (date: string) => HabitLog[];
  getHabitLogsForDateRange: (startDate: string, endDate: string) => HabitLog[];
  getHabitLogsForHabit: (habitId: string) => HabitLog[];
  getHabitStreak: (habitId: string) => Streak;
  isHabitDueToday: (habit: Habit) => boolean;
  
  // Stats
  calculateCompletionRate: (habitId: string, days?: number) => number;
  getCompletionRateForDate: (date: string) => number;
  getCompletionRateForDateRange: (startDate: string, endDate: string) => number;
  getCurrentStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      streaks: [],

      // Habit Actions
      addHabit: (habitData) => {
        const newHabit: Habit = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...habitData,
        };
        
        set((state) => ({
          habits: [...state.habits, newHabit],
          streaks: [...state.streaks, { habitId: newHabit.id, current: 0, longest: 0 }],
        }));
      },

      updateHabit: (id, habitData) => {
        set((state) => ({
          habits: state.habits.map((habit) => 
            habit.id === id ? { ...habit, ...habitData } : habit
          ),
        }));
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) => 
            habit.id === id ? { ...habit, archivedAt: new Date().toISOString() } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          logs: state.logs.filter((log) => log.habitId !== id),
          streaks: state.streaks.filter((streak) => streak.habitId !== id),
        }));
      },

      // Log Actions
      toggleHabitCompletion: (habitId, date, value) => {
        const existingLog = get().logs.find(
          (log) => log.habitId === habitId && log.date === date
        );

        if (existingLog) {
          // Toggle existing log
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === existingLog.id
                ? { ...log, completed: !log.completed }
                : log
            ),
          }));
        } else {
          // Create new log
          const habit = get().getHabitById(habitId);
          const defaultValue = habit?.targetValue || undefined;
          
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date,
            completed: true,
            value: value !== undefined ? value : defaultValue,
          };
          
          set((state) => ({
            logs: [...state.logs, newLog],
          }));
        }
        
        // Update streaks
        const habit = get().getHabitById(habitId);
        if (habit) {
          get().updateStreak(habitId);
        }
      },

      updateHabitValue: (habitId, date, value) => {
        const existingLog = get().logs.find(
          (log) => log.habitId === habitId && log.date === date
        );

        if (existingLog) {
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === existingLog.id
                ? { ...log, value, completed: value > 0 }
                : log
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date,
            completed: value > 0,
            value,
          };
          
          set((state) => ({
            logs: [...state.logs, newLog],
          }));
        }
        
        // Update streaks
        get().updateStreak(habitId);
      },

      updateHabitNote: (habitId, date, notes) => {
        const existingLog = get().logs.find(
          (log) => log.habitId === habitId && log.date === date
        );

        if (existingLog) {
          set((state) => ({
            logs: state.logs.map((log) =>
              log.id === existingLog.id
                ? { ...log, notes }
                : log
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date,
            completed: false,
            notes,
          };
          
          set((state) => ({
            logs: [...state.logs, newLog],
          }));
        }
      },

      // Helper function to update streaks (not exposed in the API)
      updateStreak: (habitId) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return;

        const logs = get().getHabitLogsForHabit(habitId)
          .filter(log => log.completed)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (logs.length === 0) {
          set((state) => ({
            streaks: state.streaks.map((streak) =>
              streak.habitId === habitId
                ? { ...streak, current: 0 }
                : streak
            ),
          }));
          return;
        }

        // Calculate current streak
        let currentStreak = 1;
        let longestStreak = 1;
        const lastCompletedDate = logs[logs.length - 1].date;
        
        for (let i = logs.length - 1; i > 0; i--) {
          const currentDate = new Date(logs[i].date);
          const prevDate = new Date(logs[i - 1].date);
          
          // Check if current date is one day after previous date
          const diffInDays = Math.floor(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (diffInDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // Update streak in state
        set((state) => {
          const existingStreak = state.streaks.find((s) => s.habitId === habitId);
          
          if (existingStreak) {
            longestStreak = Math.max(existingStreak.longest, currentStreak);
            
            return {
              streaks: state.streaks.map((streak) =>
                streak.habitId === habitId
                  ? { 
                      ...streak, 
                      current: currentStreak, 
                      longest: longestStreak,
                      lastCompletedDate
                    }
                  : streak
              ),
            };
          } else {
            return {
              streaks: [
                ...state.streaks,
                { 
                  habitId, 
                  current: currentStreak, 
                  longest: currentStreak,
                  lastCompletedDate
                },
              ],
            };
          }
        });
      },

      // Getters
      getHabitById: (id) => {
        return get().habits.find((habit) => habit.id === id);
      },

      getActiveHabits: () => {
        return get().habits.filter((habit) => !habit.archivedAt);
      },

      getArchivedHabits: () => {
        return get().habits.filter((habit) => habit.archivedAt);
      },

      getHabitLogsForDate: (date) => {
        return get().logs.filter((log) => log.date === date);
      },

      getHabitLogsForDateRange: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return get().logs.filter((log) => {
          const logDate = new Date(log.date).getTime();
          return logDate >= start && logDate <= end;
        });
      },

      getHabitLogsForHabit: (habitId) => {
        return get().logs.filter((log) => log.habitId === habitId);
      },

      getHabitStreak: (habitId) => {
        const streak = get().streaks.find((s) => s.habitId === habitId);
        return streak || { habitId, current: 0, longest: 0 };
      },

      isHabitDueToday: (habit) => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        
        if (habit.frequency === 'daily') {
          return true;
        }
        
        if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
          return habit.targetDays.includes(dayOfWeek);
        }
        
        return false;
      },

      // Stats
      calculateCompletionRate: (habitId, days = 30) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return 0;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const dateRange = [];
        let currentDate = startDate;
        
        while (currentDate <= endDate) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          if (get().isHabitScheduledForDate(habit, dateStr)) {
            dateRange.push(dateStr);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (dateRange.length === 0) return 0;
        
        const logs = get().logs
          .filter(log => log.habitId === habitId && log.completed)
          .map(log => log.date);
        
        const completedDays = dateRange.filter(date => logs.includes(date)).length;
        
        return (completedDays / dateRange.length) * 100;
      },

      isHabitScheduledForDate: (habit, dateStr) => {
        if (habit.frequency === 'daily') return true;
        
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        
        return habit.targetDays.includes(dayOfWeek);
      },

      getCompletionRateForDate: (date) => {
        const habits = get().getActiveHabits().filter(habit => 
          get().isHabitScheduledForDate(habit, date)
        );
        
        if (habits.length === 0) return 0;
        
        const logs = get().getHabitLogsForDate(date);
        const completedHabits = habits.filter(habit => 
          logs.some(log => log.habitId === habit.id && log.completed)
        ).length;
        
        return (completedHabits / habits.length) * 100;
      },

      getCompletionRateForDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let totalCompletionRate = 0;
        let daysCount = 0;
        
        let currentDate = start;
        while (currentDate <= end) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const rate = get().getCompletionRateForDate(dateStr);
          
          if (rate > 0) {
            totalCompletionRate += rate;
            daysCount++;
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return daysCount > 0 ? totalCompletionRate / daysCount : 0;
      },

      getCurrentStreak: (habitId) => {
        const streak = get().streaks.find((s) => s.habitId === habitId);
        return streak ? streak.current : 0;
      },

      getLongestStreak: (habitId) => {
        const streak = get().streaks.find((s) => s.habitId === habitId);
        return streak ? streak.longest : 0;
      },
    }),
    {
      name: 'habit-store',
    }
  )
);