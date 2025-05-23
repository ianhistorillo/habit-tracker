import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoveLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="mb-2 text-9xl font-bold text-primary-600 dark:text-primary-400">
          404
        </h1>
        <h2 className="mb-6 text-3xl font-semibold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary inline-flex items-center"
        >
          <MoveLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;