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
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HabitRecommendation } from "../../types";
import { useProfileStore } from "../../stores/profileStore";
import { useHabitStore } from "../../stores/habitStore";
import { toast } from "sonner";

interface HabitAISuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HabitAISuggestionsPanel = ({
  isOpen,
  onClose,
}: HabitAISuggestionsPanelProps) => {
  const {
    recommendations,
    fetchRecommendations,
    generateRecommendations,
    applyRecommendation,
    dismissRecommendation,
    profile,
  } = useProfileStore();
  const { addHabit } = useHabitStore();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile?.surveyCompleted) {
      fetchRecommendations();
      // Auto-generate if no recommendations exist
      if (recommendations.length === 0) {
        handleGenerateRecommendations();
      }
    }
  }, [isOpen, profile?.surveyCompleted]);

  const handleGenerateRecommendations = async () => {
    if (!profile?.surveyCompleted) {
      toast.error("Please complete your profile survey first");
      return;
    }

    setLoading(true);
    try {
      await generateRecommendations();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = async (
    recommendation: HabitRecommendation
  ) => {
    if (applying) return;

    try {
      setApplying(recommendation.id);

      // Create the habit
      await addHabit({
        name: recommendation.name,
        description: recommendation.description,
        icon: recommendation.icon,
        color: recommendation.color,
        frequency: recommendation.frequency,
        targetDays: recommendation.targetDays,
        targetValue: recommendation.targetValue,
        unit: recommendation.unit,
      });

      // Mark as applied
      await applyRecommendation(recommendation.id);

      toast.success(`"${recommendation.name}" habit added!`, {
        description: "AI recommendation successfully applied to your habits.",
      });
    } catch (error) {
      console.error("Error applying recommendation:", error);
      toast.error("Failed to apply recommendation");
    } finally {
      setApplying(null);
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    await dismissRecommendation(recommendationId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9)
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
    if (confidence >= 0.8)
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
    if (confidence >= 0.7)
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health-wellness":
        return "💪";
      case "work-career":
        return "💼";
      case "family-relationship":
        return "❤️";
      case "financial":
        return "💰";
      case "social-leisure":
        return "🎉";
      case "technological":
        return "📱";
      case "cultural-spiritual":
        return "🧘";
      case "environment-ethical":
        return "🌱";
      default:
        return "✨";
    }
  };

  const activeRecommendations = recommendations.filter((r) => !r.isApplied);

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
                    AI Habit Suggestions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personalized for {profile?.displayName || "you"}
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
                      Generating personalized recommendations...
                    </span>
                  </div>
                </div>
              ) : activeRecommendations.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-700/50">
                  <Sparkles size={32} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    No recommendations available
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Generate AI-powered habit suggestions based on your profile!
                  </p>
                  <button
                    onClick={handleGenerateRecommendations}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <Sparkles size={16} className="mr-2" />
                    Generate Recommendations
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Recommended for You
                    </h3>
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                      {activeRecommendations.length} suggestions
                    </span>
                  </div>

                  {activeRecommendations.map((recommendation) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                            style={{
                              backgroundColor: `${recommendation.color}20`,
                            }}
                          >
                            {getCategoryIcon(recommendation.category)}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {recommendation.name}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                                  recommendation.confidenceScore
                                )}`}
                              >
                                {Math.round(
                                  recommendation.confidenceScore * 100
                                )}
                                % match
                              </span>
                            </div>
                            {recommendation.description && (
                              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {recommendation.description}
                              </p>
                            )}
                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-500">
                              {recommendation.reasoning}
                            </p>

                            {/* Habit Details */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="capitalize">
                                {recommendation.frequency}
                              </span>
                              {recommendation.targetValue && (
                                <span>
                                  {recommendation.targetValue}{" "}
                                  {recommendation.unit}
                                </span>
                              )}
                              <span>
                                {recommendation.targetDays.length} days/week
                              </span>
                            </div>

                            {/* Tags */}
                            {recommendation.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {recommendation.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleDismissRecommendation(recommendation.id)
                            }
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Dismiss"
                            disabled={applying === recommendation.id}
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleApplyRecommendation(recommendation)
                            }
                            className="btn btn-primary btn-sm"
                            disabled={applying === recommendation.id}
                          >
                            {applying === recommendation.id ? (
                              <div className="flex items-center">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                                Adding...
                              </div>
                            ) : (
                              <>
                                <Plus size={14} className="mr-1" />
                                Add Habit
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  <span>Based on your lifestyle focus areas</span>
                </div>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={loading || applying !== null}
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

export default HabitAISuggestionsPanel;
