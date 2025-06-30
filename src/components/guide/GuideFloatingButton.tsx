import { useState } from 'react';
import { HelpCircle, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuideStore } from '../../stores/guideStore';
import GuideAssistant from './GuideAssistant';

const GuideFloatingButton = () => {
  const [showGuide, setShowGuide] = useState(false);
  const { hasCompletedGuide, completeGuide, skipGuide } = useGuideStore();

  const handleGuideClose = (completed: boolean = false) => {
    setShowGuide(false);
    if (completed) {
      completeGuide();
    } else {
      skipGuide();
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-20 left-4 z-40 md:bottom-6 md:left-6"
        >
          <motion.button
            onClick={() => setShowGuide(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all hover:shadow-xl md:h-14 md:w-14"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Open Getting Started Guide"
          >
            <HelpCircle size={20} className="md:h-6 md:w-6" />
          </motion.button>
          
          {/* Tooltip */}
          {!hasCompletedGuide && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-16 top-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <BookOpen size={14} />
                  <span>Getting Started Guide</span>
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 h-2 w-2 rotate-45 bg-gray-900"></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Guide Modal */}
      <GuideAssistant 
        isOpen={showGuide} 
        onClose={handleGuideClose}
      />
    </>
  );
};

export default GuideFloatingButton;