import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Routine, RoutineLog, RoutineStreak } from "../types";
import { useAuthStore } from "./authStore";
import { useHabitStore } from "./habitStore";
import { toast } from "sonner";
import { format, eachDayOfInterval, parseISO } from "date-fns";

interface RoutineStore {
  routines: Routine[];
  routineLogs: RoutineLog[];
  routineStreaks: RoutineStreak[];
  loading: boolean;

  // Routine Actions
  addRoutine: (routine: Omit<Routine, "id" | "createdAt">) => Promise<void>;
  updateRoutine: (
    id: string,
    routine: Partial<Omit<Routine, "id" | "createdAt">>
  ) => Promise<void>;
  archiveRoutine: (id: string) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;

  // Routine Log Actions
  toggleRoutineCompletion: (routineId: string, date: string) => Promise<void>;
  updateRoutineProgress: (
    routineId: string,
    date: string,
    completedHabits: string[]
  ) => Promise<void>;

  // Getters
  getRoutineById: (id: string) => Routine | undefined;
  getActiveRoutines: () => Routine[];
  getArchivedRoutines: () => Routine[];
  getRoutineLogsForDate: (date: string) => RoutineLog[];
  getRoutineLogForDate: (
    routineId: string,
    date: string
  ) => RoutineLog | undefined;
  getRoutineStreak: (routineId: string) => RoutineStreak;
  getRoutineProgress: (
    routineId: string,
    date: string
  ) => { completed: number; total: number; percentage: number };

  // Stats
  calculateRoutineCompletionRate: (routineId: string, days?: number) => number;
  getRoutineCompletionRateForDate: (date: string) => number;

  // Data Sync
  fetchUserRoutineData: () => Promise<void>;
}

