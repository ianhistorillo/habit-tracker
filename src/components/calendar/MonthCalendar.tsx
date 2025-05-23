import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useHabitStore } from '../../stores/habitStore';
import { 
  getDatesForMonth, 
  getDayOfWeek, 
  getDaysOfWeek, 
  formatDateToYYYYMMDD, 
  formatMonthForDisplay,
  isToday,
  getPreviousMonth,
  getNextMonth
} from '../../utils/date';

const MonthCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const weekStartsOn = 0; // 0 = Sunday
  
  const daysOfWeek = getDaysOfWeek(weekStartsOn);
  const calendar = getDatesForMonth(currentMonth, weekStartsOn);
  
  const { getCompletionRateForDate } = useHabitStore();
  
  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };
  
  const getDayClass = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    const completionRate = getCompletionRateForDate(dateStr);
    const classes = ['calendar-day'];
    
    if (isToday(date)) {
      classes.push('ring-2 ring-primary-500 font-medium');
    }
    
    const currentDate = new Date();
    if (date.getMonth() !== currentMonth.getMonth()) {
      classes.push('text-gray-400 dark:text-gray-600');
    } else if (date > currentDate) {
      classes.push('text-gray-700 dark:text-gray-300');
    } else {
      classes.push('text-gray-900 dark:text-gray-100');
      
      if (completionRate === 100) {
        classes.push('completed');
      } else if (completionRate > 0) {
        classes.push('partial');
      }
    }
    
    return classes.join(' ');
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {formatMonthForDisplay(currentMonth)}
        </h2>
        
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-md p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
        
        {calendar.flat().map((date, i) => (
          <div key={i} className="p-1">
            <div className={getDayClass(date)}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthCalendar;