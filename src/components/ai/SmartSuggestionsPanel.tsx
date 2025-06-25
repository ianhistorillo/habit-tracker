import { useState, useEffect } from "react";
import {
  Sparkles,
  Brain,
  TrendingUp,
  X,
  ChevronRight,
  Lightbulb,
  Target,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartSuggestion } from "../../types";
import { aiSuggestionService } from "../../services/aiSuggestionService";
import { useHabitStore } from "../../stores/habitStore";
import { useRoutineStore } from "../../stores/routineStore";
import { toast } from "sonner";

interface SmartSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartSuggestionsPanel = ({
  isOpen,
  onClose,
}: SmartSuggestionsPanelProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SmartSuggestion | null>(null);

  const { habits, logs, addHabit } = useHabitStore();
  const { routines, addRoutine } = useRoutineStore();

  useEffect(() => {
    if (isOpen && habits.length > 0) {
      generateSuggestions();
    }
  }, [isOpen, habits.length]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const newSuggestions = aiSuggestionService.generateSuggestions(
        habits,
        logs,
        routines
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestion: SmartSuggestion) => {
    try {
      if (suggestion.type === "routine" && suggestion.actionData.templateId) {
        // Handle routine template application
        toast.success("Routine template applied!");
      } else if (
        suggestion.type === "habit" &&
        suggestion.actionData.habitSuggestions
      ) {
        // Handle new habit creation
        const habitData = suggestion.actionData.habitSuggestions[0];
        if (habitData) {
          await addHabit({
            name: habitData.name!,
            description: habitData.description,
            icon: habitData.icon,
            color: habitData.color || "#0D9488",
            frequency: habitData.frequency!,
            targetDays: habitData.targetDays!,
            targetValue: habitData.targetValue,
            unit: habitData.unit,
          });
          toast.success(`"${habitData.name}" habit added!`);
        }
      } else if (suggestion.type === "optimization") {
        // Handle optimization suggestions
        toast.success("Optimization tip noted!", {
          description: "Check your habit settings to apply these improvements.",
        });
      }

      // Mark suggestion as applied
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, applied: true } : s))
      );
    } catch (error) {
      console.error("Error applying suggestion:", error);
      toast.error("Failed to apply suggestion");
    }
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, dismissed: true } : s))
    );
    toast.info("Suggestion dismissed");
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8)
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
    if (confidence >= 0.6)
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "routine":
        return Target;
      case "habit":
        return Lightbulb;
      case "optimization":
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  const activeSuggestions = suggestions.filter(
    (s) => !s.dismissed && !s.applied
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Smart Suggestions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personalized recommendations based on your habits
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Analyzing your habits...
                    </span>
                  </div>
                </div>
              ) : activeSuggestions.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-700/50">
                  <Sparkles size={32} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    No suggestions available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Keep tracking your habits to get personalized AI
                    recommendations!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSuggestions.map((suggestion) => {
                    const IconComponent = getSuggestionIcon(suggestion.type);

                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                              <IconComponent size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {suggestion.title}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                                    suggestion.confidence
                                  )}`}
                                >
                                  {Math.round(suggestion.confidence * 100)}%
                                  match
                                </span>
                              </div>
                              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {suggestion.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {suggestion.reasoning}
                              </p>

                              {suggestion.actionData.optimizationTips && (
                                <div className="mt-3">
                                  <h5 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Tips:
                                  </h5>
                                  <ul className="space-y-1">
                                    {suggestion.actionData.optimizationTips.map(
                                      (tip, index) => (
                                        <li
                                          key={index}
                                          className="text-xs text-gray-600 dark:text-gray-400"
                                        >
                                          • {tip}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleDismissSuggestion(suggestion.id)
                              }
                              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                              title="Dismiss"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => handleApplySuggestion(suggestion)}
                              className="btn btn-primary btn-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  <span>Updated based on your latest activity</span>
                </div>
                <button
                  onClick={generateSuggestions}
                  disabled={loading}
                  className="btn btn-secondary btn-sm"
                >
                  <Sparkles size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartSuggestionsPanel;
