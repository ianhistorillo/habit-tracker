import { useState } from "react";
import { useRoutineStore } from "../stores/routineStore";
import { useHabitStore } from "../stores/habitStore";
import RoutineCard from "../components/routines/RoutineCard";
import {
  Plus,
  Filter,
  LayoutGrid,
  LayoutList,
  Search,
  Sparkles,
  Calendar,
  Brain,
} from "lucide-react";
import CreateRoutineModal from "../components/routines/CreateRoutineModal";
import RoutineTemplatesModal from "../components/routines/RoutineTemplatesModal";
import CalendarSyncModal from "../components/calendar/CalendarSyncModal";
import SmartSuggestionsPanel from "../components/ai/SmartSuggestionsPanel";
import { motion } from "framer-motion";

const RoutinesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
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
    <div className="mx-auto max-w-7xl space-y-8">
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

          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAISuggestions(true)}
              className="btn btn-secondary hidden items-center space-x-1 sm:inline-flex"
              disabled={activeHabits.length === 0}
            >
              <Brain size={18} />
              <span>AI Suggestions</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCalendarSync(true)}
              className="btn btn-secondary hidden items-center space-x-1 sm:inline-flex"
            >
              <Calendar size={18} />
              <span>Calendar Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="btn btn-accent hidden items-center space-x-1 sm:inline-flex"
            >
              <Sparkles size={18} />
              <span>Templates</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary hidden items-center space-x-1 sm:inline-flex"
              disabled={activeHabits.length === 0}
            >
              <Plus size={18} />
              <span>New Routine</span>
            </button>

            {/* Mobile buttons */}
            <button
              type="button"
              onClick={() => setShowAISuggestions(true)}
              className="btn btn-secondary p-2 sm:hidden"
              aria-label="AI suggestions"
              disabled={activeHabits.length === 0}
            >
              <Brain size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="btn btn-accent p-2 sm:hidden"
              aria-label="Browse templates"
            >
              <Sparkles size={20} />
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
      </div>

      {/* Enhanced Empty States */}
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <Sparkles
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery
                ? "No matching routines found"
                : filterActive
                ? "No active routines"
                : "No archived routines"}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `No routines matching "${searchQuery}"`
                : filterActive
                ? "Create your first routine to group related habits together!"
                : "You haven't archived any routines yet."}
            </p>
            {filterActive && !searchQuery && (
              <div className="flex flex-col items-center space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowTemplatesModal(true)}
                  className="inline-flex items-center rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles size={16} className="mr-1" />
                  Browse Templates
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <Plus size={16} className="mr-1" />
                  Create Custom
                </button>
              </div>
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

      {/* Modals */}
      {showCreateModal && (
        <CreateRoutineModal onClose={() => setShowCreateModal(false)} />
      )}

      {showTemplatesModal && (
        <RoutineTemplatesModal onClose={() => setShowTemplatesModal(false)} />
      )}

      {showCalendarSync && (
        <CalendarSyncModal onClose={() => setShowCalendarSync(false)} />
      )}

      <SmartSuggestionsPanel
        isOpen={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
      />
    </div>
  );
};

export default RoutinesPage;
