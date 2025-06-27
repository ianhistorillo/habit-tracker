import { motion } from "framer-motion";
import {
  CheckCircle,
  MoreVertical,
  Calendar,
  ChevronUp,
  Archive,
  Edit2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useHabitStore } from "../../stores/habitStore";
import { formatDateToYYYYMMDD } from "../../utils/date";
import HabitProgressBar from "./HabitProgressBar";
import { Habit } from "../../types";
import { toast } from "sonner";
import EditHabitModal from "./EditHabitModal";

interface HabitCardProps {
  habit: Habit;
  date?: Date;
}

const HabitCard = ({ habit, date = new Date() }: HabitCardProps) => {
  const {
    toggleHabitCompletion,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    getHabitStreak,
    getHabitLogsForDate,
  } = useHabitStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const formattedDate = formatDateToYYYYMMDD(date);
  const logs = getHabitLogsForDate(formattedDate);
  const log = logs.find((log) => log.habitId === habit.id);
  const isCompleted = log?.completed || false;

  const streak = getHabitStreak(habit.id).current;
  const isArchived = !!habit.archivedAt;

  const IconComponent = (() => {
    switch (habit.icon) {
      case "Activity":
        return CheckCircle;
      case "Calendar":
        return Calendar;
      default:
        return CheckCircle;
    }
  })();

  const handleToggleComplete = async () => {
    if (isArchived) return; // Don't allow completion for archived habits

    setIsAnimating(true);

    try {
      // Use toggleHabitCompletion which handles both complete and incomplete states
      await toggleHabitCompletion(habit.id, formattedDate);

      if (!isCompleted) {
        toast.success("Great job! Habit marked as complete 🎉", {
          description:
            streak > 0 ? `You're on a ${streak + 1} day streak!` : undefined,
        });
      } else {
        toast.info("Progress removed for today");
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast.error("Failed to update habit");
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleArchive = () => {
    archiveHabit(habit.id);
    setShowMenu(false);
  };

  const handleRestore = () => {
    restoreHabit(habit.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to permanently delete this habit? This action cannot be undone."
      )
    ) {
      deleteHabit(habit.id);
      setShowMenu(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`card overflow-hidden ${
          isArchived ? "opacity-75 bg-gray-50 dark:bg-gray-700/50" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="mr-3 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              <IconComponent size={20} style={{ color: habit.color }} />
            </div>
            <div>
              <h3
                className={`font-medium ${
                  isArchived
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {habit.name}
                {isArchived && (
                  <span className="ml-2 text-xs text-gray-400">(Archived)</span>
                )}
              </h3>
              {habit.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          <div className="relative flex items-center space-x-2">
            {!isArchived && streak > 0 && (
              <div className="streak-badge">
                <ChevronUp size={14} className="mr-0.5" />
                <span>{streak}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800">
                <div className="py-1">
                  {!isArchived && (
                    <button
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => {
                        setShowMenu(false);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </button>
                  )}

                  {isArchived ? (
                    <>
                      <button
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        onClick={handleRestore}
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Restore
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={handleDelete}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Permanently
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={handleArchive}
                    >
                      <Archive size={16} className="mr-2" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <motion.button
            type="button"
            onClick={handleToggleComplete}
            animate={{
              scale: isAnimating ? [1, 0.95, 1] : 1,
              backgroundColor: isCompleted ? habit.color : undefined,
            }}
            transition={{ duration: 0.2 }}
            disabled={isArchived}
            className={`mt-2 flex w-full items-center justify-center rounded-md py-2 transition-colors ${
              isArchived
                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500"
                : isCompleted
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            style={{
              backgroundColor:
                isCompleted && !isArchived ? habit.color : undefined,
            }}
          >
            <span className="mr-2">
              {isArchived
                ? "Archived"
                : isCompleted
                ? "Completed"
                : "Mark as Done"}
            </span>
            {isCompleted && !isArchived && <CheckCircle size={18} />}
          </motion.button>
        </div>
      </motion.div>

      {showEditModal && !isArchived && (
        <EditHabitModal habit={habit} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
};

export default HabitCard;
