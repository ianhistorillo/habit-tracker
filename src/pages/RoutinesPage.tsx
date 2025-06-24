import { useState } from "react";
import { useRoutineStore } from "../stores/routineStore";
import { useHabitStore } from "../stores/habitStore";
import RoutineCard from "../components/routines/RoutineCard";
import { Plus, Filter, LayoutGrid, LayoutList, Search } from "lucide-react";
import CreateRoutineModal from "../components/routines/CreateRoutineModal";
import { motion } from "framer-motion";

const RoutinesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterActive, setFilterActive] = useState(true);

  const { getActiveRoutines, getArchivedRoutines } = useRoutineStore();
  const { getActiveHabits } = useHabitStore();

  const activeRoutines = getActiveRoutines();
  const archivedRoutines = getArchivedRoutines();
  const activeHabits = getActiveHabits();

  const filteredRoutines = (
    filterActive ? activeRoutines : archivedRoutines
  ).filter(
    (routine) =>
      routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (routine.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search routines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setFilterActive(true)}
              className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                filterActive
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterActive(false)}
              className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                !filterActive
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Archived
            </button>
          </div>

          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center px-2 py-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center px-2 py-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="List view"
            >
              <LayoutList size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary hidden items-center space-x-1 sm:inline-flex"
            disabled={activeHabits.length === 0}
          >
            <Plus size={18} />
            <span>New Routine</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary p-2 sm:hidden"
            aria-label="Create new routine"
            disabled={activeHabits.length === 0}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {activeHabits.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Filter size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              No habits available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create some habits first to start building routines!
            </p>
          </motion.div>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Filter size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery
                ? "No matching routines found"
                : filterActive
                ? "No active routines"
                : "No archived routines"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `No routines matching "${searchQuery}"`
                : filterActive
                ? "Create your first routine to group related habits together!"
                : "You haven't archived any routines yet."}
            </p>
            {filterActive && !searchQuery && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} className="mr-1" />
                New Routine
              </button>
            )}
          </motion.div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredRoutines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateRoutineModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default RoutinesPage;
