import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Calendar, 
  BarChart3, 
  Brain, 
  Layers, 
  Settings,
  CheckCircle,
  Play,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ExplorationGuide from './ExplorationGuide';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  action?: () => void;
  tips: string[];
  category: 'habits' | 'routines' | 'calendar' | 'planner' | 'coach' | 'reports';
}

interface GuideAssistantProps {
  isOpen: boolean;
  onClose: (completed?: boolean) => void;
}

const GuideAssistant = ({ isOpen, onClose }: GuideAssistantProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExploring, setIsExploring] = useState(false);
  const [exploringStep, setExploringStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  const guideSteps: GuideStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Trackbit!',
      description: 'Let\'s take a quick tour to help you get started with building better habits.',
      icon: <Sparkles className="h-6 w-6" />,
      category: 'habits',
      tips: [
        'This guide will show you all the key features',
        'You can skip or revisit any step',
        'Take your time to explore each section'
      ]
    },
    {
      id: 'habits',
      title: 'Create Your First Habit',
      description: 'Start by creating habits you want to track. These are the building blocks of your personal growth.',
      icon: <Target className="h-6 w-6" />,
      route: '/app/habits',
      category: 'habits',
      tips: [
        'Start with 1-3 simple habits',
        'Choose habits you can do in 2-5 minutes',
        'Use the AI suggestions for personalized recommendations',
        'Set realistic target days (don\'t aim for perfection)'
      ]
    },
    {
      id: 'routines',
      title: 'Build Powerful Routines',
      description: 'Group related habits into morning, evening, or custom routines for maximum impact.',
      icon: <Layers className="h-6 w-6" />,
      route: '/app/routines',
      category: 'routines',
      tips: [
        'Try pre-built templates for quick setup',
        'Morning and evening routines are most effective',
        'Start with 2-4 habits per routine',
        'Set reminder times to stay consistent'
      ]
    },
    {
      id: 'calendar',
      title: 'Track Your Progress',
      description: 'Use the calendar view to see your habit completion patterns and maintain streaks.',
      icon: <Calendar className="h-6 w-6" />,
      route: '/app/calendar',
      category: 'calendar',
      tips: [
        'Green dots show completed habits',
        'Look for patterns in your success days',
        'Use the week view for detailed tracking',
        'Sync with external calendars if needed'
      ]
    },
    {
      id: 'planner',
      title: 'Set Goals & Plan Ahead',
      description: 'Create specific goals for your habits and track your progress over time.',
      icon: <Target className="h-6 w-6" />,
      route: '/app/planner',
      category: 'planner',
      tips: [
        'Set 30, 60, or 90-day goals',
        'Track completion rates for each goal',
        'Adjust goals based on your progress',
        'Celebrate when you hit your targets'
      ]
    },
    {
      id: 'coach',
      title: 'Get AI Coaching',
      description: 'Chat with your personal AI coach for motivation, tips, and overcoming obstacles.',
      icon: <Brain className="h-6 w-6" />,
      route: '/app/coach',
      category: 'coach',
      tips: [
        'Share your goals and struggles',
        'Ask for specific advice anytime',
        'Get personalized strategies',
        'Use the floating chat for quick help'
      ]
    },
    {
      id: 'reports',
      title: 'Analyze Your Data',
      description: 'View detailed analytics, charts, and insights about your habit-building journey.',
      icon: <BarChart3 className="h-6 w-6" />,
      route: '/app/reports',
      category: 'reports',
      tips: [
        'Track streaks and completion rates',
        'Identify your most successful patterns',
        'See weekly and monthly trends',
        'Use insights to optimize your habits'
      ]
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You now know how to use all of Trackbit\'s features. Start building better habits today!',
      icon: <CheckCircle className="h-6 w-6" />,
      category: 'habits',
      tips: [
        'Start small and build gradually',
        'Consistency beats perfection',
        'Use the AI coach when you need help',
        'Review your progress weekly'
      ]
    }
  ];

  const currentStepData = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStepData) {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    }
    
    if (isLastStep) {
      onClose(true);
      toast.success('Guide completed! You\'re ready to build amazing habits! 🎉');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose(false);
    toast.info('Guide skipped. You can access the guide anytime from the header.');
  };

  const handleGoToPage = () => {
    if (currentStepData.route) {
      navigate(currentStepData.route);
      setIsMinimized(true);
      toast.info('Guide minimized. Click the help button to continue.');
    }
    if (currentStepData.action) {
      currentStepData.action();
    }
  };

  const handleExplore = (stepId: string, route?: string) => {
    if (route) {
      setIsExploring(true);
      setExploringStep(stepId);
      navigate(route);
      toast.info('Guide is now in exploration mode. Check the floating guide button to continue.', {
        duration: 4000,
      });
    }
  };

  const handleReturnFromExploration = () => {
    setIsExploring(false);
    setIsMinimized(false);
    setExploringStep(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      habits: 'from-blue-500 to-cyan-500',
      routines: 'from-purple-500 to-pink-500',
      calendar: 'from-green-500 to-emerald-500',
      planner: 'from-orange-500 to-red-500',
      coach: 'from-indigo-500 to-purple-500',
      reports: 'from-teal-500 to-blue-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  if (!isOpen) return null;

  // If exploring, show a different UI
  if (isExploring && exploringStep) {
    return <ExplorationGuide stepId={exploringStep} onReturn={handleReturnFromExploration} onClose={onClose} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: isMinimized ? 0.3 : 1, 
            y: isMinimized ? 300 : 0,
            x: isMinimized ? 400 : 0
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 ${
            isMinimized ? 'pointer-events-none' : ''
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700 bg-gradient-to-r ${getCategoryColor(currentStepData.category)} text-white rounded-t-2xl`}>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Getting Started Guide
                </h2>
                <p className="text-sm text-white/80">
                  Step {currentStep + 1} of {guideSteps.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="rounded-md p-2 text-white/80 hover:bg-white/20 hover:text-white"
                  title="Minimize guide"
                >
                  <Settings size={18} />
                </button>
              )}
              <button
                onClick={handleSkip}
                className="rounded-md p-2 text-white/80 hover:bg-white/20 hover:text-white"
                title="Close guide"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Progress Bar */} 
              <div className="px-6 pt-4">
                <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 bg-gradient-to-r ${getCategoryColor(currentStepData.category)} rounded-full`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Tips Section */}
                <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-700/50">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {currentStepData.id === 'welcome' ? 'What to Expect' : 
                       currentStepData.id === 'complete' ? 'Remember' : 'Pro Tips'}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {currentStepData.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2 mr-3 flex-shrink-0" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action Button for Navigation */}
                {currentStepData.route && currentStepData.id !== 'welcome' && currentStepData.id !== 'complete' && (
                  <div className="text-center">
                    <button 
                      onClick={() => handleExplore(currentStepData.id, currentStepData.route)}
                      className={`btn bg-gradient-to-r ${getCategoryColor(currentStepData.category)} text-white hover:shadow-lg transition-all`}
                    >
                      <Play size={16} className="mr-2" />
                      Explore {currentStepData.title.split(' ')[0]}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"> 
                      This will minimize the guide and take you to the page
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
                <button
                  onClick={handlePrevious} 
                  disabled={isFirstStep}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {guideSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 w-8 rounded-full transition-all ${
                        index === currentStep
                          ? `bg-gradient-to-r ${getCategoryColor(currentStepData.category)}`
                          : index < currentStep
                          ? 'bg-green-400'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className={`btn ${isLastStep ? 'btn-success' : 'btn-primary'}`}
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle size={16} className="mr-1" />
                      Complete Guide
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4"> 
              <button
                onClick={() => setIsMinimized(false)}
                className="flex items-center space-x-2 text-white hover:text-white/80"
              >
                <HelpCircle size={16} />
                <span className="text-sm">Continue Guide</span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuideAssistant;