'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-slate-600`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-blue-500`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`absolute inset-1 ${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-4 h-4' : 'w-2 h-2'} rounded-full border-2 border-transparent border-t-cyan-400`}
          animate={{ rotate: -360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
