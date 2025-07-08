'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hoverable?: boolean;
}

const Card = ({ children, title, subtitle, className = '', hoverable = true }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 
        ${hoverable ? 'card-hover hover:border-slate-600/50' : ''} 
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-slate-400 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;
