'use client';

import { useState } from 'react';
import IndicatorTrends from '../pages/indicator-trends';
import IndicatorComparison from '../pages/indicator-comparison';
import WorldMap from '../pages/world-map';
import IndiaDashboard from '../pages/india-dashboard';
import RegionalComparison from '../pages/regional-comparison';

const tabs = [
  { id: 'trends', label: '📈 Indicator Trends', component: IndicatorTrends },
  { id: 'comparison', label: '🔄 Indicator vs Happiness', component: IndicatorComparison },
  { id: 'worldmap', label: '🗺️ World Happiness Map', component: WorldMap },
  { id: 'india', label: '🇮🇳 India Dashboard', component: IndiaDashboard },
  { id: 'regional', label: '🌏 Regional Comparison', component: RegionalComparison },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('trends');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            🌍 Global Happiness Dashboard
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Explore happiness trends, correlations, and insights across countries and regions
          </p>
        </div>
      </div>

      {}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 whitespace-nowrap border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
