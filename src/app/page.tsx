'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import IndicatorTrends from '../pages/indicator-trends';
import IndicatorComparison from '../pages/indicator-comparison';
import WorldMap from '../pages/world-map';
import IndiaDashboard from '../pages/india-dashboard';
import RegionalComparison from '../pages/regional-comparison';

const tabs = [
  { id: 'trends', component: IndicatorTrends },
  { id: 'comparison', component: IndicatorComparison },
  { id: 'worldmap', component: WorldMap },
  { id: 'india', component: IndiaDashboard },
  { id: 'regional', component: RegionalComparison },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('trends');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="animate-fadeInUp"
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
