import { useState } from 'react';
import { Brain, MessageCircle, Target, Clock, Users, TrendingUp, Sparkles, Play, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../stores/habitStore';
import { useProfileStore } from '../stores/profileStore';

const CoachPage = () => {
  const { getActiveHabits } = useHabitStore();
  const { profile } = useProfileStore();
  
  const activeHabits = getActiveHabits();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      title: "Personalized Insights",
      description: "Get tailored advice based on your goals, habits, and lifestyle",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-500" />,
      title: "Goal-Oriented Coaching",
      description: "Receive specific strategies to achieve your unique objectives",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="h-8 w-8 text-green-500" />,
      title: "Time-Optimized Plans",
      description: "Get recommendations that fit your available time and schedule",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with AI-powered progress analysis",
      color: "from-orange-500 to-red-500"
    }
  ];

  const coachingAreas = [
    "Habit Formation & Breaking",
    "Time Management",
    "Motivation & Consistency",
    "Overcoming Obstacles",
    "Goal Setting & Achievement",
    "Lifestyle Optimization"
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white"></div>
          <div className="absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-white"></div>
          <div className="absolute -bottom-6 right-1/3 h-20 w-20 rounded-full bg-white"></div>
        </div>

        <div className="relative flex flex-col justify-between lg:flex-row lg:items-center">
          <div className="mb-8 lg:mb-0 lg:max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Personal Coach
            </div>
            <h1 className="text-4xl font-bold lg:text-5xl">
              Your Personal Habit Coach
            </h1>
            <p className="mt-4 text-lg text-purple-100 lg:text-xl">
              Get personalized coaching powered by AI. Share your goals, struggles, and available time 
              to receive tailored strategies for building better habits and achieving lasting change.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => {
                  // Trigger the floating chatbot to open
                  const event = new CustomEvent('openFloatingChat');
                  window.dispatchEvent(event);
                }}
                className="btn bg-white text-purple-600 hover:bg-gray-100"
              >
                <Bot size={16} className="mr-2" />
                Open AI Coach Chat
              </button>
              <div className="text-sm text-purple-200">
                💬 Look for the floating chat button in the bottom-right corner!
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm lg:h-40 lg:w-40">
                <Brain size={64} className="text-white lg:h-20 lg:w-20" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-yellow-400"></div>
              <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-pink-400"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color}`}>
              {feature.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            How AI Coaching Works
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get personalized guidance in just a few simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Share Your Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tell us about your objectives, current habits, and challenges you're facing
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Get AI Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI analyzes your data and creates a personalized coaching strategy
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Receive Guidance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get actionable advice, strategies, and ongoing support through our chat interface
            </p>
          </div>
        </div>
      </motion.div>

      {/* Coaching Areas */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            What Our AI Coach Can Help With
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {coachingAreas.map((area, index) => (
              <div
                key={index}
                className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
              >
                <div className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Your Current Progress
          </h3>
          
          {activeHabits.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
                <div className="flex items-center">
                  <Target className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Active Habits
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Currently tracking
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {activeHabits.length}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Recent Habits:</h4>
                {activeHabits.slice(0, 3).map((habit) => (
                  <div key={habit.id} className="flex items-center space-x-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.name}
                    </span>
                  </div>
                ))}
                {activeHabits.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{activeHabits.length - 3} more habits
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  // Trigger the floating chatbot to open
                  const event = new CustomEvent('openFloatingChat');
                  window.dispatchEvent(event);
                }}
                className="btn btn-primary w-full"
              >
                <MessageCircle size={16} className="mr-2" />
                Open AI Coach Chat
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                No Habits Yet
              </h4>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Create some habits first to get personalized coaching advice
              </p>
              <button
                onClick={() => navigate("/app/habits")}
                className="btn btn-secondary"
              >
                Create Your First Habit
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoachPage;