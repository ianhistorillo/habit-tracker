import { useState } from 'react';
import { Calendar, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  getDatesForWeek, 
  formatDateForDisplay, 
  formatDateToYYYYMMDD, 
  isToday,
  getPreviousWeek,
  getNextWeek
} from '../utils/date';
import MonthCalendar from '../components/calendar/MonthCalendar';
import { useHabitStore } from '../stores/habitStore';
import HabitCard from '../components/habits/HabitCard';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const weekDates = getDatesForWeek(currentDate);

  const { getActiveHabits, isHabitDueToday, getHabitLogsForDate } = useHabitStore();
  const activeHabits = getActiveHabits();
  
  const handlePreviousWeek = () => {
    setCurrentDate(getPreviousWeek(currentDate));
  };
  
  const handleNextWeek = () => {
    setCurrentDate(getNextWeek(currentDate));
  };
  
  const setSelectedDay = (date: Date) => {
    setCurrentDate(date);
  };
  
  const selectedDateStr = formatDateToYYYYMMDD(currentDate);
  const habitsForSelectedDate = activeHabits.filter(habit => {
    const dayOfWeek = currentDate.getDay();
    
    if (habit.frequency === 'daily') return true;
    
    if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
      return habit.targetDays.includes(dayOfWeek);
    }
    
    return false;
  });
  
  const getDayClass = (date: Date) => {
    const isSelected = formatDateToYYYYMMDD(date) === formatDateToYYYYMMDD(currentDate);
    const dateStr = formatDateToYYYYMMDD(date);
    
    let classes = "flex flex-col items-center justify-center rounded-lg p-2 transition-colors";
    
    if (isSelected) {
      classes += " bg-primary-500 text-white";
    } else if (isToday(date)) {
      classes += " bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300";
    } else {
      classes += " hover:bg-gray-100 dark:hover:bg-gray-700";
    }
    
    return classes;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Calendar
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                  viewMode === 'week'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                  viewMode === 'month'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'week' ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                {formatDateForDisplay(weekDates[0])} - {formatDateForDisplay(weekDates[6])}
              </h4>
              
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={handlePreviousWeek}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label="Previous week"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-md p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label="Next week"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((date) => {
                const dateStr = formatDateToYYYYMMDD(date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                
                const habitsForDay = activeHabits.filter(habit => {
                  const dayOfWeek = date.getDay();
                  
                  if (habit.frequency === 'daily') return true;
                  
                  if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
                    return habit.targetDays.includes(dayOfWeek);
                  }
                  
                  return false;
                });
                
                const completedHabits = habitsForDay.filter(habit => {
                  const logs = getHabitLogsForDate(dateStr);
                  return logs.some(log => log.habitId === habit.id && log.completed);
                });
                
                const completionPercentage = habitsForDay.length > 0
                  ? (completedHabits.length / habitsForDay.length) * 100
                  : 0;
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={getDayClass(date)}
                    onClick={() => setSelectedDay(date)}
                  >
                    <span className="text-xs font-medium">{dayName}</span>
                    <span className="my-1 text-lg font-semibold">{dayNum}</span>
                    {habitsForDay.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Flag size={12} />
                        <span className="text-xs">{completedHabits.length}/{habitsForDay.length}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <MonthCalendar />
        )}
      </div>
      
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {formatDateForDisplay(currentDate)}
          </h3>
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            {habitsForSelectedDate.length} Habits
          </span>
        </div>
        
        {habitsForSelectedDate.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
            <Calendar size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No habits scheduled for this day.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habitsForSelectedDate.map((habit) => (
              <HabitCard key={habit.id} habit={habit} date={currentDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;