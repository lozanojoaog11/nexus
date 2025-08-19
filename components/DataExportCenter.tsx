import React from 'react';
import { PatternInsight, OptimizationRecommendation } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface DataExportCenterProps {
  data: any; // Simplified for placeholder
  insights: PatternInsight[];
  recommendations: OptimizationRecommendation[];
  onBack: () => void;
}

const DataExportCenter: React.FC<DataExportCenterProps> = ({ onBack }) => {
  const { t } = useTranslation();
  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Data Export Center</h1>
          <p className="text-gray-400">This module is under development.</p>
        </div>
      </div>
      <div className="text-center p-8 bg-gray-800/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-400">Data export functionality will be available here.</p>
      </div>
    </div>
  );
};

export default DataExportCenter;
