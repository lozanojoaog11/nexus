import React, { useState, useEffect, useMemo } from 'react';
import { DailyCheckin, Habit, BiohackingMetrics } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import SleepOptimizer from './SleepOptimizer';
import NutritionTracker from './NutritionTracker';
import RecoveryCenter from './RecoveryCenter';
import SupplementTracker from './SupplementTracker';

interface BiohackingSuiteProps {
  checkin: DailyCheckin | null;
  habits: Habit[];
  metricsHistory: BiohackingMetrics[];
  onMetricsSave: (metrics: BiohackingMetrics) => void;
}

const BiohackingSuite: React.FC<BiohackingSuiteProps> = ({ checkin, habits, metricsHistory, onMetricsSave }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'sleep' | 'nutrition' | 'recovery' | 'supplements'>('overview');
  const [todayMetrics, setTodayMetrics] = useState<BiohackingMetrics | null>(null);
  
  const biohackingModules = useMemo(() => [
    { id: 'sleep', name: t('biohacking.modules.sleep.name'), icon: '😴', color: 'from-indigo-500 to-purple-600', description: t('biohacking.modules.sleep.description'), metrics: [t('biohacking.metrics.quality'), t('biohacking.metrics.duration'), t('biohacking.metrics.environment')], target: t('biohacking.modules.sleep.target') },
    { id: 'nutrition', name: t('biohacking.modules.nutrition.name'), icon: '🥗', color: 'from-green-500 to-emerald-600', description: t('biohacking.modules.nutrition.description'), metrics: [t('biohacking.metrics.macros'), t('biohacking.metrics.timing'), t('biohacking.metrics.stability')], target: t('biohacking.modules.nutrition.target') },
    { id: 'recovery', name: t('biohacking.modules.recovery.name'), icon: '💪', color: 'from-blue-500 to-cyan-600', description: t('biohacking.modules.recovery.description'), metrics: [t('biohacking.metrics.hrv'), t('biohacking.metrics.stress'), t('biohacking.metrics.readiness')], target: t('biohacking.modules.recovery.target') },
    { id: 'supplements', name: t('biohacking.modules.supplements.name'), icon: '💊', color: 'from-orange-500 to-red-500', description: t('biohacking.modules.supplements.description'), metrics: [t('biohacking.metrics.effectiveness'), t('biohacking.metrics.timing'), t('biohacking.metrics.stack')], target: t('biohacking.modules.supplements.target') }
  ], [t]);
  
  const optimizationScore = useMemo(() => {
    if (!todayMetrics) return 0;
    let score = 0;
    const factors = { sleep: 0.3, recovery: 0.25, nutrition: 0.25, hydration: 0.2 };
    let totalWeight = 0;

    if (todayMetrics.sleep) {
      const sleepScore = (todayMetrics.sleep.quality / 10 * 0.5) + (todayMetrics.sleep.restfulness / 10 * 0.5);
      const durationScore = Math.min(1, todayMetrics.sleep.duration / 8);
      score += ((sleepScore + durationScore) / 2) * 100 * factors.sleep;
      totalWeight += factors.sleep;
    }
    if (todayMetrics.recovery) {
      const hrvReadiness = (todayMetrics.recovery.hrvScore - 20) / 80; // Normalize 20-100 to 0-1
      const stressReadiness = 1 - (todayMetrics.recovery.stressLevel / 10);
      score += ((hrvReadiness + stressReadiness + (todayMetrics.recovery.readiness / 10)) / 3) * 100 * factors.recovery;
      totalWeight += factors.recovery;
    }
    if (todayMetrics.nutrition) {
      score += (todayMetrics.nutrition.energyStability / 10) * 100 * factors.nutrition;
      totalWeight += factors.nutrition;
    }
    if (todayMetrics.hydration) {
      const urineReadiness = Math.max(0, 1 - (todayMetrics.hydration.urineColor - 1) / 7);
      score += urineReadiness * 100 * factors.hydration;
      totalWeight += factors.hydration;
    }
    return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
  }, [todayMetrics]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const existingMetrics = metricsHistory.find(m => m.date === today);
    if (!existingMetrics) {
      const initialMetrics: BiohackingMetrics = {
        date: today,
        sleep: { bedtime: '22:00', wakeTime: '06:00', duration: 8, quality: 7, restfulness: 7, dreams: false, awakenings: 1, sleepLatency: 15, environment: { temperature: 18, darkness: 8, quietness: 8, airQuality: 7 } },
        nutrition: { calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, meals: [], fastingWindow: 16, lastMeal: '20:00', hydrationLevel: 7, energyStability: 7 },
        recovery: { hrvScore: 55, restingHeartRate: 60, stressLevel: checkin?.energia ? 10 - checkin.energia : 5, recoveryActivities: [], readiness: checkin?.energia || 7 },
        supplements: [],
        hydration: { totalIntake: 0, frequency: 0, urineColor: 4, electrolytes: false },
        temperature: []
      };
      setTodayMetrics(initialMetrics);
    } else {
      setTodayMetrics(existingMetrics);
    }
  }, [checkin, metricsHistory]);
  
  const handleUpdateMetrics = (updatedMetrics: Partial<BiohackingMetrics>) => {
      if (todayMetrics) {
          const newMetrics = { ...todayMetrics, ...updatedMetrics };
          setTodayMetrics(newMetrics);
          onMetricsSave(newMetrics);
      }
  };

  if (activeTab === 'overview') {
    return (
      <div className="p-8 text-white w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{t('biohacking.title')}</h1>
          <p className="text-gray-400 mt-2">{t('biohacking.subtitle')}</p>
        </header>
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-6 rounded-2xl border border-green-500/20 mb-8">
          <div className="text-center">
            <h2 className="text-gray-300 text-sm mb-2">{t('biohacking.optimizationScore')}</h2>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">{optimizationScore}</div>
            <p className="text-gray-400 text-sm mt-2">{t('biohacking.performanceIndex')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label={t('biohacking.overview.sleep')} value={`${todayMetrics?.sleep?.quality || 0}/10`} trend={+0.5} color="indigo" icon="😴" />
          <MetricCard label={t('biohacking.overview.hrv')} value={`${todayMetrics?.recovery?.hrvScore || 0}`} trend={+2} color="blue" icon="💗" />
          <MetricCard label={t('biohacking.overview.energy')} value={`${todayMetrics?.nutrition?.energyStability || 0}/10`} trend={-0.2} color="green" icon="⚡" />
          <MetricCard label={t('biohacking.overview.hydration')} value={`${todayMetrics?.hydration?.totalIntake || 0}ml`} trend={+200} color="cyan" icon="💧" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {biohackingModules.map(module => <BiohackingModuleCard key={module.id} module={module} onSelect={() => setActiveTab(module.id as any)} currentData={todayMetrics} />)}
        </div>
      </div>
    );
  }

  if (activeTab === 'sleep') {
    return <SleepOptimizer sleepData={todayMetrics?.sleep} onUpdate={(newSleepData) => handleUpdateMetrics({ sleep: newSleepData })} onBack={() => setActiveTab('overview')} />;
  }
  if (activeTab === 'nutrition') {
    return <NutritionTracker nutritionData={todayMetrics?.nutrition} onUpdate={(newNutritionData) => handleUpdateMetrics({ nutrition: newNutritionData })} onBack={() => setActiveTab('overview')} />;
  }
  if (activeTab === 'recovery') {
    return <RecoveryCenter recoveryData={todayMetrics?.recovery} onUpdate={(newRecoveryData) => handleUpdateMetrics({ recovery: newRecoveryData })} onBack={() => setActiveTab('overview')} />;
  }
  if (activeTab === 'supplements') {
    return <SupplementTracker supplements={todayMetrics?.supplements || []} onUpdate={(newSupplements) => handleUpdateMetrics({ supplements: newSupplements })} onBack={() => setActiveTab('overview')} />;
  }
  return null;
};

