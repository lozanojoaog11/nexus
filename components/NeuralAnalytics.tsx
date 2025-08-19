import React, { useState, useEffect, useMemo } from 'react';
import { DailyCheckin, Habit, Task, Goal, FlowSession, CognitiveSession, BiohackingMetrics, Achievement, PatternInsight, PerformanceMetric, OptimizationRecommendation } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import PatternAnalysis from './PatternAnalysis';
import OptimizationCenter from './OptimizationCenter';
import DataExportCenter from './DataExportCenter';


interface NeuralAnalyticsProps {
  checkins: DailyCheckin[];
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  flowSessions: FlowSession[];
  cognitiveSessions: CognitiveSession[];
  biohackingData: BiohackingMetrics[];
  achievements: Achievement[];
}

const NeuralAnalytics: React.FC<NeuralAnalyticsProps> = ({
  checkins, habits, tasks, goals, flowSessions, cognitiveSessions, biohackingData, achievements
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'correlations' | 'optimization' | 'export'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      checkins: checkins.filter(c => new Date(c.timestamp) >= startDate),
      habits,
      tasks: tasks.filter(t => t.deadline ? new Date(t.deadline) >= startDate : true),
      flowSessions: flowSessions.filter(s => new Date(s.startTime) >= startDate),
      cognitiveSessions: cognitiveSessions.filter(s => new Date(s.date) >= startDate),
      biohackingData: biohackingData.filter(d => new Date(d.date) >= startDate)
    };
  }, [timeRange, checkins, habits, tasks, flowSessions, cognitiveSessions, biohackingData]);

  // Calculate performance metrics
  const calculatePerformanceMetrics = useMemo(() => {
    const metrics: PerformanceMetric[] = [];
    
    // Cognitive Performance
    if (filteredData.checkins.length > 0) {
      const avgClarity = filteredData.checkins.reduce((sum, c) => sum + c.clareza, 0) / filteredData.checkins.length;
      const prevWeekCheckins = checkins.slice(-14, -7);
      const prevAvgClarity = prevWeekCheckins.length > 0 
        ? prevWeekCheckins.reduce((sum, c) => sum + c.clareza, 0) / prevWeekCheckins.length 
        : avgClarity;
      
      metrics.push({
        name: t('neuralAnalytics.performance.mentalClarity.name'),
        current: avgClarity,
        trend: prevAvgClarity > 0 ? ((avgClarity - prevAvgClarity) / prevAvgClarity) * 100 : 0,
        target: 8.5,
        unit: '/10',
        category: 'cognitive',
        status: avgClarity >= 8 ? 'optimal' : avgClarity >= 6.5 ? 'good' : avgClarity >= 5 ? 'declining' : 'critical'
      });

      const avgEnergy = filteredData.checkins.reduce((sum, c) => sum + c.energia, 0) / filteredData.checkins.length;
      const prevAvgEnergy = prevWeekCheckins.length > 0 
        ? prevWeekCheckins.reduce((sum, c) => sum + c.energia, 0) / prevWeekCheckins.length 
        : avgEnergy;

      metrics.push({
        name: t('neuralAnalytics.performance.energyLevel.name'),
        current: avgEnergy,
        trend: prevAvgEnergy > 0 ? ((avgEnergy - prevAvgEnergy) / prevAvgEnergy) * 100 : 0,
        target: 8.0,
        unit: '/10',
        category: 'physical',
        status: avgEnergy >= 8 ? 'optimal' : avgEnergy >= 6.5 ? 'good' : avgEnergy >= 5 ? 'declining' : 'critical'
      });
    }

    // Habit Consistency
    if (habits.length > 0) {
      const totalDays = Math.min(30, (new Date().getTime() - new Date(filteredData.checkins[0]?.timestamp || Date.now()).getTime()) / (1000 * 3600 * 24));
      if (totalDays > 0) {
        const completionRates = habits.map(habit => {
          const completedDays = habit.history.filter(h => 
            h.completed && 
            new Date(h.date) >= new Date(Date.now() - totalDays * 24 * 60 * 60 * 1000)
          ).length;
          return (completedDays / totalDays) * 100;
        });
        
        const avgConsistency = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
        
        metrics.push({
          name: t('neuralAnalytics.performance.habitConsistency.name'),
          current: avgConsistency,
          trend: 5, // Placeholder - would calculate from historical data
          target: 85,
          unit: '%',
          category: 'productivity',
          status: avgConsistency >= 80 ? 'optimal' : avgConsistency >= 65 ? 'good' : avgConsistency >= 50 ? 'declining' : 'critical'
        });
      }
    }

    // Flow State Frequency
    if (filteredData.flowSessions.length > 0) {
      const avgFlowRating = filteredData.flowSessions.reduce((sum, s) => sum + s.flowRating, 0) / filteredData.flowSessions.length;
      const weeklyFlowSessions = filteredData.flowSessions.length / (Math.ceil(filteredData.checkins.length / 7) || 1);
      
      metrics.push({
        name: t('neuralAnalytics.performance.flowStateQuality.name'),
        current: avgFlowRating,
        trend: 8, // Placeholder
        target: 8.5,
        unit: '/10',
        category: 'cognitive',
        status: avgFlowRating >= 8 ? 'optimal' : avgFlowRating >= 6.5 ? 'good' : 'declining'
      });

      metrics.push({
        name: t('neuralAnalytics.performance.flowFrequency.name'),
        current: weeklyFlowSessions,
        trend: 12, // Placeholder
        target: 5,
        unit: t('neuralAnalytics.performance.flowFrequency.unit'),
        category: 'productivity',
        status: weeklyFlowSessions >= 4 ? 'optimal' : weeklyFlowSessions >= 2 ? 'good' : 'declining'
      });
    }

    // Cognitive Training Progress
    if (filteredData.cognitiveSessions.length > 0) {
      const recentSessions = filteredData.cognitiveSessions.slice(-10);
      const avgScore = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;
      
      metrics.push({
        name: t('neuralAnalytics.performance.cognitiveTraining.name'),
        current: avgScore,
        trend: 15, // Placeholder
        target: 85,
        unit: '%',
        category: 'cognitive',
        status: avgScore >= 80 ? 'optimal' : avgScore >= 70 ? 'good' : 'declining'
      });
    }

    return metrics;
  }, [filteredData, t, checkins]);

  // Helper function for correlation calculation
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  };


  // Pattern Recognition Engine
  const generateInsights = useMemo(() => {
    const insights: PatternInsight[] = [];

    // Energy-Sleep Correlation Analysis
    if (filteredData.checkins.length >= 7 && filteredData.biohackingData.length >= 7) {
      const energyValues = filteredData.checkins.map(c => c.energia);
      const sleepQualityValues = filteredData.biohackingData.map(d => d.sleep.quality);
      
      const correlation = calculateCorrelation(energyValues, sleepQualityValues);
      
      if (Math.abs(correlation) > 0.6) {
        insights.push({
          id: 'energy_sleep_correlation', type: 'correlation',
          title: t('neuralAnalytics.insights.energySleep.title'),
          description: t('neuralAnalytics.insights.energySleep.description', { correlation: (Math.abs(correlation) * 100).toFixed(0), direction: correlation > 0 ? t('neuralAnalytics.insights.positive') : t('neuralAnalytics.insights.negative') }),
          confidence: Math.abs(correlation) * 100, impact: 'high', actionable: true,
          recommendation: correlation > 0 ? t('neuralAnalytics.insights.energySleep.recommendationPositive') : t('neuralAnalytics.insights.energySleep.recommendationNegative'),
          data: { correlation, energyValues, sleepQualityValues },
          scientificBasis: t('neuralAnalytics.insights.energySleep.science')
        });
      }
    }

    // Habit Streak Impact Analysis
    const longestStreaks = habits.map(habit => ({ habit: habit.name, streak: habit.bestStreak })).filter(h => h.streak >= 7);

    if (longestStreaks.length > 0) {
      const bestHabit = longestStreaks.reduce((prev, curr) => prev.streak > curr.streak ? prev : curr);
      
      insights.push({
        id: 'habit_streak_pattern', type: 'trend',
        title: t('neuralAnalytics.insights.habitMastery.title'),
        description: t('neuralAnalytics.insights.habitMastery.description', { habit: bestHabit.habit, streak: bestHabit.streak }),
        confidence: 85, impact: 'medium', actionable: true,
        recommendation: t('neuralAnalytics.insights.habitMastery.recommendation'),
        data: { bestHabit, allStreaks: longestStreaks },
        scientificBasis: t('neuralAnalytics.insights.habitMastery.science')
      });
    }

    // Flow Session Optimization
    if (filteredData.flowSessions.length >= 5) {
      const highFlowSessions = filteredData.flowSessions.filter(s => s.flowRating >= 8);
      if (highFlowSessions.length > 0) {
        const lowDistractionsAvg = highFlowSessions.reduce((sum, s) => sum + s.distractionCount, 0) / highFlowSessions.length;
        const optimalDuration = highFlowSessions.reduce((sum, s) => sum + s.duration, 0) / highFlowSessions.length;
        
        insights.push({
          id: 'flow_optimization_pattern', type: 'optimization',
          title: t('neuralAnalytics.insights.flowOptimization.title'),
          description: t('neuralAnalytics.insights.flowOptimization.description', { duration: Math.round(optimalDuration), distractions: Math.round(lowDistractionsAvg) }),
          confidence: 78, impact: 'high', actionable: true,
          recommendation: t('neuralAnalytics.insights.flowOptimization.recommendation', { duration: Math.round(optimalDuration) }),
          data: { optimalDuration, lowDistractionsAvg, highFlowSessions: highFlowSessions.length },
          scientificBasis: t('neuralAnalytics.insights.flowOptimization.science')
        });
      }
    }

    // Cognitive Performance Anomaly Detection
    if (filteredData.cognitiveSessions.length >= 10) {
      const scores = filteredData.cognitiveSessions.map(s => s.score);
      const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const stdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length);
      
      const recentSessions = filteredData.cognitiveSessions.slice(-5);
      if (recentSessions.length > 0) {
        const recentAvg = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;
      
        if (recentAvg > mean + stdDev) {
          insights.push({
            id: 'cognitive_breakthrough', type: 'anomaly',
            title: t('neuralAnalytics.insights.cognitiveBreakthrough.title'),
            description: t('neuralAnalytics.insights.cognitiveBreakthrough.description', { recentAvg: Math.round(recentAvg), mean: Math.round(mean) }),
            confidence: 92, impact: 'high', actionable: true,
            recommendation: t('neuralAnalytics.insights.cognitiveBreakthrough.recommendation'),
            data: { recentAvg, mean, improvement: recentAvg - mean },
            scientificBasis: t('neuralAnalytics.insights.cognitiveBreakthrough.science')
          });
        }
      }
    }

    return insights;
  }, [filteredData, habits, t]);

  // Generate Optimization Recommendations
  const generateRecommendations = useMemo(() => {
    const recommendations: OptimizationRecommendation[] = [];
    const recentSleepData = filteredData.biohackingData.slice(-7);
    if (recentSleepData.length > 0) {
      const avgSleepQuality = recentSleepData.reduce((sum, d) => sum + d.sleep.quality, 0) / recentSleepData.length;
      if (avgSleepQuality < 7.5) {
        recommendations.push({
          id: 'sleep_optimization', priority: 'critical', category: t('neuralAnalytics.recommendations.categories.foundation'),
          title: t('neuralAnalytics.recommendations.sleep.title'),
          description: t('neuralAnalytics.recommendations.sleep.description', { quality: avgSleepQuality.toFixed(1) }),
          expectedImpact: 85, implementation: t('neuralAnalytics.recommendations.sleep.implementation').split('|'),
          timeframe: 'immediate', scientificEvidence: t('neuralAnalytics.recommendations.sleep.science')
        });
      }
    }
    if (filteredData.cognitiveSessions.length > 0) {
      const sessionFrequency = filteredData.cognitiveSessions.length / Math.max(1, Math.ceil(filteredData.checkins.length / 7));
      if (sessionFrequency < 3) {
        recommendations.push({
          id: 'cognitive_frequency', priority: 'high', category: t('neuralAnalytics.recommendations.categories.enhancement'),
          title: t('neuralAnalytics.recommendations.cognitive.title'),
          description: t('neuralAnalytics.recommendations.cognitive.description', { frequency: sessionFrequency.toFixed(1) }),
          expectedImpact: 70, implementation: t('neuralAnalytics.recommendations.cognitive.implementation').split('|'),
          timeframe: 'weekly', scientificEvidence: t('neuralAnalytics.recommendations.cognitive.science')
        });
      }
    }
    if (filteredData.flowSessions.length > 0) {
      const avgDistractions = filteredData.flowSessions.reduce((sum, s) => sum + s.distractionCount, 0) / filteredData.flowSessions.length;
      if (avgDistractions > 2) {
        recommendations.push({
          id: 'flow_distraction_reduction', priority: 'medium', category: t('neuralAnalytics.recommendations.categories.performance'),
          title: t('neuralAnalytics.recommendations.flow.title'),
          description: t('neuralAnalytics.recommendations.flow.description', { distractions: avgDistractions.toFixed(1) }),
          expectedImpact: 65, implementation: t('neuralAnalytics.recommendations.flow.implementation').split('|'),
          timeframe: 'immediate', scientificEvidence: t('neuralAnalytics.recommendations.flow.science')
        });
      }
    }
    const habitConsistency = calculatePerformanceMetrics.find(m => m.name === t('neuralAnalytics.performance.habitConsistency.name'));
    if (habitConsistency && habitConsistency.current < 75) {
      recommendations.push({
        id: 'habit_consistency', priority: 'high', category: t('neuralAnalytics.recommendations.categories.system'),
        title: t('neuralAnalytics.recommendations.habit.title'),
        description: t('neuralAnalytics.recommendations.habit.description', { consistency: habitConsistency.current.toFixed(1) }),
        expectedImpact: 80, implementation: t('neuralAnalytics.recommendations.habit.implementation').split('|'),
        timeframe: 'monthly', scientificEvidence: t('neuralAnalytics.recommendations.habit.science')
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [filteredData, calculatePerformanceMetrics, t]);

  useEffect(() => {
    setPerformanceMetrics(calculatePerformanceMetrics);
    setInsights(generateInsights);
    setRecommendations(generateRecommendations);
  }, [calculatePerformanceMetrics, generateInsights, generateRecommendations]);

  if (activeTab === 'overview') {
    return (
      <div className="p-8 text-white w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{t('neuralAnalytics.title')}</h1>
          <p className="text-gray-400 mt-2">{t('neuralAnalytics.subtitle')}</p>
          <div className="flex gap-2 mt-4">
            {(['week', 'month', 'quarter', 'year'] as const).map(range => (
              <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                {t(`neuralAnalytics.timeRange.${range}`)}
              </button>
            ))}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {performanceMetrics.map(metric => <PerformanceMetricCard key={metric.name} metric={metric} />)}
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><span>🔍</span> {t('neuralAnalytics.overview.keyInsights')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map(insight => <InsightCard key={insight.id} insight={insight} />)}
          </div>
          {insights.length > 4 && <button onClick={() => setActiveTab('patterns')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">{t('neuralAnalytics.overview.viewAllInsights', { count: insights.length })}</button>}
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><span>⚡</span> {t('neuralAnalytics.overview.priorityActions')}</h3>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map(rec => <RecommendationCard key={rec.id} recommendation={rec} />)}
          </div>
          {recommendations.length > 3 && <button onClick={() => setActiveTab('optimization')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">{t('neuralAnalytics.overview.viewAllRecommendations', { count: recommendations.length })}</button>}
        </div>
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">{t('neuralAnalytics.overview.summary.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-cyan-400">{filteredData.checkins.length}</div><div className="text-gray-400 text-sm">{t('neuralAnalytics.overview.summary.checkins')}</div></div>
            <div><div className="text-2xl font-bold text-green-400">{insights.length}</div><div className="text-gray-400 text-sm">{t('neuralAnalytics.overview.summary.patterns')}</div></div>
            <div><div className="text-2xl font-bold text-yellow-400">{recommendations.length}</div><div className="text-gray-400 text-sm">{t('neuralAnalytics.overview.summary.optimizations')}</div></div>
            <div><div className="text-2xl font-bold text-purple-400">{Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / (insights.length || 1))}%</div><div className="text-gray-400 text-sm">{t('neuralAnalytics.overview.summary.confidence')}</div></div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'patterns') return <PatternAnalysis insights={insights} timeRange={timeRange} onBack={() => setActiveTab('overview')} />;
  if (activeTab === 'optimization') return <OptimizationCenter recommendations={recommendations} performanceMetrics={performanceMetrics} onBack={() => setActiveTab('overview')} />;
  if (activeTab === 'export') return <DataExportCenter data={filteredData} insights={insights} recommendations={recommendations} onBack={() => setActiveTab('overview')} />;
  return null;
};

// SUB-COMPONENTS
const PerformanceMetricCard: React.FC<{metric: PerformanceMetric}> = ({ metric }) => {
  const { t } = useTranslation();
  const statusColors = { optimal: 'text-green-400 border-green-500/30 bg-green-900/20', good: 'text-blue-400 border-blue-500/30 bg-blue-900/20', declining: 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20', critical: 'text-red-400 border-red-500/30 bg-red-900/20' };
  const trendIcon = metric.trend > 0 ? '↗️' : metric.trend < 0 ? '↘️' : '➡️';
  const trendColor = metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400';
  return (
    <div className={`p-4 rounded-lg border ${statusColors[metric.status]}`}>
      <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-300">{metric.name}</span><span className={`text-sm ${trendColor}`}>{trendIcon} {Math.abs(metric.trend).toFixed(1)}%</span></div>
      <div className="flex items-baseline gap-1 mb-2"><span className="text-2xl font-bold">{metric.current.toFixed(1)}</span><span className="text-sm text-gray-400">{metric.unit}</span></div>
      <div className="flex justify-between text-xs text-gray-400"><span>{t('neuralAnalytics.performance.target')}: {metric.target}{metric.unit}</span><span className="capitalize">{t(`neuralAnalytics.performance.statuses.${metric.status}`)}</span></div>
    </div>
  );
};
const InsightCard: React.FC<{insight: PatternInsight}> = ({ insight }) => {
  const { t } = useTranslation();
  const impactColors = { high: 'border-red-500/30 bg-red-900/10', medium: 'border-yellow-500/30 bg-yellow-900/10', low: 'border-green-500/30 bg-green-900/10' };
  const typeIcons = { correlation: '🔗', trend: '📈', anomaly: '⚠️', optimization: '⚡' };
  return (
    <div className={`p-4 rounded-lg border ${impactColors[insight.impact]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2"><span className="text-lg">{typeIcons[insight.type]}</span><span className="text-xs px-2 py-1 bg-gray-800 rounded uppercase font-medium">{t(`neuralAnalytics.insight.types.${insight.type}`)}</span></div>
        <span className="text-xs text-gray-400">{insight.confidence.toFixed(0)}% {t('neuralAnalytics.insight.confidence')}</span>
      </div>
      <h4 className="font-semibold text-white mb-2">{insight.title}</h4>
      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
      {insight.recommendation && <div className="bg-gray-800/50 p-3 rounded text-sm"><div className="text-gray-400 text-xs mb-1">{t('neuralAnalytics.insight.recommendation')}:</div><div className="text-gray-200">{insight.recommendation}</div></div>}
    </div>
  );
};
const RecommendationCard: React.FC<{recommendation: OptimizationRecommendation}> = ({ recommendation }) => {
  const { t } = useTranslation();
  const priorityColors = { critical: 'border-red-500 bg-red-900/20', high: 'border-orange-500 bg-orange-900/20', medium: 'border-yellow-500 bg-yellow-900/20', low: 'border-green-500 bg-green-900/20' };
  return (
    <div className={`p-6 rounded-lg border ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded uppercase font-bold border ${recommendation.priority === 'critical' ? 'border-red-500 text-red-400' : recommendation.priority === 'high' ? 'border-orange-500 text-orange-400' : recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'}`}>{t(`neuralAnalytics.recommendations.priorities.${recommendation.priority}`)}</span>
            <span className="text-sm text-gray-400">{recommendation.category}</span>
          </div>
          <h4 className="font-bold text-lg text-white">{recommendation.title}</h4>
        </div>
        <div className="text-right"><div className="text-lg font-bold text-blue-400">{recommendation.expectedImpact}%</div><div className="text-xs text-gray-400">{t('neuralAnalytics.recommendations.expectedImpact')}</div></div>
      </div>
      <p className="text-gray-300 mb-4">{recommendation.description}</p>
      <div className="mb-4"><div className="text-sm font-medium text-gray-400 mb-2">{t('neuralAnalytics.recommendations.implementationSteps')}:</div>
        <ul className="space-y-1">{recommendation.implementation.map((step, index) => <li key={index} className="text-sm text-gray-300 flex items-start gap-2"><span className="text-blue-400 mt-1">•</span>{step}</li>)}</ul>
      </div>
      <div className="flex justify-between text-xs text-gray-400"><span>{t('neuralAnalytics.recommendations.timeframe')}: {t(`neuralAnalytics.recommendations.timeframes.${recommendation.timeframe}`)}</span></div>
    </div>
  );
};

export default NeuralAnalytics;
