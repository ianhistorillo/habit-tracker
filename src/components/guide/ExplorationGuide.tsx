import { useState, useEffect, useRef } from 'react';
import {
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExplorationGuideProps {
  stepId: string;
  onReturn: () => void;
  onClose: (completed?: boolean) => void;
}

// Helper function to get step instructions
const getStepInstructions = (stepId: string) => {
  switch (stepId) {
    case 'habits':
      return {
        title: 'Exploring Habits',
        instructions: [
          { text: 'Click the "+ New Habit" button to create your first habit', selector: 'button[aria-label="Create new habit"], button.btn.btn-primary:has(span:contains("New Habit")), button.btn.btn-primary:has(svg.lucide-plus)' },
          { text: 'Try the "AI Suggestions" button to get personalized recommendations', selector: 'button.btn-secondary:has(svg.lucide-brain), button:has(span:contains("AI Suggestions"))' },
          { text: 'Use the search bar to find specific habits', selector: 'input[placeholder*="Search"]' },
          { text: 'Toggle between "Active" and "Archived" to see different habit states', selector: '.flex.overflow-hidden.rounded-md.border button' },
          { text: 'Click on any habit card to see completion options', selector: '.card:not(:has(button.streak-badge))' }
        ],
        highlights: [
          { selector: 'button[aria-label="Create new habit"], button.btn.btn-primary:has(span:contains("New Habit")), button.btn.btn-primary:has(svg.lucide-plus)', description: 'Create new habits here' },
          { selector: 'button.btn-secondary:has(svg.lucide-brain), button:has(span:contains("AI Suggestions"))', description: 'Get AI-powered recommendations' },
          { selector: 'input[placeholder*="Search"]', description: 'Search your habits' }
        ]
      };
    case 'routines':
      return {
        title: 'Exploring Routines',
        instructions: [
          { text: 'Click "Templates" to browse pre-built routine templates', selector: 'button.btn.btn-accent:has(span:contains("Templates")), button.btn.btn-accent:has(svg.lucide-sparkles), button[aria-label="Browse templates"]' },
          { text: 'Try "New Routine" to create a custom routine', selector: 'button.btn.btn-primary:has(span:contains("New Routine")), button.btn.btn-primary[aria-label="Create new routine"], button.btn.btn-primary:has(svg.lucide-plus)' },
          { text: 'Use "AI Suggestions" for intelligent routine recommendations', selector: 'button.btn.btn-secondary:has(span:contains("AI Suggestions")), button.btn.btn-secondary:has(svg.lucide-brain), button[aria-label="AI suggestions"]' },
          { text: 'Click "Start Routine" on any routine to begin tracking', selector: '.card button:contains("Start Routine"), .card .mt-4 button, .card motion-button' },
          { text: 'Explore the "Calendar Sync" feature to integrate with your calendar', selector: 'button:has(span:contains("Calendar Sync")), button.btn.btn-secondary:has(svg.lucide-calendar)' }
        ],
        highlights: [
          { selector: 'button.btn.btn-accent:has(span:contains("Templates")), button.btn.btn-accent:has(svg.lucide-sparkles)', description: 'Browse routine templates' },
          { selector: 'button.btn.btn-primary:has(span:contains("New Routine")), button.btn.btn-primary[aria-label="Create new routine"]', description: 'Create custom routines' },
          { selector: 'button.btn.btn-accent:has(span:contains("Templates")), button.btn.btn-accent:has(svg.lucide-sparkles), button[aria-label="Browse templates"]', description: 'Browse routine templates' },
          { selector: 'button.btn.btn-primary:has(span:contains("New Routine")), button.btn.btn-primary[aria-label="Create new routine"], button.btn.btn-primary:has(svg.lucide-plus)', description: 'Create custom routines' },
          { selector: 'button.btn.btn-secondary:has(span:contains("AI Suggestions")), button.btn.btn-secondary:has(svg.lucide-brain), button[aria-label="AI suggestions"]', description: 'Get AI suggestions' },
          { selector: '.card button:contains("Start Routine"), .card .mt-4 button, .card motion-button', description: 'Start tracking a routine' },
          { selector: 'button:has(span:contains("Calendar Sync")), button.btn.btn-secondary:has(svg.lucide-calendar)', description: 'Sync with your calendar' }
        ]
      };
    case 'calendar':
      return {
        title: 'Exploring Calendar',
        instructions: [
          { text: 'Switch between "Week" and "Month" views', selector: '.card .flex.overflow-hidden.rounded-md.border button' },
          { text: 'Click on any date to see habits scheduled for that day', selector: '.calendar-day' },
          { text: 'Look for green dots indicating completed habits', selector: '.calendar-day.completed' },
          { text: 'Use the navigation arrows to browse different time periods', selector: 'button:has(svg.lucide-chevron-left), button:has(svg.lucide-chevron-right)' },
          { text: 'Click "Today" to return to the current date', selector: 'button:contains("Today")' }
        ],
        highlights: [
          { selector: '.card .flex.overflow-hidden.rounded-md.border button:contains("Week"), .card .flex.overflow-hidden.rounded-md.border button:contains("Month")', description: 'Switch between views' },
          { selector: '.card .flex.overflow-hidden.rounded-md.border button', description: 'Switch between views' },
          { selector: '.calendar-day', description: 'Click on dates' },
          { selector: '.grid.grid-cols-7.gap-1 + div .grid.gap-4 .card', description: 'Habit cards for the selected day' },
          { selector: 'button:contains("Today")', description: 'Go to today' }
        ]
      };
    case 'planner':
      return {
        title: 'Exploring Planner',
        instructions: [
          { text: 'Select a habit from the dropdown to create a goal', selector: '.card select' },
          { text: 'Set your target days using the number input', selector: '.card input[type="number"]' },
          { text: 'Add motivational notes to your goals', selector: '.card textarea' },
          { text: 'Click "Create Goal" to start tracking progress', selector: '[data-testid="create-goal-button"], button.btn.btn-primary.w-full' },
          { text: 'Monitor your goal progress with the visual indicators', selector: '.grid.gap-4 .card .h-2.overflow-hidden.rounded-full.bg-gray-200' }
        ],
        highlights: [
          { selector: '.card select', description: 'Choose a habit for your goal' },
          { selector: '.card input[type="number"]', description: 'Set target days' },
          { selector: '[data-testid="create-goal-button"], button.btn.btn-primary.w-full', description: 'Create your goal' }
        ]
      };
    case 'coach':
      return {
        title: 'Exploring AI Coach',
        instructions: [
          { text: 'Click "Open AI Coach Chat" to start a conversation', selector: 'button:contains("Open AI Coach Chat"), button.btn:has(svg.lucide-bot)' },
          { text: 'Look for the floating chat button in the bottom-right corner', selector: 'button[data-chatbot], .fixed.z-50.bottom-4.right-4 button, .fixed.z-50.bottom-6.right-6 button' },
          { text: 'Share your goals and challenges with the AI coach', selector: '.fixed.inset-0.z-50 .flex.flex-col .flex-1.overflow-y-auto, .fixed.inset-0.z-50 .flex.flex-col .border-t.border-gray-200 .flex.space-x-2 input[type="text"]' },
          { text: 'Ask specific questions about habit formation', selector: '.fixed.inset-0.z-50 .flex.flex-col .flex-1.overflow-y-auto' },
          { text: 'Get personalized strategies and motivation', selector: '.fixed.inset-0.z-50 .flex.flex-col .flex-1.overflow-y-auto .flex.justify-start' }
        ],
        highlights: [
          { selector: 'button:contains("Open AI Coach Chat"), button.btn:has(svg.lucide-bot)', description: 'Start chatting with AI coach' },
          { selector: 'button[data-chatbot], .fixed.z-50.bottom-4.right-4 button, .fixed.z-50.bottom-6.right-6 button', description: 'Floating chat button' },
          { selector: '.fixed.inset-0.z-50 .flex.flex-col .border-t.border-gray-200 .flex.space-x-2 input[type="text"]', description: 'Type your questions here' }
        ]
      };
    case 'reports':
      return {
        title: 'Exploring Reports',
        instructions: [
          { text: 'Switch between "Week", "Month", and "Year" views', selector: '.card .flex.overflow-hidden.rounded-md.border button' },
          { text: 'Review your completion rate charts', selector: '.card:has(canvas), canvas' },
          { text: 'Check your current streaks and achievements', selector: '.card:has(h3:contains("Current Streaks")), .card h3:contains("Current Streaks") + div' },
          { text: 'Analyze your habit performance over time', selector: '.card:has(h3:contains("Habit Performance")), .grid.gap-6.md\\:grid-cols-2 > div:first-child' },
          { text: 'Use insights to optimize your habit routine', selector: '.card:has(h3:contains("Overall Stats")), .card h3:contains("Overall Stats") + div' }
        ],
        highlights: [
          { selector: '.card .flex.overflow-hidden.rounded-md.border button', description: 'Time period views' },
          { selector: '.card:has(canvas), canvas', description: 'Your progress charts' },
          { selector: '.card:has(h3:contains("Current Streaks")), .card h3:contains("Current Streaks") + div', description: 'Your streaks' },
          { selector: '.card:has(h3:contains("Habit Performance")), .grid.gap-6.md\\:grid-cols-2 > div:first-child', description: 'Habit performance' },
          { selector: '.card:has(h3:contains("Overall Stats")), .card h3:contains("Overall Stats") + div', description: 'Your stats' }
        ]
      };
    default:
      return {
        title: 'Exploring',
        instructions: [
          { text: 'Explore the features on this page', selector: 'body' }
        ],
        highlights: [
          { selector: 'body', description: 'Explore this page' }
        ]
      };
  }
};

const ExplorationGuide = ({ stepId, onReturn, onClose }: ExplorationGuideProps) => {
  // All hooks must be called before any conditional returns
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  
  // Get step data
  const stepData = getStepInstructions(stepId);
  
  // Initialize currentInstruction and isLastInstruction with valid values
  const [currentInstruction, setCurrentInstruction] = useState<any>(
    stepData?.instructions?.[0] || null
  );
  const [isLastInstruction, setIsLastInstruction] = useState(
    stepData?.instructions?.length === 1
  );
  const [highlightedElements, setHighlightedElements] = useState<Element[]>([]);
  const guideModalRef = useRef<HTMLDivElement>(null);
  const [aiCoachVisible, setAiCoachVisible] = useState(false); 
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update current instruction when stepData or currentInstructionIndex changes
  useEffect(() => {
    if (stepData && stepData.instructions && stepData.instructions[currentInstructionIndex]) {
      setCurrentInstruction(stepData.instructions[currentInstructionIndex]);
      setIsLastInstruction(currentInstructionIndex === stepData.instructions.length - 1);
    }
  }, [stepData, currentInstructionIndex]);

  // Track window size for responsive positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Special handling for AI Coach step to ensure floating chatbot is visible
  useEffect(() => {
    if (stepId === 'coach') {
      // Make AI coach visible
      setAiCoachVisible(true);
      
      // Trigger the floating chatbot to be visible
      const event = new CustomEvent('openFloatingChat');
      window.dispatchEvent(event);
    }
    
    return () => {
      setAiCoachVisible(false);
    }
  }, [stepId]);

  // Add visual highlighting effect
  useEffect(() => {
    // Clear previous highlights
    highlightedElements.forEach(element => {
      if (element && element.parentNode) {
        element.classList.remove('guide-highlight');
        const overlay = element.querySelector('.guide-overlay');
        if (overlay) overlay.remove();
      }
    });
    
    setHighlightedElements([]);
    
    try {
      if (currentInstruction && typeof currentInstruction === 'object' && currentInstruction.selector) {
        // Try to find elements with the selector
        console.log('Trying selector:', currentInstruction.selector);
        const selectors = currentInstruction.selector.split(',').map(s => s.trim());
        const allElements: Element[] = [];
        
        // Try each selector
        for (const selector of selectors) {
          try {
            // Use a more specific query to avoid selecting elements inside the guide
            const elements = Array.from(document.querySelectorAll(selector))
              .filter(el => {
                // Skip elements that are part of the guide modal
                if (guideModalRef.current && guideModalRef.current.contains(el)) {
                  return false;
                }
                
                // Skip elements that are part of the floating guide button (unless in coach step)
                if ((el.closest('.fixed.bottom-20.left-4') || el.closest('.fixed.bottom-4.left-4')) && 
                    stepId !== 'coach') {
                  return false;
                }
                
                return true;
              });
              
            if (elements.length > 0) {
              console.log(`Found ${elements.length} elements for selector: ${selector}`);
              elements.forEach(el => allElements.push(el));
            } else console.log(`No elements found for selector: ${selector}`);
          } catch (error) {
            console.log(`Invalid selector: ${selector}`);
          }
        }

        console.log(`Found ${allElements.length} filtered elements`);
        if (allElements.length > 0) {
          // Create a new array to store highlighted elements
          const newHighlightedElements: Element[] = [];
          
          allElements.forEach(element => {
            // Add highlight class
            element.classList.add('guide-highlight');
            console.log('Highlighting element:', element);
            
            // Create overlay for better visibility
            const overlay = document.createElement('div');
            overlay.className = 'guide-overlay';
            element.appendChild(overlay);
            
            // Add to our tracking array
            newHighlightedElements.push(element);
          });
          
          setHighlightedElements(newHighlightedElements);
        } else {
          console.log(`No elements found for selector: ${currentInstruction.selector}`);
        }
      }
    } catch (error) {
      console.error('Error applying highlights:', error);
    }
  }, [currentInstruction, stepId]);
  
  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      highlightedElements.forEach(element => {
        if (element && element.parentNode) {
          element.classList.remove('guide-highlight');
          const overlay = element.querySelector('.guide-overlay');
          if (overlay) overlay.remove();
        }
      });
    };
  }, [highlightedElements]);

  const handleNext = () => {
    if (currentInstructionIndex < stepData.instructions.length - 1) {
      setCurrentInstructionIndex(currentInstructionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentInstructionIndex > 0) {
      setCurrentInstructionIndex(currentInstructionIndex - 1);
    }
  };

  // Early return after all hooks have been called
  if (!showInstructions) return null;

  return (
    <>
      {aiCoachVisible && <div style={{ position: 'fixed', bottom: '4rem', right: '4rem', width: '1px', height: '1px', zIndex: 1 }}></div>}
      {/* Add CSS for highlighting and positioning */}
      <style>{`
        .guide-highlight {
          position: relative !important;
          z-index: 1002 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.6) !important;
          border-radius: 4px !important;
          animation: guide-pulse 1.5s infinite !important;
        }
        
        .guide-overlay {
          position: absolute !important;
          inset: 0 !important;
          background-color: rgba(59, 130, 246, 0.15) !important;
          pointer-events: none !important;
          z-index: 1001 !important;
          border-radius: inherit !important;
        }
        
        @keyframes guide-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.6) !important; }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.9), 0 0 0 8px rgba(59, 130, 246, 0.6), 0 0 35px rgba(59, 130, 246, 0.8) !important; }
        }
        
        /* Special handling for AI Coach exploration */
        ${stepId === 'coach' ? `
          /* Make the AI coach chatbot more visible */
          [data-chatbot],
          button[data-chatbot],
          .fixed.bottom-4.right-4 button,
          .fixed.bottom-6.right-6 button {
            z-index: 1004 !important;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.8), 0 0 20px rgba(124, 58, 237, 0.6) !important;
          }
          
          /* Make the AI coach chat window more visible */
          .fixed.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-40.p-4,
          .fixed.bottom-4.right-4.max-w-xs,
          .fixed.bottom-20.right-4.left-4,
          .fixed.bottom-20.right-6 {
            z-index: 1003 !important;
          }
        ` : ''}
        
        /* Special handling for Reports exploration */
        ${stepId === 'reports' ? `
          /* Make the report cards more visible */
          .card:has(h3:contains("Current Streaks")),
          .card:has(h3:contains("Habit Performance")),
          .card:has(h3:contains("Overall Stats")) {
            z-index: 1002 !important;
            position: relative !important;
          }
        ` : ''}
      `}</style>

      {/* Exploration Guide Modal */}
      <motion.div 
        ref={guideModalRef}
        initial={{ opacity: 0, y: 10, x: 0 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: stepId === 'coach' ? (windowSize.width < 768 ? -20 : 0) : 0
        }}
        className={`fixed ${stepId === 'coach' ? 'bottom-20 left-8' : 'bottom-4 right-4'} max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 z-[1005]`}
        style={{ 
          zIndex: 1005,
          maxWidth: windowSize.width < 640 ? '85vw' : '24rem',
          left: stepId === 'coach' ? (windowSize.width < 640 ? '1rem' : '8rem') : 'auto'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{stepData.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
              Step {currentInstructionIndex + 1} of {stepData.instructions.length}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowInstructions(false)} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 whitespace-pre-wrap break-words">
            {typeof currentInstruction === 'object' ? currentInstruction.text : currentInstruction}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={handlePrevious} 
            disabled={currentInstructionIndex === 0}
            className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} className="mr-1" />
            Prev
          </button>
          <div className="flex space-x-2">
            {stepData.instructions.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-${index === currentInstructionIndex ? '6' : '2'} rounded-full transition-all ${
                  index === currentInstructionIndex ? 'bg-blue-500' : 
                  index < currentInstructionIndex ? 'bg-blue-300 dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={isLastInstruction ? onReturn : handleNext}
            className={`btn ${isLastInstruction ? 'btn-success' : 'btn-primary'} btn-sm`}
          >
            {isLastInstruction ? (
              <>
                <CheckCircle size={14} className="mr-1" />
                Continue
              </>
            ) : (
              <>
                Next
                <ChevronRight size={14} className="ml-1" />
              </>
            )}
          </button>
        </div>
        
        <div className="flex space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button onClick={() => onClose(false)} className="btn btn-outline btn-sm flex-1 text-xs sm:text-sm">
            <X size={14} className="mr-1" />
            Skip Guide
          </button>
          <button onClick={onReturn} className="btn btn-secondary btn-sm flex-1 text-xs sm:text-sm">
            <ArrowRight size={14} className="mr-1" />
            Return to Guide
          </button>
        </div>
        
        {/* Backdrop for AI Coach mode to ensure visibility */}
      </motion.div>
      
      {/* Global backdrop for exploration mode */}
      {showInstructions && (
        <div 
          className="fixed inset-0 pointer-events-none" 
          style={{ 
            zIndex: 1000, 
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
        />
      )}
    </>
  );
};

export default ExplorationGuide;