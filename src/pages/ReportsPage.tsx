import { useState } from 'react';
import { useHabitStore } from '../stores/habitStore';
import HabitChart from '../components/reports/HabitChart';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Award, BarChart, ArrowRight } from 'lucide-react';
import HabitProgressBar from '../components/habits/HabitProgressBar';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const { 
    getActiveHabits, 
    getCompletionRateForDate,
    getHabitStreak,
    calculateCompletionRate
  } = useHabitStore();
  
  const activeHabits = getActiveHabits();
  
  // Generate data for the completion rate chart
  const generateCompletionRateData = () => {
    const today = new Date();
    let startDate: Date;
    
    if (timeRange === 'week') {
      startDate = subDays(today, 6); // Last 7 days
    } else if (timeRange === 'month') {
      startDate = subDays(today, 29); // Last 30 days
    } else {
      startDate = subDays(today, 364); // Last 365 days
    }
    
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    // For week and month, show each day
    if (timeRange === 'week' || timeRange === 'month') {
      const labels = dateRange.map(date => format(date, 'MMM d'));
      const data = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return getCompletionRateForDate(dateStr);
      });
      
      return { labels, data };
    }
    
    // For year, aggregate by month
    const monthlyData: Record<string, number[]> = {};
    dateRange.forEach(date => {
      const monthKey = format(date, 'MMM yyyy');
      const dateStr = format(date, 'yyyy-MM-dd');
      const rate = getCompletionRateForDate(dateStr);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      
      monthlyData[monthKey].push(rate);
    });
    
    const labels = Object.keys(monthlyData);
    const data = labels.map(month => {
      const rates = monthlyData[month];
      return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    });
    
    return { labels, data };
  };
  
  const { labels: completionLabels, data: completionData } = generateCompletionRateData();
  
  // Generate data for habits performance chart
  const generateHabitsPerformanceData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    
    return activeHabits.slice(0, 5).map(habit => ({
      name: habit.name,
      completionRate: calculateCompletionRate(habit.id, days),
      color: habit.color,
    }));
  };
  
  const habitsPerformance = generateHabitsPerformanceData();
  
  const habitLabels = habitsPerformance.map(h => h.name);
  const habitData = habitsPerformance.map(h => h.completionRate);
  const habitColors = habitsPerformance.map(h => h.color);
  
  // Calculate streaks for all habits
  const habitStreaks = activeHabits.map(habit => ({
    habit,
    streak: getHabitStreak(habit.id),
  }))
  .sort((a, b) => b.streak.current - a.streak.current);
  
  const topHabitsByStreak = habitStreaks.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Progress
          </h2>
          
          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'year'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        {activeHabits.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-700/50">
            <BarChart size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No habits to generate reports.
            </p>
            <a
              href="/habits"
              className="mt-3 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <span>Create your first habit</span>
              <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
        ) : (
          <HabitChart
            title="Completion Rate"
            type="line"
            labels={completionLabels}
            datasets={[
              {
                label: 'Overall Completion',
                data: completionData,
                color: '#0D9488',
              },
            ]}
          />
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {activeHabits.length > 0 && (
          <HabitChart
            title="Habit Performance"
            type="bar"
            labels={habitLabels}
            datasets={[
              {
                label: 'Completion Rate (%)',
                data: habitData,
                color: habitColors[0] || '#0D9488',
              },
            ]}
          />
        )}
        
        <div className="card">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Current Streaks
          </h3>
          
          {topHabitsByStreak.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400">
                No habit streaks yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {topHabitsByStreak.map(({ habit, streak }) => (
                <div key={habit.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-1 text-yellow-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {streak.current} days
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Longest streak: {streak.longest} days
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {streak.current === streak.longest ? 'Personal best!' : `${streak.longest - streak.current} days to beat record`}
                    </span>
                  </div>
                  
                  <HabitProgressBar
                    progress={streak.current / Math.max(streak.longest, 10)}
                    color={habit.color}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Overall Stats
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Habits
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <TrendingUp size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {activeHabits.length}
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Best Streak
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                <Award size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {habitStreaks.length > 0 
                ? `${habitStreaks[0].streak.longest} days`
                : '0 days'}
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Average
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <BarChart size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {activeHabits.length > 0
                ? `${Math.round(completionData.reduce((sum, val) => sum + val, 0) / completionData.length)}%`
                : '0%'}
            </p>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Log Entries
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Award size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {useHabitStore(state => state.logs.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;