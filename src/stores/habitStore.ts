import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  format,
  startOfWeek,
  addDays,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { Habit, HabitLog, Streak } from "../types";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./authStore";
import { toast } from "sonner";

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  streaks: Streak[];

  // Habit Actions
  addHabit: (
    habit: Omit<Habit, "id" | "createdAt" | "userId">
  ) => Promise<void>;
  updateHabit: (
    id: string,
    habit: Partial<Omit<Habit, "id" | "createdAt" | "userId">>
  ) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Log Actions
  toggleHabitCompletion: (
    habitId: string,
    date: string,
    value?: number
  ) => Promise<void>;
  updateHabitValue: (
    habitId: string,
    date: string,
    value: number
  ) => Promise<void>;
  updateHabitNote: (
    habitId: string,
    date: string,
    notes: string
  ) => Promise<void>;

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

  // Data Sync
  fetchUserData: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>()((set, get) => ({
  habits: [],
  logs: [],
  streaks: [],

  // Fetch user data
  fetchUserData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Fetch habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      if (habitsError) throw habitsError;

      // Transform the data to match our frontend model
      const transformedHabits = habits.map((habit) => ({
        id: habit.id,
        userId: habit.user_id,
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency,
        targetDays: habit.target_days,
        targetValue: habit.target_value,
        unit: habit.unit,
        createdAt: habit.created_at,
        archivedAt: habit.archived_at,
      }));

      // Fetch logs
      const { data: logs, error: logsError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id);

      if (logsError) throw logsError;

      // Transform logs
      const transformedLogs = logs.map((log) => ({
        id: log.id,
        habitId: log.habit_id,
        date: log.date,
        completed: log.completed,
        value: log.value,
        notes: log.notes,
      }));

      // Fetch streaks
      const { data: streaks, error: streaksError } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id);

      if (streaksError) throw streaksError;

      // Transform streaks
      const transformedStreaks = streaks.map((streak) => ({
        habitId: streak.habit_id,
        current: streak.current,
        longest: streak.longest,
        lastCompletedDate: streak.last_completed_date,
      }));

      set({
        habits: transformedHabits,
        logs: transformedLogs,
        streaks: transformedStreaks,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load your habits");
    }
  },

  // Habit Actions
  addHabit: async (habitData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Transform the data to match the database schema
      const dbHabit = {
        user_id: user.id,
        name: habitData.name,
        description: habitData.description,
        icon: habitData.icon,
        color: habitData.color,
        frequency: habitData.frequency,
        target_days: habitData.targetDays,
        target_value: habitData.targetValue,
        unit: habitData.unit,
      };

      const { data: habit, error } = await supabase
        .from("habits")
        .insert([dbHabit])
        .select()
        .single();

      if (error) throw error;

      // Transform the response back to our frontend model
      const newHabit: Habit = {
        id: habit.id,
        userId: habit.user_id,
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency,
        targetDays: habit.target_days,
        targetValue: habit.target_value,
        unit: habit.unit,
        createdAt: habit.created_at,
        archivedAt: habit.archived_at,
      };

      set((state) => ({
        habits: [...state.habits, newHabit],
        streaks: [
          ...state.streaks,
          { habitId: habit.id, current: 0, longest: 0 },
        ],
      }));

      toast.success("Habit created successfully");
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Failed to create habit");
    }
  },

  updateHabit: async (id, habitData) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update(habitData)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, ...habitData } : habit
        ),
      }));

      toast.success("Habit updated successfully");
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error("Failed to update habit");
    }
  },

  archiveHabit: async (id) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id
            ? { ...habit, archivedAt: new Date().toISOString() }
            : habit
        ),
      }));

      toast.success("Habit archived successfully");
    } catch (error) {
      console.error("Error archiving habit:", error);
      toast.error("Failed to archive habit");
    }
  },

  deleteHabit: async (id) => {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== id),
        logs: state.logs.filter((log) => log.habitId !== id),
        streaks: state.streaks.filter((streak) => streak.habitId !== id),
      }));

      toast.success("Habit deleted successfully");
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit");
    }
  },

  toggleHabitCompletion: async (habitId, date, value) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const existingLog = get().logs.find(
      (log) => log.habitId === habitId && log.date === date
    );

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed: !existingLog.completed })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === existingLog.id
              ? { ...log, completed: !log.completed }
              : log
          ),
        }));
      } else {
        const habit = get().getHabitById(habitId);
        const defaultValue = habit?.targetValue || undefined;

        const { data: newLog, error } = await supabase
          .from("habit_logs")
          .insert([
            {
              habit_id: habitId,
              user_id: user.id,
              date,
              completed: true,
              value: value !== undefined ? value : defaultValue,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          logs: [...state.logs, newLog],
        }));
      }

      // Update streaks
      await get().updateStreak(habitId);

      toast.success(
        existingLog?.completed ? "Progress removed" : "Progress updated"
      );
    } catch (error) {
      console.error("Error updating habit completion:", error);
      toast.error("Failed to update progress");
    }
  },

  updateHabitValue: async (habitId, date, value) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const existingLog = get().logs.find(
      (log) => log.habitId === habitId && log.date === date
    );

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ value, completed: value > 0 })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === existingLog.id
              ? { ...log, value, completed: value > 0 }
              : log
          ),
        }));
      } else {
        const { data: newLog, error } = await supabase
          .from("habit_logs")
          .insert([
            {
              habit_id: habitId,
              user_id: user.id,
              date,
              completed: value > 0,
              value,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          logs: [...state.logs, newLog],
        }));
      }

      // Update streaks
      await get().updateStreak(habitId);

      toast.success("Progress updated");
    } catch (error) {
      console.error("Error updating habit value:", error);
      toast.error("Failed to update progress");
    }
  },

  updateHabitNote: async (habitId, date, notes) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const existingLog = get().logs.find(
      (log) => log.habitId === habitId && log.date === date
    );

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ notes })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === existingLog.id ? { ...log, notes } : log
          ),
        }));
      } else {
        const { data: newLog, error } = await supabase
          .from("habit_logs")
          .insert([
            {
              habit_id: habitId,
              user_id: user.id,
              date,
              completed: false,
              notes,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          logs: [...state.logs, newLog],
        }));
      }

      toast.success("Note updated");
    } catch (error) {
      console.error("Error updating habit note:", error);
      toast.error("Failed to update note");
    }
  },

  // Helper function to update streaks (not exposed in the API)
  updateStreak: async (habitId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const habit = get().getHabitById(habitId);
    if (!habit) return;

    const logs = get()
      .getHabitLogsForHabit(habitId)
      .filter((log) => log.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompletedDate = null;

    if (logs.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      lastCompletedDate = logs[logs.length - 1].date;

      for (let i = logs.length - 1; i > 0; i--) {
        const currentDate = new Date(logs[i].date);
        const prevDate = new Date(logs[i - 1].date);

        const diffInDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          break;
        }
      }
    }

    try {
      const { error } = await supabase.from("streaks").upsert({
        habit_id: habitId,
        user_id: user.id,
        current: currentStreak,
        longest: longestStreak,
        last_completed_date: lastCompletedDate,
      });

      if (error) throw error;

      set((state) => ({
        streaks: state.streaks.map((streak) =>
          streak.habitId === habitId
            ? {
                ...streak,
                current: currentStreak,
                longest: longestStreak,
                lastCompletedDate,
              }
            : streak
        ),
      }));
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  },

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
    const dayOfWeek = today.getDay();

    if (habit.frequency === "daily") {
      return true;
    }

    if (habit.frequency === "weekly" || habit.frequency === "custom") {
      return habit.targetDays.includes(dayOfWeek);
    }

    return false;
  },

  calculateCompletionRate: (habitId, days = 30) => {
    const habit = get().getHabitById(habitId);
    if (!habit) return 0;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (get().isHabitScheduledForDate(habit, dateStr)) {
        dateRange.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dateRange.length === 0) return 0;

    const logs = get()
      .logs.filter((log) => log.habitId === habitId && log.completed)
      .map((log) => log.date);

    const completedDays = dateRange.filter((date) =>
      logs.includes(date)
    ).length;

    return (completedDays / dateRange.length) * 100;
  },

  isHabitScheduledForDate: (habit, dateStr) => {
    if (habit.frequency === "daily") return true;

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    return habit.targetDays.includes(dayOfWeek);
  },

  getCompletionRateForDate: (date) => {
    const habits = get()
      .getActiveHabits()
      .filter((habit) => get().isHabitScheduledForDate(habit, date));

    if (habits.length === 0) return 0;

    const logs = get().getHabitLogsForDate(date);
    const completedHabits = habits.filter((habit) =>
      logs.some((log) => log.habitId === habit.id && log.completed)
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
      const dateStr = format(currentDate, "yyyy-MM-dd");
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
}));

// Initialize user data when auth state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState?.user?.id) {
    useHabitStore.getState().fetchUserData();
  }
});
