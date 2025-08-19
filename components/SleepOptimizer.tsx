
import React, { useState } from 'react';
import { SleepData } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SleepOptimizerProps {
  sleepData: SleepData | undefined;
  onUpdate: (data: SleepData) => void;
  onBack: () => void;
}

const SleepOptimizer: React.FC<SleepOptimizerProps> = ({ sleepData, onUpdate, onBack }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<SleepData>(sleepData || {
    bedtime: '22:00', wakeTime: '06:00', duration: 8, quality: 7, restfulness: 7, dreams: false, awakenings: 1, sleepLatency: 15,
    environment: { temperature: 18, darkness: 8, quietness: 8, airQuality: 7 }
  });

  const handleSave = () => {
    onUpdate(data);
    onBack();
  };

  const sleepEfficiency = Math.round((data.duration * 60 - data.sleepLatency - (data.awakenings * 5)) / (data.duration * 60) * 100);
  const sleepScore = Math.round(((data.quality + data.restfulness) / 2) * 0.4 + (Math.min(10, (data.duration / 8) * 10)) * 0.4 + (sleepEfficiency / 100 * 10) * 0.2);
  
  const bedtimeHour = parseInt(data.bedtime.split(':')[0]);
  const circadianAlignment = bedtimeHour >= 21 && bedtimeHour <= 23 ? t('biohacking.sleep.circadian.optimal') : bedtimeHour >= 20 && bedtimeHour < 24 ? t('biohacking.sleep.circadian.good') : t('biohacking.sleep.circadian.suboptimal');

  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('biohacking.modules.sleep.name')}</h1>
          <p className="text-gray-400">{t('biohacking.modules.sleep.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-900/30 p-6 rounded-xl border border-indigo-500/30 text-center"><div className="text-3xl font-bold text-indigo-400">{sleepScore}</div><div className="text-gray-400 text-sm">{t('biohacking.sleep.score')}</div></div>
        <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/30 text-center"><div className="text-3xl font-bold text-purple-400">{sleepEfficiency}%</div><div className="text-gray-400 text-sm">{t('biohacking.sleep.efficiency')}</div></div>
        <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-500/30 text-center"><div className="text-lg font-bold text-blue-400">{circadianAlignment}</div><div className="text-gray-400 text-sm">{t('biohacking.sleep.circadian.sync')}</div></div>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('biohacking.sleep.timing.title')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.timing.bedtime')}</label><input type="time" value={data.bedtime} onChange={(e) => setData(prev => ({...prev, bedtime: e.target.value}))} className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600"/></div>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.timing.wakeTime')}</label><input type="time" value={data.wakeTime} onChange={(e) => setData(prev => ({...prev, wakeTime: e.target.value}))} className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600"/></div>
        </div>
        <div className="mt-4"><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.timing.duration')}: {data.duration}h</label><input type="range" min="4" max="12" step="0.5" value={data.duration} onChange={(e) => setData(prev => ({...prev, duration: parseFloat(e.target.value)}))} className="w-full accent-indigo-500"/></div>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('biohacking.sleep.quality.title')}</h3>
        <div className="space-y-4">
          <SliderInput label={t('biohacking.sleep.quality.overall')} value={data.quality} onChange={(val) => setData(prev => ({...prev, quality: val}))} color="indigo"/>
          <SliderInput label={t('biohacking.sleep.quality.restfulness')} value={data.restfulness} onChange={(val) => setData(prev => ({...prev, restfulness: val}))} color="purple"/>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.quality.latency')}: {data.sleepLatency} min</label><input type="range" min="1" max="60" value={data.sleepLatency} onChange={(e) => setData(prev => ({...prev, sleepLatency: parseInt(e.target.value)}))} className="w-full accent-blue-500"/></div>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.quality.awakenings')}: {data.awakenings}</label><input type="range" min="0" max="10" value={data.awakenings} onChange={(e) => setData(prev => ({...prev, awakenings: parseInt(e.target.value)}))} className="w-full accent-cyan-500"/></div>
        </div>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('biohacking.sleep.environment.title')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.environment.temperature')}: {data.environment.temperature}°C</label><input type="range" min="15" max="25" value={data.environment.temperature} onChange={(e) => setData(prev => ({...prev, environment: {...prev.environment, temperature: parseInt(e.target.value)}}))} className="w-full accent-blue-500"/></div>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.environment.darkness')}: {data.environment.darkness}/10</label><input type="range" min="1" max="10" value={data.environment.darkness} onChange={(e) => setData(prev => ({...prev, environment: {...prev.environment, darkness: parseInt(e.target.value)}}))} className="w-full accent-indigo-500"/></div>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.environment.quietness')}: {data.environment.quietness}/10</label><input type="range" min="1" max="10" value={data.environment.quietness} onChange={(e) => setData(prev => ({...prev, environment: {...prev.environment, quietness: parseInt(e.target.value)}}))} className="w-full accent-green-500"/></div>
          <div><label className="block text-sm text-gray-400 mb-2">{t('biohacking.sleep.environment.airQuality')}: {data.environment.airQuality}/10</label><input type="range" min="1" max="10" value={data.environment.airQuality} onChange={(e) => setData(prev => ({...prev, environment: {...prev.environment, airQuality: parseInt(e.target.value)}}))} className="w-full accent-cyan-500"/></div>
        </div>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('biohacking.sleep.recommendations.title')}</h3>
        <div className="space-y-3">
          {sleepScore < 8 && <RecommendationItem icon="🌙" title={t('biohacking.sleep.recommendations.env.title')} description={t('biohacking.sleep.recommendations.env.desc')} priority="high"/>}
          {data.sleepLatency > 20 && <RecommendationItem icon="📱" title={t('biohacking.sleep.recommendations.hygiene.title')} description={t('biohacking.sleep.recommendations.hygiene.desc')} priority="medium"/>}
          {circadianAlignment !== t('biohacking.sleep.circadian.optimal') && <RecommendationItem icon="☀️" title={t('biohacking.sleep.recommendations.alignment.title')} description={t('biohacking.sleep.recommendations.alignment.desc')} priority="high"/>}
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg">{t('biohacking.sleep.save')}</button>
    </div>
  );
};

const SliderInput: React.FC<{label: string; value: number; onChange: (val: number) => void; color: string;}> = ({ label, value, onChange, color }) => (
  <div>
    <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-400">{label}</label><span className={`text-lg font-bold text-${color}-400`}>{value}</span></div>
    <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className={`w-full accent-${color}-500`}/>
  </div>
);

const RecommendationItem: React.FC<{icon: string; title: string; description: string; priority: 'high' | 'medium' | 'low';}> = ({ icon, title, description, priority }) => {
  const { t } = useTranslation();
  const priorityText = { high: t('biohacking.priority.high'), medium: t('biohacking.priority.medium'), low: t('biohacking.priority.low') }[priority];
  const priorityColor = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' }[priority];
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1"><div className="text-white font-medium">{title}</div><div className="text-gray-400 text-sm">{description}</div></div>
      <div className={`text-xs font-bold ${priorityColor} uppercase`}>{priorityText}</div>
    </div>
  );
};

export default SleepOptimizer;