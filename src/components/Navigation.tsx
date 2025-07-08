'use client';

import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  MapIcon,
  GlobeAsiaAustraliaIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { 
    id: 'trends', 
    label: 'Country Comparison', 
    icon: ChartBarIcon,
    description: 'Compare indicators between countries'
  },
  { 
    id: 'comparison', 
    label: 'Indicator vs Happiness', 
    icon: ArrowTrendingUpIcon,
    description: 'Explore correlations with happiness'
  },
  { 
    id: 'worldmap', 
    label: 'World Happiness Map', 
    icon: MapIcon,
    description: 'Global happiness distribution'
  },
  { 
    id: 'india', 
    label: 'India Dashboard', 
    icon: BuildingLibraryIcon,
    description: 'Detailed India analysis'
  },
  { 
    id: 'regional', 
    label: 'Regional Comparison', 
    icon: GlobeAsiaAustraliaIcon,
    description: 'Compare regions worldwide'
  },
];

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto py-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onClick={() => onTabChange(tab.id)}
                className={`relative group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {tab.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {tab.description}
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-slate-800/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
