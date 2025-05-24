import { useState, useEffect } from "react";
import {
  Activity,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "../stores/habitStore";
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

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="card overflow-hidden">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {getGreeting()}
            </h2>
            <div className="mt-1 flex items-center text-gray-600 dark:text-gray-300">
              <Calendar size={16} className="mr-1" />
              <span>{todayForDisplay}</span>
              <Clock size={16} className="ml-3 mr-1" />
              <span>
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {habitsForToday.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                <TrendingUp
                  size={16}
                  className="text-primary-600 dark:text-primary-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(completionRate)}% Complete
                </span>
              </div>
              <div className="mt-2 w-32">
                <HabitProgressBar progress={completionRate / 100} />
              </div>
            </div>
          )}
        </div>

        {habitsForToday.length === 0 ? (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Activity
                size={32}
                className="mx-auto mb-2 text-gray-400 dark:text-gray-500"
              />
              <p className="text-gray-600 dark:text-gray-300">
                No habits scheduled for today.
              </p>
              <button
                onClick={() => navigate("/habits")}
                className="mt-3 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <span>Create a new habit</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>

      {habitsForToday.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Today's Habits
            </h3>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              {habitsForToday.length} Habits
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habitsForToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Streaks
            </h3>
            <button
              onClick={() => navigate("/reports")}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View All
            </button>
          </div>

          {activeHabits.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
              <p className="text-gray-600 dark:text-gray-300">
                No streaks yet. Create habits to start tracking!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeHabits.slice(0, 3).map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700/50"
                >
                  <div className="flex items-center">
                    <div
                      className="mr-3 flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <Activity size={16} style={{ color: habit.color }} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles
                      size={14}
                      className={`mr-1 ${
                        habitStats[index].streak > 0
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        habitStats[index].streak > 0
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {habitStats[index].streak} day
                      {habitStats[index].streak !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Weekly Progress
            </h3>
          </div>

          <div className="space-y-4">
            {activeHabits.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                <p className="text-gray-600 dark:text-gray-300">
                  No habits to track yet.
                </p>
              </div>
            ) : (
              <>
                {activeHabits.slice(0, 3).map((habit, index) => (
                  <div key={habit.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {habit.name}
                      </span>
                      <span
                        className={`${
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
                    <HabitProgressBar
                      progress={habitStats[index].weeklyCompletion / 100}
                      color={habit.color}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
