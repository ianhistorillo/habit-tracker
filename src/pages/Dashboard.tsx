import { useState, useEffect } from "react";
import {
  Activity,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
  Target,
  Award,
  Zap,
  BarChart3,
  Plus,
  Brain,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "../stores/habitStore";
import { useProfileStore } from "../stores/profileStore";
import {
  formatDateToYYYYMMDD,
  formatDateForDisplay,
  isToday,
} from "../utils/date";
import HabitCard from "../components/habits/HabitCard";
import HabitProgressBar from "../components/habits/HabitProgressBar";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const {
    getActiveHabits,
    isHabitDueToday,
    getCompletionRateForDate,
    getHabitStreak,
    calculateCompletionRate,
  } = useHabitStore();

  const today = new Date();
  const formattedToday = formatDateToYYYYMMDD(today);
  const todayForDisplay = formatDateForDisplay(today);

  const activeHabits = getActiveHabits();
  const habitsForToday = activeHabits.filter((habit) => isHabitDueToday(habit));
  const completionRate = getCompletionRateForDate(formattedToday);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Pre-calculate all streaks and completion rates
  const habitStats = activeHabits.map((habit) => ({
    streak: getHabitStreak(habit.id).current,
    weeklyCompletion: calculateCompletionRate(habit.id, 7),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = profile?.displayName || profile?.name || "there";

    if (hour < 12) {
      return `Good Morning, ${name}`;
    } else if (hour < 18) {
      return `Good Afternoon, ${name}`;
    } else {
      return `Good Evening, ${name}`;
    }
  };

  const getMotivationalMessage = () => {
    if (completionRate === 100) {
      return "🎉 Perfect day! You've completed all your habits!";
    } else if (completionRate >= 80) {
      return "🔥 You're crushing it today! Keep up the momentum!";
    } else if (completionRate >= 50) {
      return "💪 Great progress! You're halfway there!";
    } else if (completionRate > 0) {
      return "🌱 Every step counts! Keep building those habits!";
    } else {
      return "✨ Ready to make today amazing? Let's start with one habit!";
    }
  };

  const totalActiveHabits = activeHabits.length;
  const totalStreaks = habitStats.reduce((sum, stat) => sum + stat.streak, 0);
  const averageCompletion = habitStats.length > 0 
    ? habitStats.reduce((sum, stat) => sum + stat.weeklyCompletion, 0) / habitStats.length 
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white"></div>
          <div className="absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-white"></div>
          <div className="absolute -bottom-6 right-1/3 h-20 w-20 rounded-full bg-white"></div>
        </div>

        <div className="relative flex flex-col justify-between sm:flex-row sm:items-center">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {getGreeting()}
            </h1>
            <p className="mt-2 text-lg text-primary-100">
              {getMotivationalMessage()}
            </p>
            <div className="mt-4 flex items-center text-primary-200">
              <Calendar size={18} className="mr-2" />
              <span>{todayForDisplay}</span>
              <Clock size={18} className="ml-4 mr-2" />
              <span>
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {habitsForToday.length > 0 && (
              <>
                <div className="mb-3 text-right">
                  <div className="text-3xl font-bold">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-sm text-primary-200">
                    Today's Progress
                  </div>
                </div>
                <div className="w-48">
                  <HabitProgressBar 
                    progress={completionRate / 100} 
                    color="#ffffff"
                  />
                </div>
              </>
            )}
            <button
              onClick={() => navigate("/habits")}
              className="mt-4 flex items-center rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <Plus size={16} className="mr-2" />
              Add Habit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Habits</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalActiveHabits}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Streaks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStreaks}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Average</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(averageCompletion)}%</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Focus</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{habitsForToday.length}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Habits or Empty State */}
      {habitsForToday.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center dark:from-gray-700/50 dark:to-gray-800/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-purple-500">
                <Activity
                  size={32}
                  className="text-white"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                No habits scheduled for today
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Start building better habits by creating your first one!
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate("/habits")}
                  className="btn btn-primary"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Habit
                </button>
                {profile?.surveyCompleted && (
                  <button
                    onClick={() => navigate("/habits")}
                    className="btn btn-secondary"
                  >
                    <Brain size={16} className="mr-2" />
                    Get AI Suggestions
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Today's Habits
            </h2>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                {habitsForToday.filter(habit => {
                  const logs = useHabitStore.getState().getHabitLogsForDate(formattedToday);
                  return logs.some(log => log.habitId === habit.id && log.completed);
                }).length} / {habitsForToday.length} Complete
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {habitsForToday.map((habit) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <HabitCard habit={habit} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Streaks
            </h3>
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/reports")}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
            >
              View All
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          {activeHabits.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-gray-700/50">
              <p className="text-gray-600 dark:text-gray-300">
                No streaks yet. Create habits to start tracking!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabits.slice(0, 3).map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50"
                >
                  <div className="flex items-center">
                    <div
                      className="mr-4 flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <Activity size={18} style={{ color: habit.color }} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                      {habit.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {habitStats[index].streak > 0 ? 'Active streak' : 'No streak yet'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      habitStats[index].streak > 0 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <Sparkles
                        size={14}
                        className={`mr-1 ${
                          habitStats[index].streak > 0
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                      <span>
                        {habitStats[index].streak} day{habitStats[index].streak !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Weekly Progress
            </h3>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-5">
            {activeHabits.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-gray-700/50">
                <p className="text-gray-600 dark:text-gray-300">
                  No habits to track yet.
                </p>
              </div>
            ) : (
              <>
                {activeHabits.slice(0, 3).map((habit, index) => (
                  <motion.div 
                    key={habit.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="mr-3 h-3 w-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${
                            habitStats[index].weeklyCompletion >= 70
                              ? "text-green-600 dark:text-green-400"
                              : habitStats[index].weeklyCompletion >= 30
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {Math.round(habitStats[index].weeklyCompletion)}%
                        </span>
                      </div>
                    </div>
                    <HabitProgressBar
                      progress={habitStats[index].weeklyCompletion / 100}
                      color={habit.color}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
