import React, { useState, useMemo } from 'react';
import { CognitiveSession, TrainingModule } from '../types';
import DualNBackTrainer from './DualNBackTrainer';
import SpeedReadingTrainer from './SpeedReadingTrainer';
import MemoryPalaceBuilder from './MemoryPalaceBuilder';
import ReactionTimeTracker from './ReactionTimeTracker';
import { useTranslation } from '../hooks/useTranslation';

interface CognitiveTrainingProps {
  sessions: CognitiveSession[];
  onSessionComplete: (session: CognitiveSession) => void;
}

// COMPONENTE PRINCIPAL
const CognitiveTraining: React.FC<CognitiveTrainingProps> = ({ sessions, onSessionComplete }) => {
  const { t, language } = useTranslation();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const weeklyProgress = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo);

    const dnbSessions = recentSessions.filter(s => s.type === 'dual-n-back');
    const rtSessions = recentSessions.filter(s => s.type === 'reaction-time');
    const mpSessions = recentSessions.filter(s => s.type === 'memory-palace');
    const srSessions = recentSessions.filter(s => s.type === 'speed-reading');

    return {
      workingMemory: dnbSessions.length > 0 ? Math.max(...dnbSessions.map(s => s.level)) : 0,
      processingSpeed: rtSessions.length > 0 ? Math.min(...rtSessions.map(s => s.score)) : 350,
      memoryCapacity: mpSessions.length > 0 ? Math.max(...mpSessions.map(s => Math.round(s.score / 10))) : 0,
      readingSpeed: srSessions.length > 0 ? Math.max(...srSessions.map(s => s.score)) : 250
    };
  }, [sessions]);


  const trainingModules: TrainingModule[] = useMemo(() => [
    {
      id: 'dual-n-back',
      name: t('cognitive.modules.dual-n-back.name'),
      description: t('cognitive.modules.dual-n-back.description'),
      icon: '🧠',
      color: 'from-purple-500 to-indigo-600',
      scientificBasis: 'Increases fluid intelligence and working memory capacity',
      targetMetric: t('cognitive.modules.dual-n-back.metric'),
      component: DualNBackTrainer
    },
    {
      id: 'speed-reading',
      name: t('cognitive.modules.speed-reading.name'),
      description: t('cognitive.modules.speed-reading.description'),
      icon: '👁️',
      color: 'from-blue-500 to-cyan-500',
      scientificBasis: 'Reduces subvocalization, improves saccadic movements',
      targetMetric: t('cognitive.modules.speed-reading.metric'),
      component: SpeedReadingTrainer
    },
    {
      id: 'memory-palace',
      name: t('cognitive.modules.memory-palace.name'),
      description: t('cognitive.modules.memory-palace.description'),
      icon: '🏰',
      color: 'from-green-500 to-emerald-600',
      scientificBasis: 'Leverages spatial memory for superior retention',
      targetMetric: t('cognitive.modules.memory-palace.metric'),
      component: MemoryPalaceBuilder
    },
    {
      id: 'reaction-time',
      name: t('cognitive.modules.reaction-time.name'),
      description: t('cognitive.modules.reaction-time.description'),
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      scientificBasis: 'Improves neural transmission speed and decision making',
      targetMetric: t('cognitive.modules.reaction-time.metric'),
      component: ReactionTimeTracker
    }
  ], [t]);

  const handleSessionComplete = (session: CognitiveSession) => {
    onSessionComplete(session);
    setActiveModule(null);
  };

  // MAIN DASHBOARD VIEW
  if (!activeModule) {
    return (
      <div className="p-8 text-white w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {t('cognitive.title')}
          </h1>
          <p className="text-gray-400 mt-2">{t('cognitive.subtitle')}</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ProgressCard 
            label={t('cognitive.progress.workingMemory')}
            value={weeklyProgress.workingMemory} 
            suffix={t('cognitive.progress.levelSuffix')}
            color="purple"
          />
          <ProgressCard 
            label={t('cognitive.progress.processingSpeed')}
            value={weeklyProgress.processingSpeed} 
            suffix={t('cognitive.progress.msSuffix')}
            color="blue"
          />
          <ProgressCard 
            label={t('cognitive.progress.memoryCapacity')}
            value={weeklyProgress.memoryCapacity} 
            suffix={t('cognitive.progress.itemsSuffix')}
            color="green"
          />
          <ProgressCard 
            label={t('cognitive.progress.readingSpeed')}
            value={weeklyProgress.readingSpeed} 
            suffix={t('cognitive.progress.wpmSuffix')}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {trainingModules.map(module => (
            <TrainingModuleCard 
              key={module.id}
              module={module}
              onStart={() => setActiveModule(module.id)}
              recentSessions={sessions.filter(s => s.type === module.id).slice(0, 5)}
            />
          ))}
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">{t('cognitive.recentSessions')}</h3>
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 8).map(session => (
                <SessionHistoryItem key={session.id} session={session} trainingModules={trainingModules} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {t('cognitive.noSessions')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE MODULE VIEW
  const activeModuleData = trainingModules.find(m => m.id === activeModule);
  if (!activeModuleData) return null;

  const ActiveComponent = activeModuleData.component;

  return (
    <div className="p-8 text-white w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveModule(null)}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{activeModuleData.name}</h1>
            <p className="text-gray-400">{activeModuleData.description}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${activeModuleData.color}`}>
          <span className="text-2xl">{activeModuleData.icon}</span>
        </div>
      </div>

      <ActiveComponent 
        onSessionComplete={handleSessionComplete}
      />
    </div>
  );
};

// SUB-COMPONENTS
const ProgressCard: React.FC<{
  label: string; 
  value: number; 
  suffix: string; 
  color: string;
}> = ({ label, value, suffix, color }) => (
  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
    <div className="text-center">
      <div className={`text-2xl font-bold text-${color}-400`}>
        {value}{suffix}
      </div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  </div>
);

const TrainingModuleCard: React.FC<{
  module: TrainingModule;
  onStart: () => void;
  recentSessions: CognitiveSession[];
}> = ({ module, onStart, recentSessions }) => {
  const { t } = useTranslation();
  const bestScore = recentSessions.length > 0 
    ? Math.max(...recentSessions.map(s => s.score))
    : 0;
  
  const improvement = recentSessions.length >= 2 
    ? recentSessions[0].score - recentSessions[1].score
    : 0;

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center text-2xl`}>
            {module.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{module.name}</h3>
            <p className="text-gray-400 text-sm">{module.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('cognitive.moduleCard.bestScore')}:</span>
          <span className="text-white font-medium">{bestScore} {module.targetMetric}</span>
        </div>
        
        {improvement !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('cognitive.moduleCard.lastChange')}:</span>
            <span className={`font-medium ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvement > 0 ? '+' : ''}{improvement}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('cognitive.moduleCard.sessions')}:</span>
          <span className="text-white">{recentSessions.length}</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">{t('cognitive.moduleCard.scientificBasis')}:</div>
        <div className="text-sm text-gray-300">{module.scientificBasis}</div>
      </div>

      <button 
        onClick={onStart}
        className={`w-full py-3 rounded-lg bg-gradient-to-r ${module.color} text-white font-bold hover:opacity-90 transition-opacity`}
      >
        {t('cognitive.startTraining')}
      </button>
    </div>
  );
};

const SessionHistoryItem: React.FC<{session: CognitiveSession; trainingModules: TrainingModule[]}> = ({ session, trainingModules }) => {
  const { t, language } = useTranslation();
  const moduleInfo = trainingModules.find(m => m.id === session.type);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm">
          {moduleInfo?.icon || '?'}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{moduleInfo?.name || session.type}</div>
          <div className="text-gray-400 text-xs">
            {new Date(session.date).toLocaleDateString(language)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-bold">{session.score}</div>
        <div className="text-gray-400 text-xs">{Math.round(session.duration / 60)}{t('cognitive.sessionHistory.durationSuffix')}</div>
      </div>
    </div>
  );
};

export default CognitiveTraining;