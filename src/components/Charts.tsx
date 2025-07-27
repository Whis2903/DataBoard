'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from './LoadingSpinner';
import type { Config as PlotlyConfig, Data as PlotlyData, Layout as PlotlyLayout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <LoadingSpinner size="lg" text="Loading visualization..." />
    </div>
  ),
});

interface PlotProps {
  data: Partial<PlotlyData>[];
  layout?: Partial<PlotlyLayout>;
  config?: Partial<PlotlyConfig>;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const PlotWrapper = (props: PlotProps) => {
  const defaultConfig: Partial<PlotlyConfig> = {
    responsive: true,
    displayModeBar: false,
    staticPlot: false,
    scrollZoom: false,
    doubleClick: 'reset' as const,
    showTips: false,
    ...props.config
  };

  const defaultLayout = {
    autosize: true,
    font: { 
      family: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc' 
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    ...props.layout
  };

  return (
    <Plot
      {...props}
      layout={defaultLayout}
      config={defaultConfig}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%', ...props.style }}
    />
  );
};

export default PlotWrapper;
