import { useState, useEffect } from "react";
import { CheckCircle, Clock, Target } from "lucide-react";
import { useRoutineStore } from "../../stores/routineStore";
import { useHabitStore } from "../../stores/habitStore";
import Modal from "../ui/Modal";
import { toast } from "sonner";
import { Routine } from "../../types";
import { formatDateToYYYYMMDD } from "../../utils/date";
import HabitProgressBar from "../habits/HabitProgressBar";

interface RoutineExecutionModalProps {
  routine: Routine;
  onClose: () => void;
}

const RoutineExecutionModal = ({
  routine,
  onClose,
}: RoutineExecutionModalProps) => {
  const { updateRoutineProgress } = useRoutineStore();
  const { getHabitById, getHabitLogsForDate, toggleHabitCompletion } =
    useHabitStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const today = formatDateToYYYYMMDD(new Date());
  const habits = routine.habitIds.map((id) => getHabitById(id)).filter(Boolean);

  // Get real-time completion status from habit store
  const habitLogs = getHabitLogsForDate(today);
  const completedHabits = routine.habitIds.filter((habitId) =>
    habitLogs.some((log) => log.habitId === habitId && log.completed)
  );

  const handleHabitToggle = async (habitId: string) => {
    setIsUpdating(true);

    try {
      // Toggle the habit completion using the habit store
      await toggleHabitCompletion(habitId, today);

      // Get updated completion status
      const updatedLogs = getHabitLogsForDate(today);
      const updatedCompletedHabits = routine.habitIds.filter((id) =>
        updatedLogs.some((log) => log.habitId === id && log.completed)
      );

      // Update routine progress
      await updateRoutineProgress(routine.id, today, updatedCompletedHabits);

      // Check if routine is complete
      if (updatedCompletedHabits.length === routine.habitIds.length) {
        toast.success("🎉 Routine completed! Great job!", {
          description: "All habits in this routine are done for today.",
        });
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast.error("Failed to update habit");
    } finally {
      setIsUpdating(false);
    }
  };

  const progress = (completedHabits.length / routine.habitIds.length) * 100;
  const isComplete = completedHabits.length === routine.habitIds.length;

  return (
    <Modal title={routine.name} isOpen={true} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header with progress */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${routine.color}20` }}
          >
            <Target size={32} style={{ color: routine.color }} />
          </div>

          {routine.description && (
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {routine.description}
            </p>
          )}

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedHabits.length}/{routine.habitIds.length}
              </span>
            </div>
            <HabitProgressBar progress={progress / 100} color={routine.color} />
          </div>

          {isComplete && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Routine Complete!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Habits
          </h3>

          <div className="space-y-2">
            {habits.map((habit) => {
              const isCompleted = completedHabits.includes(habit.id);

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div
                      className="mr-3 flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h4>
                      {habit.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHabitToggle(habit.id)}
                    disabled={isUpdating}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "border-2 border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500 dark:border-gray-600 dark:hover:border-green-500"
                    }`}
                  >
                    {isCompleted && <CheckCircle size={20} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer (if reminder time is set) */}
        {routine.reminderTime && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center">
              <Clock
                size={16}
                className="mr-2 text-gray-500 dark:text-gray-400"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Scheduled for: {routine.reminderTime}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {!isComplete && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                // Mark all remaining habits as complete
                const remainingHabits = routine.habitIds.filter(
                  (id) => !completedHabits.includes(id)
                );

                setIsUpdating(true);
                try {
                  for (const habitId of remainingHabits) {
                    await toggleHabitCompletion(habitId, today);
                  }

                  // Get final completion status
                  const finalLogs = getHabitLogsForDate(today);
                  const allCompleted = routine.habitIds.filter((id) =>
                    finalLogs.some((log) => log.habitId === id && log.completed)
                  );

                  await updateRoutineProgress(routine.id, today, allCompleted);

                  toast.success("🎉 All habits completed!");
                } catch (error) {
                  toast.error("Failed to complete all habits");
                } finally {
                  setIsUpdating(false);
                }
              }}
              disabled={isUpdating}
            >
              Complete All
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoutineExecutionModal;
