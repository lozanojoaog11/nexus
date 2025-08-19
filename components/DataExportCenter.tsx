
import React from 'react';
import { PatternInsight, OptimizationRecommendation } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface DataExportCenterProps {
  data: any; 
  insights: PatternInsight[];
  recommendations: OptimizationRecommendation[];
  onBack: () => void;
}

const DataExportCenter: React.FC<DataExportCenterProps> = ({ data, insights, recommendations, onBack }) => {
  const { t } = useTranslation();
  
  const handleExport = () => {
    const exportData = {
        timestamp: new Date().toISOString(),
        ...data,
        insights,
        recommendations
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `eixo-os-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('neuralAnalytics.dataExport.title')}</h1>
          <p className="text-gray-400">{t('neuralAnalytics.dataExport.subtitle')}</p>
        </div>
      </div>
      <div className="text-center p-8 bg-gray-800/50 rounded-lg max-w-2xl mx-auto border border-gray-700">
        <div className="text-4xl mb-4">💾</div>
        <p className="text-gray-300 mb-6">{t('neuralAnalytics.dataExport.description')}</p>
        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('neuralAnalytics.dataExport.exportButton')}
        </button>
      </div>
    </div>
  );
};

export default DataExportCenter;
