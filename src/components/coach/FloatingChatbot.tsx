import { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, MessageCircle, Send, X, Minimize2, Maximize2, Target, Clock, AlertCircle, Loader, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { useProfileStore } from '../../stores/profileStore';
import { toast } from 'sonner';

interface CoachFormData {
  goal: string;
  currentHabits: string[];
  struggles: string[];
  timePerDay: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'coach' | 'system';
  content: string;
  timestamp: Date;
}

const FloatingChatbot = () => {
  const { getActiveHabits } = useHabitStore();
  const { profile } = useProfileStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<'welcome' | 'form' | 'chat'>('welcome');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<CoachFormData>({
    goal: '',
    currentHabits: [],
    struggles: [],
    timePerDay: 15,
  });

  const activeHabits = getActiveHabits();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for external open chat events
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setShowHint(false);
    };

    window.addEventListener('openFloatingChat', handleOpenChat);
    return () => window.removeEventListener('openFloatingChat', handleOpenChat);
  }, []);

  // Prevent body scroll when mobile chat is open
  useEffect(() => {
    if (isMobile && isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen, isMinimized]);

  // Animated hints for the floating button (optimized)
  const hints = [
    "💡 Need habit advice?",
    "🎯 Struggling with consistency?", 
    "⚡ Want personalized tips?",
    "🧠 Ask your AI coach!",
    "🌟 Ready to level up?",
    "💪 Build better habits!",
    "🚀 Get unstuck today!"
  ];

  // Memoized hint function to prevent unnecessary re-renders
  const showRandomHint = useCallback(() => {
    if (!isOpen) {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setHintText(randomHint);
      setShowHint(true);
      
      setTimeout(() => {
        setShowHint(false);
      }, 3000);
    }
  }, [isOpen]); // Remove hints dependency to prevent recreation

  // Show hints periodically (optimized timing)
  useEffect(() => {
    // Only start hint timer if not open and after initial delay
    if (!isOpen) {
      const initialDelay = setTimeout(() => {
        showRandomHint();
        const interval = setInterval(showRandomHint, 12000 + Math.random() * 8000); // 12-20 seconds
        return () => clearInterval(interval);
      }, 5000); // Wait 5 seconds before first hint
      
      return () => clearTimeout(initialDelay);
    }
  }, [isOpen, showRandomHint]);

  // Initialize form with user's current habits
  useEffect(() => {
    if (activeHabits.length > 0 && formData.currentHabits.length === 0) {
      setFormData(prev => ({
        ...prev,
        currentHabits: activeHabits.map(habit => habit.name)
      }));
    }
  }, [activeHabits.length]); // Only depend on the length, not the entire array

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fallback coaching responses for offline mode
  const getFallbackResponse = (userInput: string, isInitial: boolean = false): string => {
    if (isInitial) {
      const { goal, currentHabits, struggles, timePerDay } = formData;
      
      let response = `Thanks for sharing your goal: "${goal}". I can see you're working on ${currentHabits.length} habits and have ${timePerDay} minutes per day to focus on them.\n\n`;
      
      if (struggles.includes('consistency') || struggles.includes('motivation')) {
        response += "🎯 For consistency and motivation:\n• Start with just 2-3 minutes per day\n• Use habit stacking (attach new habits to existing ones)\n• Track your progress visually\n• Celebrate small wins\n\n";
      }
      
      if (struggles.includes('time') || struggles.includes('busy schedule')) {
        response += "⏰ For time management:\n• Break habits into micro-habits\n• Use transition times (before meals, after waking)\n• Batch similar activities together\n\n";
      }
      
      response += "💡 General tips:\n• Focus on one habit at a time\n• Make it obvious (visual cues)\n• Make it attractive (pair with something you enjoy)\n• Make it easy (reduce friction)\n• Make it satisfying (immediate rewards)\n\nWhat specific challenge would you like to work on first?";
      
      return response;
    }

    const input = userInput.toLowerCase();
    
    if (input.includes('motivation') || input.includes('motivated')) {
      return "🔥 Motivation strategies:\n\n• Connect habits to your deeper values and identity\n• Visualize your future self who has these habits\n• Find an accountability partner\n• Use the 2-minute rule: make it so easy you can't say no\n• Track your streak and celebrate milestones\n\nRemember: motivation gets you started, but systems keep you going. What system can you put in place today?";
    }
    
    if (input.includes('time') || input.includes('busy') || input.includes('schedule')) {
      return "⏰ Time management for habits:\n\n• Audit your day: track how you spend 30 minutes\n• Use habit stacking: attach new habits to existing routines\n• Try micro-habits: 30 seconds to 2 minutes\n• Use transition times: while coffee brews, before meals\n• Batch similar activities together\n\nWhich part of your day has the most consistent routine where you could add a habit?";
    }
    
    if (input.includes('consistency') || input.includes('consistent')) {
      return "🎯 Building consistency:\n\n• Start ridiculously small (1 push-up, 1 page, 1 minute)\n• Never miss twice in a row\n• Focus on showing up, not perfection\n• Use environmental design (make it obvious)\n• Track your habits visually\n• Have a plan for obstacles\n\nConsistency beats intensity. What's the smallest version of your habit you could do even on your worst day?";
    }
    
    if (input.includes('stress') || input.includes('overwhelmed')) {
      return "🧘 Managing stress and overwhelm:\n\n• Prioritize: focus on 1-3 keystone habits\n• Use breathing exercises (4-7-8 technique)\n• Practice the 'good enough' mindset\n• Build in recovery time\n• Connect with your support system\n• Remember why you started\n\nStress often comes from trying to do too much. What's the ONE habit that would have the biggest positive impact on your life?";
    }
    
    if (input.includes('habit') && (input.includes('new') || input.includes('start'))) {
      return "🌱 Starting new habits:\n\n• Choose habits aligned with your identity\n• Start with a 2-minute version\n• Stack it onto an existing routine\n• Design your environment for success\n• Plan for obstacles in advance\n• Focus on the process, not outcomes\n\nWhat existing routine could you attach this new habit to?";
    }
    
    if (input.includes('progress') || input.includes('track')) {
      return "📊 Tracking progress effectively:\n\n• Use simple binary tracking (did it/didn't do it)\n• Focus on process metrics, not just outcomes\n• Review weekly, not daily\n• Celebrate small wins\n• Learn from missed days without judgment\n• Adjust based on patterns you notice\n\nHow are you currently tracking your habits? What's working and what isn't?";
    }
    
    // Default response
    return "I understand you're working on building better habits. Here are some universal principles that can help:\n\n• Start small and build gradually\n• Focus on consistency over perfection\n• Design your environment to support your goals\n• Connect habits to your identity and values\n• Plan for obstacles and setbacks\n• Celebrate progress along the way\n\nCould you tell me more about your specific situation? I'd love to give you more targeted advice.";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goal.trim()) {
      toast.error('Please enter your goal');
      return;
    }

    if (formData.currentHabits.length === 0) {
      toast.error('Please add at least one current habit or create habits first');
      return;
    }

    if (formData.struggles.length === 0) {
      toast.error('Please add at least one struggle');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_AI_COACH_API_URL;
      
      if (!API_URL) {
        throw new Error('AI Coach service is not configured');
      }

      // Test if the API URL is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const userData = {
        goal: formData.goal,
        currentHabits: formData.currentHabits,
        struggles: formData.struggles,
        timePerDay: formData.timePerDay,
        profile: profile ? {
          age: profile.age,
          occupation: profile.occupationCategory,
          lifestyleFocus: profile.lifestyleFocus
        } : null
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ user: userData }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Add initial coach message
      const coachMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'coach',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages([coachMessage]);
      setStep('chat');
      setIsOfflineMode(false);
      toast.success('Your AI coach is ready to help!');
    } catch (error) {
      console.error('Error getting coach response:', error);
      
      // Fall back to offline mode
      setIsOfflineMode(true);
      
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'coach',
        content: getFallbackResponse('', true),
        timestamp: new Date()
      };

      // Add system message about offline mode
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'AI Coach is currently offline. You\'re now using the built-in coaching assistant with general habit-building advice.',
        timestamp: new Date()
      };

      setMessages([systemMessage, fallbackMessage]);
      setStep('chat');
      
      toast.warning('AI Coach is offline. Using built-in coaching assistant instead.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      if (isOfflineMode) {
        // Use fallback response in offline mode
        setTimeout(() => {
          const coachMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'coach',
            content: getFallbackResponse(message),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, coachMessage]);
          setLoading(false);
        }, 1000); // Simulate thinking time
        return;
      }

      const API_URL = import.meta.env.VITE_AI_COACH_API_URL;
      
      if (!API_URL) {
        throw new Error('AI Coach service is not configured');
      }

      // Test if the API URL is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const userData = {
        goal: formData.goal,
        currentHabits: formData.currentHabits,
        struggles: formData.struggles,
        timePerDay: formData.timePerDay,
        followUpMessage: message,
        conversationHistory: messages.map(m => ({
          type: m.type,
          content: m.content
        }))
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ user: userData }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Add coach response
      const coachMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      console.error('Error getting coach response:', error);
      
      // Fall back to offline mode for this conversation
      setIsOfflineMode(true);
      
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: getFallbackResponse(message),
        timestamp: new Date()
      };

      const systemMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: 'Switched to offline mode. Continuing with built-in coaching assistant.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, systemMessage, fallbackMessage]);
      toast.warning('AI Coach connection lost. Switched to offline mode.');
    } finally {
      setLoading(false);
    }
  };

  const addCurrentHabit = (habit: string) => {
    if (habit.trim() && !formData.currentHabits.includes(habit.trim())) {
      setFormData(prev => ({
        ...prev,
        currentHabits: [...prev.currentHabits, habit.trim()]
      }));
    }
  };

  const removeCurrentHabit = (habit: string) => {
    setFormData(prev => ({
      ...prev,
      currentHabits: prev.currentHabits.filter(h => h !== habit)
    }));
  };

  const addStruggle = (struggle: string) => {
    if (struggle.trim() && !formData.struggles.includes(struggle.trim())) {
      setFormData(prev => ({
        ...prev,
        struggles: [...prev.struggles, struggle.trim()]
      }));
    }
  };

  const removeStruggle = (struggle: string) => {
    setFormData(prev => ({
      ...prev,
      struggles: prev.struggles.filter(s => s !== struggle)
    }));
  };

  const resetChat = () => {
    setStep('welcome');
    setMessages([]);
    setIsOfflineMode(false);
    setFormData(prev => ({
      goal: '',
      currentHabits: activeHabits.length > 0 ? activeHabits.map(habit => habit.name) : [],
      struggles: [],
      timePerDay: 15,
    }));
  };

  // Get container styles based on device type
  const getContainerStyles = () => {
    if (isMobile && isOpen && !isMinimized) {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 60,
        borderRadius: 0,
      };
    }
    
    return {
      position: 'fixed' as const,
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 50,
      width: '20rem',
      borderRadius: '0.5rem',
    };
  };

  const getChatHeight = () => {
    if (isMobile && isOpen && !isMinimized) {
      return 'calc(100vh - 4rem)'; // Full height minus header
    }
    return 'auto'; // 384px
  };
  return (
    <>
      {/* Animated Hint Bubble */}
      <AnimatePresence>
        {showHint && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className={`fixed z-40 max-w-xs ${
              isMobile ? 'bottom-20 right-4 left-4' : 'bottom-20 right-6'
            }`}
          >
            <div className="relative rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain size={16} className="text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {hintText}
                </p>
              </div>
              {/* Arrow pointing to button */}
              <div className={`absolute -bottom-2 h-4 w-4 rotate-45 bg-white dark:bg-gray-800 ${
                isMobile ? 'right-8' : 'right-8'
              }`}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed z-50 ${
              isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'
            }`}
          >
            <motion.button
              data-chatbot
              onClick={() => {
                setIsOpen(true);
                setShowHint(false);
              }}
              className={`relative flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all hover:shadow-xl ${
                isMobile ? 'h-14 w-14' : 'h-16 w-16'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain size={isMobile ? 24 : 28} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : getChatHeight()
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white shadow-2xl dark:bg-gray-800 overflow-hidden"
            style={getContainerStyles()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-white ${
              isMobile ? 'p-4 pt-6' : 'p-4'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Brain size={20} />
                  {isOfflineMode && (
                    <WifiOff size={12} className="ml-1 text-orange-200" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    AI Habit Coach {isOfflineMode && '(Offline)'}
                  </h3>
                  <p className="text-xs text-purple-100">
                    {step === 'welcome' ? 'Ready to help!' : 
                     step === 'form' ? 'Tell me about yourself' : 
                     isOfflineMode ? 'Built-in assistant' : 'Your personal coach'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {!isMobile && (
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="rounded p-1 hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex flex-col" style={{ height: getChatHeight() }}>
                {step === 'welcome' && (
                  <div className={`flex-1 ${isMobile ? 'p-6' : 'p-4'}`}>
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                        <Brain size={32} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        Welcome to Your AI Coach!
                      </h3>
                      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                        I'm here to help you build better habits and achieve your goals. Let's get started!
                      </p>

                      {activeHabits.length === 0 ? (
                        <div className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                          <div className="flex items-center text-amber-800 dark:text-amber-300">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            <span className="text-xs">
                              Create some habits first to get personalized coaching
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                          <div className="flex items-center text-green-800 dark:text-green-300">
                            <Target className="mr-2 h-4 w-4" />
                            <span className="text-xs">
                              Found {activeHabits.length} habits to work with!
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setStep('form')}
                        disabled={activeHabits.length === 0}
                        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Coaching Session
                      </button>
                    </div>
                  </div>
                )}

                {step === 'form' && (
                  <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-6' : 'p-4'}`}>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      {/* Goal */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          What's your main goal? *
                        </label>
                        <textarea
                          value={formData.goal}
                          onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                          className={`input w-full resize-none ${isMobile ? 'text-base' : 'text-sm'}`}
                          rows={isMobile ? 3 : 2}
                          placeholder="e.g., sleep better, be more productive..."
                          required
                        />
                      </div>

                      {/* Current Habits */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Current Habits *
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {formData.currentHabits.map((habit, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center rounded-full bg-primary-100 px-2 py-1 font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 ${
                                  isMobile ? 'text-sm' : 'text-xs'
                                }`}
                              >
                                {habit}
                                <button
                                  type="button"
                                  onClick={() => removeCurrentHabit(habit)}
                                  className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-400"
                                >
                                  <X size={isMobile ? 14 : 12} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            className={`input w-full ${isMobile ? 'text-base' : 'text-sm'}`}
                            placeholder="Add habit (press Enter)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCurrentHabit(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Struggles */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Main struggles? *
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {formData.struggles.map((struggle, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center rounded-full bg-red-100 px-2 py-1 font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300 ${
                                  isMobile ? 'text-sm' : 'text-xs'
                                }`}
                              >
                                {struggle}
                                <button
                                  type="button"
                                  onClick={() => removeStruggle(struggle)}
                                  className="ml-1 text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                  <X size={isMobile ? 14 : 12} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            className={`input w-full ${isMobile ? 'text-base' : 'text-sm'}`}
                            placeholder="Add struggle (press Enter)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addStruggle(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Time Available */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Time per day: {formData.timePerDay}m
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          value={formData.timePerDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, timePerDay: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`btn btn-primary w-full ${isMobile ? 'text-base py-3' : 'text-sm'}`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader className="h-4 w-4 animate-spin mr-2" />
                            Connecting...
                          </div>
                        ) : (
                          'Get AI Coaching'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {step === 'chat' && (
                  <>
                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto space-y-3 ${isMobile ? 'p-6' : 'p-4'}`}>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-3 ${isMobile ? 'text-base' : 'text-sm'} ${
                              message.type === 'user'
                                ? 'bg-primary-500 text-white'
                                : message.type === 'system'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                            }`}
                          >
                            {message.type === 'coach' && (
                              <div className="flex items-start space-x-2">
                                <Brain size={14} className="mt-1 text-purple-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            )}
                            {message.type === 'system' && (
                              <div className="flex items-start space-x-2">
                                <WifiOff size={14} className="mt-1 text-orange-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            )}
                            {message.type === 'user' && (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {loading && (
                        <div className="flex justify-start">
                          <div className={`bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg p-3 ${
                            isMobile ? 'text-base' : 'text-sm'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <Brain size={14} className="text-purple-500" />
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`border-t border-gray-200 dark:border-gray-700 ${
                      isMobile ? 'p-4 pb-6' : 'p-3'
                    }`}>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(newMessage);
                            }
                          }}
                          className={`input flex-1 ${isMobile ? 'text-base py-3' : 'text-sm'}`}
                          placeholder={isOfflineMode ? "Ask for habit advice..." : "Ask your coach..."}
                          disabled={loading}
                        />
                        <button
                          onClick={() => sendMessage(newMessage)}
                          disabled={!newMessage.trim() || loading}
                          className={`btn btn-primary ${isMobile ? 'px-4 py-3' : 'p-2'}`}
                        >
                          <Send size={isMobile ? 16 : 14} />
                        </button>
                      </div>
                      <button
                        onClick={resetChat}
                        className={`mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
                          isMobile ? 'text-sm' : 'text-xs'
                        }`}
                      >
                        Start new session
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;