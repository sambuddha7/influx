import { motion } from 'framer-motion';

interface LoadingStateProps {
  message: string;
}

export const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-center space-x-4">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-zinc-700 rounded-full"></div>
          {/* Inner gradient arc */}
          <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-80"></div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </span>
      </div>
    </motion.div>
  );
};