export const useRoutineStore = create<RoutineStore>()((set, get) => ({
  routines: [],
  routineLogs: [],
  routineStreaks: [],
  loading: false,

  // Fetch user routine data
  fetchUserRoutineData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      // Fetch routines
      const { data: routines, error: routinesError } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (routinesError) throw routinesError;

      // Fetch routine logs
      const { data: routineLogs, error: logsError } = await supabase
        .from("routine_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (logsError) throw logsError;

      // Transform data to match our types
      const transformedRoutines: Routine[] = (routines || []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        habitIds: r.habit_ids || [],
        reminderTime: r.reminder_time,
        color: r.color,
        icon: r.icon,
        createdAt: r.created_at,
        archivedAt: r.archived_at,
      }));

      const transformedLogs: RoutineLog[] = (routineLogs || []).map((l) => ({
        id: l.id,
        routineId: l.routine_id,
        date: l.date,
        completed: l.completed,
        completedHabits: l.completed_habits || [],
        notes: l.notes,
        createdAt: l.created_at,
      }));

      // Calculate streaks
      const streaks = transformedRoutines.map((routine) =>
        get().calculateRoutineStreak(routine.id, transformedLogs)
      );

      set({
        routines: transformedRoutines,
        routineLogs: transformedLogs,
        routineStreaks: streaks,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching routine data:", error);
      toast.error("Failed to load routines");
      set({ loading: false });
    }
  },

  // Calculate routine streak
  calculateRoutineStreak: (routineId: string, logs?: RoutineLog[]) => {
    const routineLogs = logs || get().routineLogs;
    const completedLogs = routineLogs
      .filter((log) => log.routineId === routineId && log.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompletedDate = null;

    if (completedLogs.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      lastCompletedDate = completedLogs[completedLogs.length - 1].date;

      for (let i = completedLogs.length - 1; i > 0; i--) {
        const currentDate = new Date(completedLogs[i].date);
        const prevDate = new Date(completedLogs[i - 1].date);

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

    return {
      routineId,
      current: currentStreak,
      longest: longestStreak,
      lastCompletedDate,
    };
  },

  // Routine Actions
  addRoutine: async (routineData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      // Prepare data for database (convert camelCase to snake_case)
      const dbData = {
        user_id: user.id,
        name: routineData.name,
        description: routineData.description,
        habit_ids: routineData.habitIds,
        reminder_time: routineData.reminderTime,
        color: routineData.color,
        icon: routineData.icon,
      };

      const { data: routine, error } = await supabase
        .from("routines")
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      const newRoutine: Routine = {
        id: routine.id,
        name: routine.name,
        description: routine.description,
        habitIds: routine.habit_ids || [],
        reminderTime: routine.reminder_time,
        color: routine.color,
        icon: routine.icon,
        createdAt: routine.created_at,
        archivedAt: routine.archived_at,
      };

      set((state) => ({
        routines: [newRoutine, ...state.routines],
        routineStreaks: [
          ...state.routineStreaks,
          { routineId: newRoutine.id, current: 0, longest: 0 },
        ],
        loading: false,
      }));

      toast.success("Routine created successfully");
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("Failed to create routine");
      set({ loading: false });
    }
  },

  updateRoutine: async (id, routineData) => {
    try {
      set({ loading: true });

      // Prepare data for database (convert camelCase to snake_case)
      const updateData: any = {};

      if (routineData.name !== undefined) updateData.name = routineData.name;
      if (routineData.description !== undefined)
        updateData.description = routineData.description;
      if (routineData.habitIds !== undefined)
        updateData.habit_ids = routineData.habitIds;
      if (routineData.reminderTime !== undefined)
        updateData.reminder_time = routineData.reminderTime;
      if (routineData.color !== undefined) updateData.color = routineData.color;
      if (routineData.icon !== undefined) updateData.icon = routineData.icon;

      const { error } = await supabase
        .from("routines")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === id ? { ...routine, ...routineData } : routine
        ),
        loading: false,
      }));

      toast.success("Routine updated successfully");
    } catch (error) {
      console.error("Error updating routine:", error);
      toast.error("Failed to update routine");
      set({ loading: false });
    }
  },

  archiveRoutine: async (id) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from("routines")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === id
            ? { ...routine, archivedAt: new Date().toISOString() }
            : routine
        ),
        loading: false,
      }));

      toast.success("Routine archived successfully");
    } catch (error) {
      console.error("Error archiving routine:", error);
      toast.error("Failed to archive routine");
      set({ loading: false });
    }
  },

  deleteRoutine: async (id) => {
    try {
      set({ loading: true });
      const { error } = await supabase.from("routines").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        routines: state.routines.filter((routine) => routine.id !== id),
        routineLogs: state.routineLogs.filter((log) => log.routineId !== id),
        routineStreaks: state.routineStreaks.filter(
          (streak) => streak.routineId !== id
        ),
        loading: false,
      }));

      toast.success("Routine deleted successfully");
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Failed to delete routine");
      set({ loading: false });
    }
  },

  // Routine Log Actions
  toggleRoutineCompletion: async (routineId, date) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const existingLog = get().getRoutineLogForDate(routineId, date);
    const routine = get().getRoutineById(routineId);
    if (!routine) return;

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("routine_logs")
          .update({ completed: !existingLog.completed })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          routineLogs: state.routineLogs.map((log) =>
            log.id === existingLog.id
              ? { ...log, completed: !log.completed }
              : log
          ),
        }));
      } else {
        // Check which habits are completed for this date
        const { getHabitLogsForDate } = useHabitStore.getState();
        const habitLogs = getHabitLogsForDate(date);
        const completedHabits = routine.habitIds.filter((habitId) =>
          habitLogs.some((log) => log.habitId === habitId && log.completed)
        );

        const isCompleted = completedHabits.length === routine.habitIds.length;

        const { data: newLog, error } = await supabase
          .from("routine_logs")
          .insert([
            {
              routine_id: routineId,
              user_id: user.id,
              date,
              completed: isCompleted,
              completed_habits: completedHabits,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        const transformedLog: RoutineLog = {
          id: newLog.id,
          routineId: newLog.routine_id,
          date: newLog.date,
          completed: newLog.completed,
          completedHabits: newLog.completed_habits || [],
          notes: newLog.notes,
          createdAt: newLog.created_at,
        };

        set((state) => ({
          routineLogs: [transformedLog, ...state.routineLogs],
        }));
      }

      // Update streaks
      await get().updateRoutineStreak(routineId);
    } catch (error) {
      console.error("Error updating routine completion:", error);
      toast.error("Failed to update routine progress");
    }
  },

  updateRoutineProgress: async (routineId, date, completedHabits) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const routine = get().getRoutineById(routineId);
    if (!routine) return;

    const existingLog = get().getRoutineLogForDate(routineId, date);
    const isCompleted = completedHabits.length === routine.habitIds.length;

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("routine_logs")
          .update({
            completed_habits: completedHabits,
            completed: isCompleted,
          })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          routineLogs: state.routineLogs.map((log) =>
            log.id === existingLog.id
              ? { ...log, completedHabits, completed: isCompleted }
              : log
          ),
        }));
      } else {
        const { data: newLog, error } = await supabase
          .from("routine_logs")
          .insert([
            {
              routine_id: routineId,
              user_id: user.id,
              date,
              completed: isCompleted,
              completed_habits: completedHabits,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        const transformedLog: RoutineLog = {
          id: newLog.id,
          routineId: newLog.routine_id,
          date: newLog.date,
          completed: newLog.completed,
          completedHabits: newLog.completed_habits || [],
          notes: newLog.notes,
          createdAt: newLog.created_at,
        };

        set((state) => ({
          routineLogs: [transformedLog, ...state.routineLogs],
        }));
      }

      // Update streaks
      await get().updateRoutineStreak(routineId);
    } catch (error) {
      console.error("Error updating routine progress:", error);
      toast.error("Failed to update routine progress");
    }
  },

  // Helper function to update streaks
  updateRoutineStreak: async (routineId) => {
    const newStreak = get().calculateRoutineStreak(routineId);

    set((state) => ({
      routineStreaks: state.routineStreaks.map((streak) =>
        streak.routineId === routineId ? newStreak : streak
      ),
    }));
  },

  // Getters
  getRoutineById: (id) => {
    return get().routines.find((routine) => routine.id === id);
  },

  getActiveRoutines: () => {
    return get().routines.filter((routine) => !routine.archivedAt);
  },

  getArchivedRoutines: () => {
    return get().routines.filter((routine) => routine.archivedAt);
  },

  getRoutineLogsForDate: (date) => {
    return get().routineLogs.filter((log) => log.date === date);
  },

  getRoutineLogForDate: (routineId, date) => {
    return get().routineLogs.find(
      (log) => log.routineId === routineId && log.date === date
    );
  },

  getRoutineStreak: (routineId) => {
    const streak = get().routineStreaks.find((s) => s.routineId === routineId);
    return streak || { routineId, current: 0, longest: 0 };
  },

  getRoutineProgress: (routineId, date) => {
    const routine = get().getRoutineById(routineId);
    if (!routine) return { completed: 0, total: 0, percentage: 0 };

    // Get current habit completion status from habit store
    const { getHabitLogsForDate } = useHabitStore.getState();
    const habitLogs = getHabitLogsForDate(date);

    // Count completed habits based on actual habit logs
    const completedHabits = routine.habitIds.filter((habitId) =>
      habitLogs.some((log) => log.habitId === habitId && log.completed)
    );

    const completed = completedHabits.length;
    const total = routine.habitIds.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  },

  // Stats
  calculateRoutineCompletionRate: (routineId, days = 30) => {
    const routine = get().getRoutineById(routineId);
    if (!routine) return 0;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const dateStrings = dateRange.map((date) => format(date, "yyyy-MM-dd"));

    if (dateStrings.length === 0) return 0;

    const logs = get()
      .routineLogs.filter((log) => log.routineId === routineId && log.completed)
      .map((log) => log.date);

    const completedDays = dateStrings.filter((date) =>
      logs.includes(date)
    ).length;

    return (completedDays / dateStrings.length) * 100;
  },

  getRoutineCompletionRateForDate: (date) => {
    const routines = get().getActiveRoutines();

    if (routines.length === 0) return 0;

    const logs = get().getRoutineLogsForDate(date);
    const completedRoutines = routines.filter((routine) =>
      logs.some((log) => log.routineId === routine.id && log.completed)
    ).length;

    return (completedRoutines / routines.length) * 100;
  },
}));

// Initialize routine data when auth state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState?.user?.id) {
    useRoutineStore.getState().fetchUserRoutineData();
  }
});

// Subscribe to habit store changes to update routine progress
useHabitStore.subscribe(() => {
  // Force re-render of routine components when habit logs change
  // This ensures routine progress updates in real-time
  const routineStore = useRoutineStore.getState();
  if (routineStore.routines.length > 0) {
    // Trigger a state update to force re-render
    useRoutineStore.setState((state) => ({ ...state }));
  }
});
