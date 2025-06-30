import { useState } from 'react';
import { User, Calendar, Briefcase, Users, Heart, DollarSign, Smartphone, Globe, Leaf, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import { SurveyData, LifestyleFocus } from '../../types';
import { useProfileStore } from '../../stores/profileStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UserSurveyModalProps {
  isOpen: boolean;
  onClose: (completed?: boolean) => void;
}

const UserSurveyModal = ({ isOpen, onClose }: UserSurveyModalProps) => {
  const { completeSurvey, loading } = useProfileStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    displayName: '',
    age: 25,
    gender: 'prefer-not-to-say',
    occupationCategory: 'professional',
    heightCm: undefined,
    weightKg: undefined,
    lifestyleFocus: [],
  });

  const totalSteps = 6;

  const lifestyleOptions: { value: LifestyleFocus; label: string; icon: any; description: string }[] = [
    {
      value: 'health-wellness',
      label: 'Health & Wellness',
      icon: Heart,
      description: 'Physical fitness, nutrition, mental health'
    },
    {
      value: 'work-career',
      label: 'Work & Career',
      icon: Briefcase,
      description: 'Professional growth, productivity, skills'
    },
    {
      value: 'family-relationship',
      label: 'Family & Relationships',
      icon: Users,
      description: 'Quality time, communication, connections'
    },
    {
      value: 'financial',
      label: 'Financial',
      icon: DollarSign,
      description: 'Budgeting, saving, investing, financial goals'
    },
    {
      value: 'social-leisure',
      label: 'Social & Leisure',
      icon: Users,
      description: 'Hobbies, entertainment, social activities'
    },
    {
      value: 'technological',
      label: 'Technological',
      icon: Smartphone,
      description: 'Digital skills, tech habits, online presence'
    },
    {
      value: 'cultural-spiritual',
      label: 'Cultural & Spiritual',
      icon: Globe,
      description: 'Personal growth, mindfulness, values'
    },
    {
      value: 'environment-ethical',
      label: 'Environment & Ethical',
      icon: Leaf,
      description: 'Sustainability, ethical living, social impact'
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Just close the modal without any navigation or notifications
    onClose(false);
  };

  const handleSubmit = async () => {
    if (!surveyData.displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (surveyData.lifestyleFocus.length === 0) {
      toast.error('Please select at least one lifestyle focus');
      return;
    }

    try {
      await completeSurvey(surveyData);
      onClose(true); // Mark as completed
      
      // Navigate to habits page and show AI suggestions
      navigate('/app/habits');
      
      // Small delay to ensure navigation completes, then show success message
      setTimeout(() => {
        toast.success('Profile completed! Check out your personalized AI suggestions! 🎉');
      }, 500);
    } catch (error) {
      console.error('Error completing survey:', error);
      toast.error('Failed to complete survey');
    }
  };

  const toggleLifestyleFocus = (focus: LifestyleFocus) => {
    setSurveyData(prev => ({
      ...prev,
      lifestyleFocus: prev.lifestyleFocus.includes(focus)
        ? prev.lifestyleFocus.filter(f => f !== focus)
        : [...prev.lifestyleFocus, focus]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <User size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What should we call you?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us personalize your experience
              </p>
            </div>
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Enter your preferred name"
                value={surveyData.displayName}
                onChange={(e) => setSurveyData(prev => ({ ...prev, displayName: e.target.value }))}
                className="input w-full max-w-sm text-center text-lg"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Calendar size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                How old are you?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Age helps us suggest age-appropriate habits
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
              <input
                type="range"
                min="13"
                max="100"
                value={surveyData.age}
                onChange={(e) => setSurveyData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 min-w-[3rem]">
                {surveyData.age}
              </span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Users size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What's your gender?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us provide relevant recommendations
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 max-w-md mx-auto">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non-binary', label: 'Non-binary' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSurveyData(prev => ({ ...prev, gender: option.value as any }))}
                  className={`p-3 rounded-lg border transition-all ${
                    surveyData.gender === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Briefcase size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What's your occupation category?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us suggest relevant productivity habits
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 max-w-md mx-auto">
              {[
                { value: 'student', label: 'Student' },
                { value: 'professional', label: 'Professional' },
                { value: 'self-employed', label: 'Self-employed' },
                { value: 'retired', label: 'Retired' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'other', label: 'Other' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSurveyData(prev => ({ ...prev, occupationCategory: option.value as any }))}
                  className={`p-3 rounded-lg border transition-all ${
                    surveyData.occupationCategory === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Heart size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Height & Weight (Optional)
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Helps us suggest better health and fitness habits
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  placeholder="170"
                  value={surveyData.heightCm || ''}
                  onChange={(e) => setSurveyData(prev => ({ 
                    ...prev, 
                    heightCm: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="input w-full text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="70"
                  value={surveyData.weightKg || ''}
                  onChange={(e) => setSurveyData(prev => ({ 
                    ...prev, 
                    weightKg: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="input w-full text-center"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can skip this step if you prefer not to share this information
            </p>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Globe size={48} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What lifestyle areas do you want to focus on?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select all that apply - this helps us suggest the most relevant habits
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
              {lifestyleOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = surveyData.lifestyleFocus.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleLifestyleFocus(option.value)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent size={20} className={isSelected ? 'text-primary-600' : 'text-gray-500'} />
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {surveyData.lifestyleFocus.length} area{surveyData.lifestyleFocus.length !== 1 ? 's' : ''}
            </p>
          </div>
        );

      default:
        return null;
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
            className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome to Trackbit!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete your profile to get personalized AI habit suggestions
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Skip for now"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[300px] flex items-center justify-center"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  {currentStep === totalSteps && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="btn btn-secondary"
                    >
                      Skip for now
                    </button>
                  )}
                </div>

                {currentStep === totalSteps ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !surveyData.displayName.trim() || surveyData.lifestyleFocus.length === 0}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Completing...
                      </div>
                    ) : (
                      'Complete & Get AI Suggestions'
                    )}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="btn btn-secondary"
                    >
                      Skip for now
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn-primary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSurveyModal;