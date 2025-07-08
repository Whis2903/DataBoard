'use client';

import { motion } from 'framer-motion';
import { GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      <div className="backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GlobeAltIcon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl animate-ping opacity-20" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent"
                >
                  Global Happiness Analytics
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-slate-400 text-lg mt-1 flex items-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5 text-cyan-400" />
                  Discover insights through interactive data visualization
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
