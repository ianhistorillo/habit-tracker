import { motion } from 'framer-motion';

interface HabitProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

const HabitProgressBar = ({ 
  progress,
  color = '#0D9488',
  height = 8
}: HabitProgressBarProps) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <div 
      className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default HabitProgressBar;