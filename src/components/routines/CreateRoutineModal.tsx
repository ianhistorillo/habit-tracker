import { useState } from "react";
import { Layers, CheckCircle, Target, Clock, Check } from "lucide-react";
import { useRoutineStore } from "../../stores/routineStore";
import { useHabitStore } from "../../stores/habitStore";
import Modal from "../ui/Modal";
import { toast } from "sonner";

interface CreateRoutineModalProps {
  onClose: () => void;
}

const ROUTINE_ICONS = [
  { icon: <Layers size={20} />, name: "Layers" },
  { icon: <CheckCircle size={20} />, name: "CheckCircle" },
  { icon: <Target size={20} />, name: "Target" },
  { icon: <Clock size={20} />, name: "Clock" },
];

const ROUTINE_COLORS = [
  { color: "#0D9488", name: "Teal" },
  { color: "#8B5CF6", name: "Purple" },
  { color: "#EC4899", name: "Pink" },
  { color: "#F59E0B", name: "Amber" },
  { color: "#10B981", name: "Emerald" },
  { color: "#3B82F6", name: "Blue" },
  { color: "#EF4444", name: "Red" },
  { color: "#6366F1", name: "Indigo" },
];

const CreateRoutineModal = ({ onClose }: CreateRoutineModalProps) => {
  const { addRoutine } = useRoutineStore();
  const { getActiveHabits } = useHabitStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState("");
  const [selectedColor, setSelectedColor] = useState(ROUTINE_COLORS[0].color);
  const [selectedIcon, setSelectedIcon] = useState("Layers");

  const activeHabits = getActiveHabits();

  const toggleHabitSelection = (habitId: string) => {
    if (selectedHabits.includes(habitId)) {
      setSelectedHabits(selectedHabits.filter((id) => id !== habitId));
    } else {
      setSelectedHabits([...selectedHabits, habitId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    if (selectedHabits.length === 0) {
      toast.error("Please select at least one habit");
      return;
    }

    addRoutine({
      name: name.trim(),
      description: description.trim() || undefined,
      habitIds: selectedHabits,
      reminderTime: reminderTime || undefined,
      color: selectedColor,
      icon: selectedIcon,
    });

    toast.success("Routine created successfully");
    onClose();
  };

  return (
    <Modal title="Create New Routine" isOpen={true} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Routine Name*
            </label>
            <input
              type="text"
              id="name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Routine"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="input w-full resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Start your day with these essential habits"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Habits*
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3 dark:border-gray-700">
              {activeHabits.map((habit) => (
                <label
                  key={habit.id}
                  className="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedHabits.includes(habit.id)}
                    onChange={() => toggleHabitSelection(habit.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {habit.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selected: {selectedHabits.length} habit
              {selectedHabits.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div>
            <label
              htmlFor="reminderTime"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reminder Time (Optional)
            </label>
            <input
              type="time"
              id="reminderTime"
              className="input w-full"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ROUTINE_COLORS.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 hover:shadow-md ${
                      selectedColor === colorObj.color
                        ? "ring-2 ring-offset-2"
                        : ""
                    }`}
                    style={{ backgroundColor: colorObj.color }}
                    onClick={() => setSelectedColor(colorObj.color)}
                    title={colorObj.name}
                  >
                    {selectedColor === colorObj.color && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ROUTINE_ICONS.map((iconObj) => (
                  <button
                    key={iconObj.name}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                      selectedIcon === iconObj.name
                        ? "border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-500 dark:bg-gray-700"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setSelectedIcon(iconObj.name)}
                    title={iconObj.name}
                  >
                    {iconObj.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Routine
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoutineModal;
