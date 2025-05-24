import { motion } from "framer-motion";
import {
  CheckCircle,
  MoreVertical,
  Calendar,
  ChevronUp,
  Plus,
  Minus,
  Archive,
  Edit2,
} from "lucide-react";
import { useState } from "react";
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
    updateHabitValue,
    archiveHabit,
    getHabitStreak,
  } = useHabitStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const formattedDate = formatDateToYYYYMMDD(date);
  const logs = useHabitStore((state) =>
    state.logs.filter(
      (log) => log.habitId === habit.id && log.date === formattedDate
    )
  );

  const log = logs.length > 0 ? logs[0] : null;
  const isCompleted = log?.completed || false;
  const streak = getHabitStreak(habit.id).current;

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

  const handleToggleComplete = () => {
    toggleHabitCompletion(habit.id, formattedDate);

    if (!isCompleted) {
      toast.success("Great job! Habit marked as complete 🎉", {
        description:
          streak > 0 ? `You're on a ${streak + 1} day streak!` : undefined,
      });
    } else {
      toast.info("Progress removed for today");
    }
  };

  const handleArchive = () => {
    archiveHabit(habit.id);
    toast.success("Habit archived successfully");
    setShowMenu(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card overflow-hidden"
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
              <h3 className="font-medium text-gray-900 dark:text-white">
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          <div className="relative flex items-center space-x-2">
            {streak > 0 && (
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
                  <button
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={handleArchive}
                  >
                    <Archive size={16} className="mr-2" />
                    Archive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`mt-2 flex w-full items-center justify-center rounded-md py-2 transition-colors ${
              isCompleted
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="mr-2">
              {isCompleted ? "Completed" : "Mark as Done"}
            </span>
            {isCompleted && <CheckCircle size={18} />}
          </button>
        </div>
      </motion.div>

      {showEditModal && (
        <EditHabitModal habit={habit} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
};

export default HabitCard;
