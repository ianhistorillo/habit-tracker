import { useState, useEffect } from 'react';
import { Brain, MessageCircle, Send, X, Target, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { useProfileStore } from '../../stores/profileStore';
import { toast } from 'sonner';

interface HabitCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoachFormData {
  goal: string;
  currentHabits: string[];
  struggles: string[];
  timePerDay: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
}

const HabitCoachModal = ({ isOpen, onClose }: HabitCoachModalProps) => {
  const { getActiveHabits } = useHabitStore();
  const { profile } = useProfileStore();
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CoachFormData>({
    goal: '',
    currentHabits: [],
    struggles: [],
    timePerDay: 15,
  });

  const activeHabits = getActiveHabits();

  // Initialize form with user's current habits
  useEffect(() => {
    if (activeHabits.length > 0) {
      setFormData(prev => ({
        ...prev,
        currentHabits: activeHabits.map(habit => habit.name)
      }));
    }
  }, [activeHabits]);

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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user: userData }),
      });

      if (!response.ok) {
        throw new Error('Failed to get coach response');
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
      toast.success('Your AI coach is ready to help!');
    } catch (error) {
      console.error('Error getting coach response:', error);
      toast.error('Failed to connect to your AI coach. Please try again.');
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

  const handleClose = () => {
    setStep('form');
    setMessages([]);
    setFormData({
      goal: '',
      currentHabits: activeHabits.map(habit => habit.name),
      struggles: [],
      timePerDay: 15,
    });
    onClose();
  };

  const sendFollowUpMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_AI_COACH_API_URL;
      
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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user: userData }),
      });

      if (!response.ok) {
        throw new Error('Failed to get coach response');
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
      toast.error('Failed to get response from your AI coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Habit Coach
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {step === 'form' ? 'Tell me about your goals' : 'Your personal habit coach'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {step === 'form' ? (
                <div className="p-6">
                  {activeHabits.length === 0 && (
                    <div className="mb-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                      <div className="flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          No habits found. Please create some habits first to get personalized coaching.
                        </span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Goal */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        What's your main goal? *
                      </label>
                      <textarea
                        value={formData.goal}
                        onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                        className="input w-full resize-none"
                        rows={3}
                        placeholder="e.g., sleep better and be more productive, lose weight, reduce stress..."
                        required
                      />
                    </div>

                    {/* Current Habits */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Habits *
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.currentHabits.map((habit, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                            >
                              {habit}
                              <button
                                type="button"
                                onClick={() => removeCurrentHabit(habit)}
                                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Add a current habit and press Enter"
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
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        What are your main struggles? *
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.struggles.map((struggle, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            >
                              {struggle}
                              <button
                                type="button"
                                onClick={() => removeStruggle(struggle)}
                                className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Add a struggle and press Enter (e.g., waking up late, phone addiction)"
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
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Time available per day (minutes) *
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="5"
                          max="120"
                          value={formData.timePerDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, timePerDay: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-lg font-semibold text-primary-600 dark:text-primary-400 min-w-[3rem]">
                            {formData.timePerDay}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || activeHabits.length === 0}
                      className="btn btn-primary w-full"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          Connecting to your AI coach...
                        </div>
                      ) : (
                        <>
                          <Brain size={16} className="mr-2" />
                          Get AI Coaching
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <ChatInterface
                  messages={messages}
                  loading={loading}
                  onSendMessage={sendFollowUpMessage}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Chat Interface Component
interface ChatInterfaceProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatInterface = ({ messages, loading, onSendMessage }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() && !loading) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-96 flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'coach' && (
                  <Brain size={16} className="mt-1 text-purple-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`mt-2 text-xs ${
                    message.type === 'user' 
                      ? 'text-primary-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Brain size={16} className="text-purple-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="input flex-1"
            placeholder="Ask your coach anything..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
            className="btn btn-primary p-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCoachModal;