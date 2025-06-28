import { useState, useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import { useProfileStore } from "../stores/profileStore";
import HabitCard from "../components/habits/HabitCard";
import {
  Plus,
  Filter,
  LayoutGrid,
  LayoutList,
  Search,
  Brain,
  Settings,
} from "lucide-react";
import CreateHabitModal from "../components/habits/CreateHabitModal";
import HabitAISuggestionsPanel from "../components/habits/HabitAISuggestionsPanel";
import UserSurveyModal from "../components/profile/UserSurveyModal";
import { motion } from "framer-motion";

const HabitsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterActive, setFilterActive] = useState(true);

  const { getActiveHabits, getArchivedHabits } = useHabitStore();
  const { profile, generateRecommendations } = useProfileStore();

  const activeHabits = getActiveHabits();
  const archivedHabits = getArchivedHabits();

  const filteredHabits = (filterActive ? activeHabits : archivedHabits).filter(
    (habit) =>
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  // Auto-show AI suggestions after survey completion
  useEffect(() => {
    if (profile?.surveyCompleted) {
      // Check if we just completed the survey (within last 5 seconds)
      const completedAt = profile.surveyCompletedAt;
      if (completedAt) {
        const completedTime = new Date(completedAt).getTime();
        const now = new Date().getTime();
        const timeDiff = now - completedTime;

        // If completed within last 10 seconds, auto-show AI suggestions
        if (timeDiff < 10000) {
          setTimeout(() => {
            setShowAISuggestions(true);
          }, 1000);
        }
      }
    }
  }, [profile?.surveyCompleted, profile?.surveyCompletedAt]);

  const handleAISuggestionsClick = () => {
    if (!profile?.surveyCompleted) {
      setShowSurveyModal(true);
    } else {
      setShowAISuggestions(true);
    }
  };

  const handleSurveyComplete = (completed: boolean = false) => {
    setShowSurveyModal(false);

    // Only auto-show AI suggestions if survey was actually completed
    if (completed) {
      setTimeout(() => {
        setShowAISuggestions(true);
      }, 500);
    }
    // If user skipped (completed = false), just close modal without showing AI suggestions
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search habits..."
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

          {/* AI Suggestions Button */}
          <button
            type="button"
            onClick={handleAISuggestionsClick}
            className={`btn hidden items-center space-x-1 sm:inline-flex ${
              profile?.surveyCompleted ? "btn-accent" : "btn-secondary"
            }`}
          >
            <Brain size={18} />
            <span>
              {profile?.surveyCompleted ? "AI Suggestions" : "Complete Profile"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary hidden items-center space-x-1 sm:inline-flex"
          >
            <Plus size={18} />
            <span>New Habit</span>
          </button>

          {/* Mobile buttons */}
          <button
            type="button"
            onClick={handleAISuggestionsClick}
            className={`btn p-2 sm:hidden ${
              profile?.surveyCompleted ? "btn-accent" : "btn-secondary"
            }`}
            aria-label={
              profile?.surveyCompleted ? "AI suggestions" : "Complete profile"
            }
          >
            {profile?.surveyCompleted ? (
              <Brain size={20} />
            ) : (
              <Settings size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary p-2 sm:hidden"
            aria-label="Create new habit"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Profile completion banner */}
      {!profile?.surveyCompleted && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Unlock AI-Powered Habit Suggestions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete your profile to get personalized habit
                  recommendations
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSurveyModal(true)}
              className="btn btn-primary btn-sm"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      {filteredHabits.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <Filter
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery
                ? "No matching habits found"
                : filterActive
                ? "No active habits"
                : "No archived habits"}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `No habits matching "${searchQuery}"`
                : filterActive
                ? "Create your first habit to start tracking your progress!"
                : "You haven't archived any habits yet."}
            </p>
            {filterActive && !searchQuery && (
              <div className="flex flex-col items-center space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
                {profile?.surveyCompleted && (
                  <button
                    type="button"
                    onClick={() => setShowAISuggestions(true)}
                    className="inline-flex items-center rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    <Brain size={16} className="mr-1" />
                    Get AI Suggestions
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <Plus size={16} className="mr-1" />
                  Create Habit
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
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateHabitModal onClose={() => setShowCreateModal(false)} />
      )}

      <HabitAISuggestionsPanel
        isOpen={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
      />

      <UserSurveyModal
        isOpen={showSurveyModal}
        onClose={handleSurveyComplete}
      />
    </div>
  );
};

export default HabitsPage;
