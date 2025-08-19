
import React, { useState } from 'react';
import { OptimizationRecommendation, PerformanceMetric } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface OptimizationCenterProps {
  recommendations: OptimizationRecommendation[];
  performanceMetrics: PerformanceMetric[];
  onBack: () => void;
}

const OptimizationCenter: React.FC<OptimizationCenterProps> = ({ recommendations, performanceMetrics, onBack }) => {
  const { t } = useTranslation();
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const categories = [...new Set(recommendations.map(r => r.category))];
  const priorities = ['all', 'critical', 'high', 'medium', 'low'];

  const filteredRecommendations = recommendations.filter(rec => {
    const priorityMatch = priorityFilter === 'all' || rec.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    return priorityMatch && categoryMatch;
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
          <h1 className="text-2xl font-bold">{t('neuralAnalytics.optimizationCenter.title')}</h1>
          <p className="text-gray-400">{t('neuralAnalytics.optimizationCenter.subtitle')}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('neuralAnalytics.optimizationCenter.filterPriority')}</label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-gray-800 text-white p-2 rounded border border-gray-600">
            {priorities.map(p => <option key={p} value={p}>{p === 'all' ? t('neuralAnalytics.optimizationCenter.priorities.all') : t(`neuralAnalytics.recommendations.priorities.${p}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('neuralAnalytics.optimizationCenter.filterCategory')}</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-gray-800 text-white p-2 rounded border border-gray-600">
            <option value="all">{t('neuralAnalytics.optimizationCenter.categories.all')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="space-y-6">
        {filteredRecommendations.map(rec => <DetailedRecommendationCard key={rec.id} recommendation={rec}/>)}
      </div>
    </div>
  );
};


const DetailedRecommendationCard: React.FC<{recommendation: OptimizationRecommendation}> = ({ recommendation }) => {
  const { t } = useTranslation();
  const priorityColors = {
    critical: 'border-red-500 bg-red-900/20',
    high: 'border-orange-500 bg-orange-900/20',
    medium: 'border-yellow-500 bg-yellow-900/20',
    low: 'border-green-500 bg-green-900/20'
  };

  return (
    <div className={`p-6 rounded-lg border ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded uppercase font-bold border ${
              recommendation.priority === 'critical' ? 'border-red-500 text-red-400' :
              recommendation.priority === 'high' ? 'border-orange-500 text-orange-400' :
              recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
              'border-green-500 text-green-400'
            }`}>
              {t(`neuralAnalytics.recommendations.priorities.${recommendation.priority}`)}
            </span>
            <span className="text-sm text-gray-400">{recommendation.category}</span>
          </div>
          <h4 className="font-bold text-lg text-white">{recommendation.title}</h4>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-400">{recommendation.expectedImpact}%</div>
          <div className="text-xs text-gray-400">{t('neuralAnalytics.recommendations.expectedImpact')}</div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{recommendation.description}</p>
      
      <div className="mb-4 bg-gray-800/40 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-2">{t('neuralAnalytics.recommendations.implementationSteps')}</div>
        <ul className="space-y-1">
          {recommendation.implementation.map((step, index) => (
            <li key={index} className="text-sm text-gray-200 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
       <div className="bg-gray-800/40 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-2">{t('neuralAnalytics.insight.scientificBasis')}</div>
        <p className="text-xs text-gray-400">{recommendation.scientificEvidence}</p>
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <span>{t('neuralAnalytics.recommendations.timeframe')}: {t(`neuralAnalytics.recommendations.timeframes.${recommendation.timeframe}`)}</span>
      </div>
    </div>
  );
};


export default OptimizationCenter;
