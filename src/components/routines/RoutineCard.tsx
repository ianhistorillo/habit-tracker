import { motion } from "framer-motion";
import {
  Layers,
  MoreVertical,
  ChevronUp,
  Archive,
  Edit2,
  Play,
  CheckCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRoutineStore } from "../../stores/routineStore";
import { useHabitStore } from "../../stores/habitStore";
import { formatDateToYYYYMMDD } from "../../utils/date";
import HabitProgressBar from "../habits/HabitProgressBar";
import { Routine } from "../../types";
import { toast } from "sonner";
import EditRoutineModal from "./EditRoutineModal";
import RoutineExecutionModal from "./RoutineExecutionModal";

interface RoutineCardProps {
  routine: Routine;
  date?: Date;
}

const RoutineCard = ({ routine, date = new Date() }: RoutineCardProps) => {
  const {
    archiveRoutine,
    restoreRoutine,
    deleteRoutine,
    getRoutineStreak,
    getRoutineProgress,
  } = useRoutineStore();
  const { getHabitById } = useHabitStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  const formattedDate = formatDateToYYYYMMDD(date);
  const streak = getRoutineStreak(routine.id).current;
  const progress = getRoutineProgress(routine.id, formattedDate);
  const isArchived = !!routine.archivedAt;

  // Get habit details
  const habits = routine.habitIds.map((id) => getHabitById(id)).filter(Boolean);

  const IconComponent = (() => {
    switch (routine.icon) {
      case "Layers":
        return Layers;
      case "CheckCircle":
        return CheckCircle;
      default:
        return Layers;
    }
  })();

  const handleArchive = () => {
    archiveRoutine(routine.id);
    setShowMenu(false);
  };

  const handleRestore = () => {
    restoreRoutine(routine.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to permanently delete this routine? This action cannot be undone."
      )
    ) {
      deleteRoutine(routine.id);
      setShowMenu(false);
    }
  };

  const handleStartRoutine = () => {
    if (isArchived) return;
    setShowExecutionModal(true);
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
              style={{ backgroundColor: `${routine.color}20` }}
            >
              <IconComponent size={20} style={{ color: routine.color }} />
            </div>
            <div>
              <h3
                className={`font-medium ${
                  isArchived
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {routine.name}
                {isArchived && (
                  <span className="ml-2 text-xs text-gray-400">(Archived)</span>
                )}
              </h3>
              {routine.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {routine.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {habits.length} habit{habits.length !== 1 ? "s" : ""}
              </p>
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

        {/* Progress Section */}
        {!isArchived && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Today's Progress
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <HabitProgressBar
              progress={progress.percentage / 100}
              color={routine.color}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <motion.button
            type="button"
            onClick={handleStartRoutine}
            disabled={isArchived}
            className={`flex w-full items-center justify-center rounded-md py-2 transition-colors ${
              isArchived
                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Play size={18} className="mr-2" />
            <span>{isArchived ? "Archived" : "Start Routine"}</span>
          </motion.button>
        </div>

        {/* Reminder Time */}
        {!isArchived && routine.reminderTime && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Reminder: {routine.reminderTime}
            </span>
          </div>
        )}
      </motion.div>

      {showEditModal && !isArchived && (
        <EditRoutineModal
          routine={routine}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showExecutionModal && !isArchived && (
        <RoutineExecutionModal
          routine={routine}
          onClose={() => setShowExecutionModal(false)}
        />
      )}
    </>
  );
};

export default RoutineCard;