const MetricCard: React.FC<{ label: string; value: string; trend: number; color: string; icon: string; }> = ({ label, value, trend, color, icon }) => (
  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
    <div className="flex items-center justify-between mb-2"><span className="text-2xl">{icon}</span><span className={`text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}</span></div>
    <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const BiohackingModuleCard: React.FC<{ module: any; onSelect: () => void; currentData: BiohackingMetrics | null; }> = ({ module, onSelect, currentData }) => {
  const { t } = useTranslation();
  const getModuleScore = () => {
    if (!currentData) return 0;
    switch (module.id) {
      case 'sleep': return currentData.sleep ? Math.round((currentData.sleep.quality + currentData.sleep.restfulness) / 2) : 0;
      case 'nutrition': return currentData.nutrition?.energyStability || 0;
      case 'recovery': return currentData.recovery ? Math.round(currentData.recovery.hrvScore / 10) : 0;
      case 'supplements': return currentData.supplements.length > 0 ? 8 : 0; // Simplified score
      default: return 0;
    }
  };
  const score = getModuleScore();
  const getStatus = (s: number) => s >= 8 ? 'optimal' : s >= 6 ? 'good' : s >= 4 ? 'fair' : 'needs-attention';
  const status = getStatus(score);
  const statusColor = { optimal: 'text-green-400', good: 'text-blue-400', fair: 'text-yellow-400', 'needs-attention': 'text-red-400' }[status];
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center text-2xl`}>{module.icon}</div><div><h3 className="font-bold text-lg">{module.name}</h3><p className="text-gray-400 text-sm">{module.description}</p></div></div>
        <div className="text-right"><div className={`text-2xl font-bold ${statusColor}`}>{score.toFixed(1)}</div><div className="text-gray-400 text-xs">{t('biohacking.module.score')}</div></div>
      </div>
      <div className="space-y-2 mb-4">
        {module.metrics.map((metric: string) => <div key={metric} className="flex justify-between text-sm"><span className="text-gray-400">{metric}:</span><span className="text-white font-medium">{t(`biohacking.status.${getStatus(score)}`)}</span></div>)}
      </div>
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg"><div className="text-xs text-gray-400 mb-1">{t('biohacking.module.target')}:</div><div className="text-sm text-gray-300">{module.target}</div></div>
      <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${module.color} text-white font-medium hover:opacity-90`}>{t('biohacking.module.optimize')}</button>
    </div>
  );
};

export default BiohackingSuite;