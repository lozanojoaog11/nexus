import React, { useState } from 'react';
import { PatternInsight } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface PatternAnalysisProps {
  insights: PatternInsight[];
  timeRange: string;
  onBack: () => void;
}

const PatternAnalysis: React.FC<PatternAnalysisProps> = ({ insights, timeRange, onBack }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'impact'>('confidence');

  const insightTypes = ['all', 'correlation', 'trend', 'anomaly', 'optimization'];
  
  const filteredInsights = insights
    .filter(insight => selectedType === 'all' || insight.type === selectedType)
    .sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });

  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('neuralAnalytics.patterns.title')}</h1>
          <p className="text-gray-400">{t('neuralAnalytics.patterns.subtitle', { timeRange: t(`neuralAnalytics.timeRange.${timeRange}`) })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('neuralAnalytics.patterns.filterType')}</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            {insightTypes.map(type => (
              <option key={type} value={type}>
                {t(`neuralAnalytics.patterns.types.${type}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('neuralAnalytics.patterns.sortBy')}</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'confidence' | 'impact')}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            <option value="confidence">{t('neuralAnalytics.patterns.sortOptions.confidence')}</option>
            <option value="impact">{t('neuralAnalytics.patterns.sortOptions.impact')}</option>
          </select>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-6">
        {filteredInsights.map(insight => (
          <DetailedInsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          <p>{t('neuralAnalytics.patterns.noResults')}</p>
          <p className="mt-2">{t('neuralAnalytics.patterns.noResultsHint')}</p>
        </div>
      )}
    </div>
  );
};

const DetailedInsightCard: React.FC<{insight: PatternInsight}> = ({ insight }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  
  const impactColors = {
    high: 'border-red-500/50 bg-red-900/10',
    medium: 'border-yellow-500/50 bg-yellow-900/10',
    low: 'border-green-500/50 bg-green-900/10'
  };

  const typeIcons = {
    correlation: '🔗',
    trend: '📈',
    anomaly: '⚠️',
    optimization: '⚡'
  };

  return (
    <div className={`p-6 rounded-xl border ${impactColors[insight.impact]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[insight.type]}</span>
          <div>
            <h3 className="font-bold text-lg text-white">{insight.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-800 rounded uppercase font-medium">
                {t(`neuralAnalytics.insight.types.${insight.type}`)}
              </span>
              <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${
                insight.impact === 'high' ? 'bg-red-900/30 text-red-400' :
                insight.impact === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-green-900/30 text-green-400'
              }`}>
                {t(`neuralAnalytics.insight.impacts.${insight.impact}`)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{insight.confidence}%</div>
          <div className="text-xs text-gray-400">{t('neuralAnalytics.insight.confidence')}</div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4 leading-relaxed">{insight.description}</p>
      
      {insight.recommendation && (
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <span className="font-medium text-blue-400">{t('neuralAnalytics.insight.recommendation')}</span>
          </div>
          <p className="text-gray-200">{insight.recommendation}</p>
        </div>
      )}
      
      <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span>🧪</span>
          <span className="font-medium text-gray-300">{t('neuralAnalytics.insight.scientificBasis')}</span>
        </div>
        <p className="text-sm text-gray-400">{insight.scientificBasis}</p>
      </div>
      
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
      >
        {showDetails ? t('neuralAnalytics.insight.hideDetails') : t('neuralAnalytics.insight.showDetails')}
      </button>
      
      {showDetails && insight.data && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
          <div className="text-sm font-medium text-gray-300 mb-2">{t('neuralAnalytics.insight.rawData')}:</div>
          <pre className="text-xs text-gray-400 overflow-x-auto">
            {JSON.stringify(insight.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PatternAnalysis;
