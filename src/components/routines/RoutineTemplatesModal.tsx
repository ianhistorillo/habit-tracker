import { useState } from "react";
import {
  Search,
  Star,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Modal from "../ui/Modal";
import { RoutineTemplate } from "../../types";
import {
  ROUTINE_TEMPLATES,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
} from "../../data/routineTemplates";
import { useRoutineStore } from "../../stores/routineStore";
import { useHabitStore } from "../../stores/habitStore";
import { toast } from "sonner";

interface RoutineTemplatesModalProps {
  onClose: () => void;
}

const CATEGORY_COLORS = {
  morning: "#F59E0B",
  evening: "#6366F1",
  fitness: "#EF4444",
  productivity: "#10B981",
  wellness: "#EC4899",
  custom: "#8B5CF6",
};

const CATEGORY_ICONS = {
  morning: "🌅",
  evening: "🌙",
  fitness: "💪",
  productivity: "🎯",
  wellness: "🧘",
  custom: "⭐",
};

const RoutineTemplatesModal = ({ onClose }: RoutineTemplatesModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<RoutineTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { addRoutine } = useRoutineStore();
  const { addHabit, getActiveHabits } = useHabitStore();

  const categories = [
    "all",
    "morning",
    "evening",
    "fitness",
    "productivity",
    "wellness",
  ];

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === "all"
    ? ROUTINE_TEMPLATES
    : getTemplatesByCategory(selectedCategory);

  const popularTemplates = getPopularTemplates(3);

  const handleUseTemplate = async (template: RoutineTemplate) => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      // Get existing habits to avoid duplicates
      const existingHabits = getActiveHabits();
      const habitIds: string[] = [];

      // Create habits that don't already exist
      for (const habitData of template.habits) {
        // Check if a similar habit already exists
        const existingHabit = existingHabits.find(
          (h) => h.name.toLowerCase() === habitData.name.toLowerCase()
        );

        if (existingHabit) {
          // Use existing habit
          habitIds.push(existingHabit.id);
          toast.info(`Using existing habit: ${existingHabit.name}`);
        } else {
          // Create new habit
          try {
            await addHabit({
              name: habitData.name,
              description: habitData.description,
              icon: habitData.icon,
              color: template.color,
              frequency: habitData.frequency,
              targetDays: habitData.targetDays,
              targetValue: habitData.targetValue,
              unit: habitData.unit,
            });

            // Get the newly created habit ID
            // Since we can't get the ID directly from addHabit, we'll find it by name
            // This is a temporary solution - ideally addHabit should return the created habit
            const updatedHabits = getActiveHabits();
            const newHabit = updatedHabits.find(
              (h) =>
                h.name === habitData.name &&
                !existingHabits.some((eh) => eh.id === h.id)
            );

            if (newHabit) {
              habitIds.push(newHabit.id);
            }
          } catch (error) {
            console.error(`Error creating habit ${habitData.name}:`, error);
            toast.error(`Failed to create habit: ${habitData.name}`);
          }
        }
      }

      // Wait a moment for habits to be created
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create the routine with the habit IDs
      if (habitIds.length > 0) {
        await addRoutine({
          name: template.name,
          description: template.description,
          habitIds: habitIds,
          color: template.color,
          icon: template.icon,
        });

        toast.success(`"${template.name}" routine created successfully! 🎉`, {
          description: `Added routine with ${habitIds.length} habits.`,
        });

        onClose();
      } else {
        toast.error("Failed to create routine - no habits were created");
      }
    } catch (error) {
      console.error("Error creating routine from template:", error);
      toast.error("Failed to create routine from template");
    } finally {
      setIsCreating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "advanced":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  if (selectedTemplate) {
    return (
      <Modal
        title={selectedTemplate.name}
        isOpen={true}
        onClose={() => setSelectedTemplate(null)}
        size="lg"
      >
        <div className="space-y-6">
          {/* Template Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${selectedTemplate.color}20` }}
              >
                {CATEGORY_ICONS[selectedTemplate.category]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      selectedTemplate.difficulty
                    )}`}
                  >
                    {selectedTemplate.difficulty}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {selectedTemplate.estimatedDuration} min
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Star size={14} className="mr-1" />
                    {selectedTemplate.popularity}/5
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Habits List */}
          <div>
            <h4 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Included Habits ({selectedTemplate.habits.length})
            </h4>
            <div className="space-y-3">
              {selectedTemplate.habits.map((habit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${selectedTemplate.color}20` }}
                    >
                      <span className="text-sm">📝</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {habit.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {habit.targetValue && (
                      <div>
                        {habit.targetValue} {habit.unit}
                      </div>
                    )}
                    <div className="capitalize">{habit.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedTemplate(null)}
              disabled={isCreating}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleUseTemplate(selectedTemplate)}
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </div>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Use This Template
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Routine Templates" isOpen={true} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category === "all"
                  ? "All"
                  : `${
                      CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    } ${category.charAt(0).toUpperCase() + category.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Templates */}
        {!searchQuery && selectedCategory === "all" && (
          <div>
            <h3 className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-white">
              <Star size={20} className="mr-2 text-yellow-500" />
              Popular Templates
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularTemplates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:hover:border-primary-600"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      {CATEGORY_ICONS[template.category]}
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {template.habits.length} habits •{" "}
                    {template.estimatedDuration} min
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
            {searchQuery
              ? "Search Results"
              : selectedCategory === "all"
              ? "All Templates"
              : `${
                  selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)
                } Templates`}
          </h3>

          {filteredTemplates.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? `No templates found for "${searchQuery}"`
                  : "No templates in this category"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:hover:border-primary-600"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        {CATEGORY_ICONS[template.category]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          template.difficulty
                        )}`}
                      >
                        {template.difficulty}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Clock size={14} className="mr-1" />
                        {template.estimatedDuration}m
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users size={14} className="mr-1" />
                      {template.habits.length} habits
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoutineTemplatesModal;
