import { useState } from 'react';
import { CalendarClock, Activity, Smile, Check, Timer, Dumbbell, BookOpen, Coffee, Droplets, PieChart } from 'lucide-react';
import { useHabitStore } from '../../stores/habitStore';
import Modal from '../ui/Modal';
import { toast } from 'sonner';

interface CreateHabitModalProps {
  onClose: () => void;
}

const HABIT_ICONS = [
  { icon: <Activity size={20} />, name: 'Activity' },
  { icon: <Dumbbell size={20} />, name: 'Exercise' },
  { icon: <BookOpen size={20} />, name: 'Reading' },
  { icon: <Coffee size={20} />, name: 'Coffee' },
  { icon: <Droplets size={20} />, name: 'Water' },
  { icon: <Timer size={20} />, name: 'Timer' },
  { icon: <Smile size={20} />, name: 'Smile' },
  { icon: <PieChart size={20} />, name: 'Progress' },
];

const HABIT_COLORS = [
  { color: '#0D9488', name: 'Teal' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#F59E0B', name: 'Amber' },
  { color: '#10B981', name: 'Emerald' },
  { color: '#3B82F6', name: 'Blue' },
  { color: '#EF4444', name: 'Red' },
  { color: '#6366F1', name: 'Indigo' },
];

const CreateHabitModal = ({ onClose }: CreateHabitModalProps) => {
  const { addHabit } = useHabitStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0].color);
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<string | undefined>(undefined);

  const handleFrequencyChange = (freq: 'daily' | 'weekly' | 'custom') => {
    setFrequency(freq);
    
    if (freq === 'daily') {
      setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (freq === 'weekly') {
      setTargetDays([1, 2, 3, 4, 5]); // Monday to Friday
    }
  };

  const toggleDaySelection = (day: number) => {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter((d) => d !== day));
    } else {
      setTargetDays([...targetDays, day].sort());
    }
  };

  const getDayLabel = (day: number) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[day];
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }
    
    if (frequency !== 'daily' && targetDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }
    
    addHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      targetDays,
      color: selectedColor,
      icon: selectedIcon,
      targetValue,
      unit,
    });
    
    toast.success('Habit created successfully');
    onClose();
  };

  return (
    <Modal title="Create New Habit" isOpen={true} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Habit Name*
            </label>
            <input
              type="text"
              id="name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read a book"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="input w-full resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Read at least 20 pages"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frequency
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                className={`btn flex-1 ${
                  frequency === 'daily' ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => handleFrequencyChange('daily')}
              >
                Daily
              </button>
              <button
                type="button"
                className={`btn flex-1 ${
                  frequency === 'weekly' ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => handleFrequencyChange('weekly')}
              >
                Weekdays
              </button>
              <button
                type="button"
                className={`btn flex-1 ${
                  frequency === 'custom' ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => handleFrequencyChange('custom')}
              >
                Custom
              </button>
            </div>
          </div>
          
          {frequency === 'custom' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Days
              </label>
              <div className="flex justify-between">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      targetDays.includes(day)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleDaySelection(day)}
                  >
                    {getDayLabel(day)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {HABIT_COLORS.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 hover:shadow-md ${
                      selectedColor === colorObj.color ? 'ring-2 ring-offset-2' : ''
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
                {HABIT_ICONS.map((iconObj) => (
                  <button
                    key={iconObj.name}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                      selectedIcon === iconObj.name
                        ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-500 dark:bg-gray-700'
                        : 'text-gray-500 dark:text-gray-400'
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
          
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center">
              <CalendarClock size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Measurement (Optional)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetValue" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Goal Amount
                </label>
                <input
                  type="number"
                  id="targetValue"
                  className="input w-full"
                  placeholder="e.g., 8"
                  min={1}
                  value={targetValue || ''}
                  onChange={(e) => setTargetValue(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  className="input w-full"
                  placeholder="e.g., glasses"
                  value={unit || ''}
                  onChange={(e) => setUnit(e.target.value || undefined)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Habit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateHabitModal;