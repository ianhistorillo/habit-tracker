import { motion } from 'framer-motion';
import { CheckCircle, MoreVertical, Calendar, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useHabitStore } from '../../stores/habitStore';
import { formatDateToYYYYMMDD } from '../../utils/date';
import HabitProgressBar from './HabitProgressBar';
import { Habit } from '../../types';

interface HabitCardProps {
  habit: Habit;
  date?: Date;
}

const HabitCard = ({ habit, date = new Date() }: HabitCardProps) => {
  const { toggleHabitCompletion, updateHabitValue, getHabitStreak } = useHabitStore();
  const [showMenu, setShowMenu] = useState(false);
  
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
      case 'Activity': return CheckCircle;
      case 'Calendar': return Calendar;
      default: return CheckCircle;
    }
  })();

  const handleToggleComplete = () => {
    toggleHabitCompletion(habit.id, formattedDate);
  };

  const handleUpdateValue = (value: number) => {
    updateHabitValue(habit.id, formattedDate, value);
  };

  return (
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
            <h3 className="font-medium text-gray-900 dark:text-white">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
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
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowMenu(false);
                    // Edit logic here
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => {
                    setShowMenu(false);
                    // Archive logic here
                  }}
                >
                  Archive
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {habit.targetValue ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span>
                {log?.value || 0} / {habit.targetValue} {habit.unit}
              </span>
            </div>
            <HabitProgressBar 
              progress={(log?.value || 0) / habit.targetValue}
              color={habit.color}
            />
            <div className="mt-2 flex items-center">
              <input
                type="range"
                min="0"
                max={habit.targetValue}
                value={log?.value || 0}
                onChange={(e) => handleUpdateValue(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, ${habit.color} 0%, ${habit.color} ${((log?.value || 0) / habit.targetValue) * 100}%, #e5e7eb ${((log?.value || 0) / habit.targetValue) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`mt-2 flex w-full items-center justify-center rounded-md py-2 transition-colors ${
              isCompleted
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span className="mr-2">{isCompleted ? 'Completed' : 'Mark as Done'}</span>
            {isCompleted && <CheckCircle size={18} />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default HabitCard;