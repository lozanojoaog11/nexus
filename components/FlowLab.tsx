import React, { useState, useEffect, useRef } from 'react';
import { Task, DailyCheckin, FlowSession, EnvironmentSettings } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import FlowPresetCard from './flowlab/FlowPresetCard';
import EnvironmentControls from './flowlab/EnvironmentControls';
import SessionHistoryCard from './flowlab/SessionHistoryCard';
import SessionCompletionView from './flowlab/SessionCompletionView';

interface FlowLabProps {
  tasks: Task[];
  checkin: DailyCheckin | null;
  sessionHistory: FlowSession[];
  onSessionSave: (session: FlowSession, earnedXp: number) => void;
}

const FlowLab: React.FC<FlowLabProps> = ({ tasks, checkin, sessionHistory, onSessionSave }) => {
  const { t, language } = useTranslation();
  const [currentSession, setCurrentSession] = useState<FlowSession | null>(null);
  const [sessionMode, setSessionMode] = useState<'setup' | 'active' | 'break' | 'complete'>('setup');
  const [timeRemaining, setTimeRemaining] = useState(90 * 60);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [environment, setEnvironment] = useState<EnvironmentSettings>({
    musicType: 'focus',
    lightingLevel: 7,
    temperature: 22,
    noiseLevel: 'minimal',
    distractionsBlocked: true
  });
  const [distractionCount, setDistractionCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const flowPresets = [
    { nameKey: 'flowLab.presets.deepWork.name', duration: 90, descKey: 'flowLab.presets.deepWork.desc', icon: '🎯', color: 'from-blue-500 to-indigo-600', environment: { musicType: 'focus' as const, noiseLevel: 'silent' as const } },
    { nameKey: 'flowLab.presets.creativeFlow.name', duration: 60, descKey: 'flowLab.presets.creativeFlow.desc', icon: '⚡', color: 'from-purple-500 to-pink-500', environment: { musicType: 'ambient' as const, noiseLevel: 'minimal' as const } },
    { nameKey: 'flowLab.presets.learningSprint.name', duration: 45, descKey: 'flowLab.presets.learningSprint.desc', icon: '📚', color: 'from-green-500 to-emerald-500', environment: { musicType: 'binaural' as const, noiseLevel: 'silent' as const } },
    { nameKey: 'flowLab.presets.powerHour.name', duration: 60, descKey: 'flowLab.presets.powerHour.desc', icon: '🚀', color: 'from-orange-500 to-red-500', environment: { musicType: 'focus' as const, noiseLevel: 'minimal' as const } }
  ];

  useEffect(() => {
    if (sessionMode === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionMode, timeRemaining]);

  const startSession = (preset?: any) => {
    if (preset) {
      setTimeRemaining(preset.duration * 60);
      setEnvironment(prev => ({ ...prev, ...preset.environment }));
    }
    sessionStartRef.current = new Date();
    setSessionMode('active');
    setDistractionCount(0);
    const newSession: FlowSession = { id: Date.now().toString(), startTime: new Date().toISOString(), endTime: '', duration: 0, focusQuality: 0, distractionCount: 0, taskCompleted: selectedTask, flowRating: 0, environment: { ...environment } };
    setCurrentSession(newSession);
  };

  const completeSession = () => {
    if (!currentSession || !sessionStartRef.current) return;
    const endTime = new Date();
    const actualDuration = Math.round((endTime.getTime() - sessionStartRef.current.getTime()) / 60000);
    const completedSession: FlowSession = { ...currentSession, endTime: endTime.toISOString(), duration: actualDuration, distractionCount };
    setCurrentSession(completedSession);
    setSessionMode('complete');
  };

  const togglePause = () => setSessionMode(prev => prev === 'active' ? 'break' : 'active');
  const recordDistraction = () => setDistractionCount(prev => prev + 1);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptimalFlowScore = () => {
    if (!checkin) return 7;
    let score = (checkin.energia + checkin.clareza + checkin.momentum) / 3;
    if (environment.distractionsBlocked) score += 0.5;
    if (environment.musicType !== 'none') score += 0.3;
    if (environment.noiseLevel === 'silent') score += 0.2;
    return Math.min(10, score);
  };

  if (sessionMode === 'setup') {
    const availableTasks = tasks.filter(t => t.status !== 'Concluído');
    return (
      <div className="p-8 text-white w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">{t('flowLab.title')}</h1>
          <p className="text-gray-400 mt-2">{t('flowLab.subtitle')}</p>
        </header>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>🎯</span> {t('flowLab.readiness.title')}</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center"><div className="text-2xl font-bold text-blue-400">{checkin?.energia || 'N/A'}/10</div><div className="text-sm text-gray-400">{t('flowLab.readiness.energy')}</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-purple-400">{checkin?.clareza || 'N/A'}/10</div><div className="text-sm text-gray-400">{t('flowLab.readiness.clarity')}</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-400">{checkin?.momentum || 'N/A'}/10</div><div className="text-sm text-gray-400">{t('flowLab.readiness.momentum')}</div></div>
          </div>
          <div className="text-center"><div className="text-xl font-bold text-orange-400">{getOptimalFlowScore().toFixed(1)}/10</div><div className="text-sm text-gray-400">{t('flowLab.readiness.potential')}</div></div>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{t('flowLab.chooseProtocol')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flowPresets.map(preset => <FlowPresetCard key={preset.nameKey} preset={preset} onSelect={() => startSession(preset)} currentEnergy={checkin?.energia || 7} />)}
          </div>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">{t('flowLab.custom.title')}</h3>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.custom.focusTask')}</label>
            <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500">
              <option value="">{t('flowLab.custom.selectTask')}</option>
              {availableTasks.map(task => <option key={task.id} value={task.content}>{task.content} {task.isMIT ? '⭐' : ''}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.custom.duration')}: {Math.round(timeRemaining / 60)} {t('flowLab.minutes')}</label>
            <input type="range" min="15" max="180" step="15" value={Math.round(timeRemaining / 60)} onChange={(e) => setTimeRemaining(parseInt(e.target.value) * 60)} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>15min</span><span>90min</span><span>180min</span></div>
          </div>
          <EnvironmentControls environment={environment} onChange={setEnvironment} />
          <button onClick={() => startSession()} disabled={!selectedTask} className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-4">{t('flowLab.enterFlow')}</button>
        </div>
        {sessionHistory.length > 0 && (
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">{t('flowLab.recentSessions')}</h3>
            <div className="space-y-3">
              {sessionHistory.slice(0, 5).map(session => <SessionHistoryCard key={session.id} session={session} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (sessionMode === 'active' || sessionMode === 'break') {
    return (
      <div className="p-8 text-white w-full h-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-4 ${sessionMode === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{formatTime(timeRemaining)}</div>
          <div className="text-xl text-gray-400 mb-2">{sessionMode === 'active' ? t('flowLab.active.title') : t('flowLab.break.title')}</div>
          <div className="text-gray-500">{t('flowLab.active.task')}: {selectedTask}</div>
        </div>
        <div className="relative mb-8">
          <div className={`w-32 h-32 rounded-full border-4 ${sessionMode === 'active' ? 'border-green-400 animate-pulse' : 'border-yellow-400'} flex items-center justify-center`}>
            <div className={`w-24 h-24 rounded-full ${sessionMode === 'active' ? 'bg-green-400/20' : 'bg-yellow-400/20'} flex items-center justify-center`}><span className="text-2xl">{sessionMode === 'active' ? '🎯' : '⏸️'}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center"><div className="text-2xl font-bold text-blue-400">{distractionCount}</div><div className="text-sm text-gray-400">{t('flowLab.active.distractions')}</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-purple-400">{currentSession ? Math.round((Date.now() - new Date(currentSession.startTime).getTime()) / 60000) : 0}</div><div className="text-sm text-gray-400">{t('flowLab.active.elapsed')}</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-green-400">{Math.max(0, Math.round(((timeRemaining / 60) / 90) * 100))}%</div><div className="text-sm text-gray-400">{t('flowLab.active.progress')}</div></div>
        </div>
        <div className="flex gap-4">
          <button onClick={togglePause} className={`px-6 py-3 rounded-lg font-bold ${sessionMode === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>{sessionMode === 'active' ? '⏸️ '+t('flowLab.active.pause') : '▶️ '+t('flowLab.active.resume')}</button>
          <button onClick={recordDistraction} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold">📱 {t('flowLab.active.distraction')}</button>
          <button onClick={completeSession} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold">✅ {t('flowLab.active.complete')}</button>
        </div>
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 text-center">{t('flowLab.active.environment')}: {environment.musicType} music • {environment.noiseLevel} noise • {environment.distractionsBlocked ? t('flowLab.active.distractionsBlocked') : t('flowLab.active.distractionsAllowed')}</div>
        </div>
      </div>
    );
  }

  if (sessionMode === 'complete' && currentSession) {
    return <SessionCompletionView session={currentSession} onSave={(updatedSession, earnedXp) => { onSessionSave(updatedSession, earnedXp); setSessionMode('setup'); setCurrentSession(null); }} onDiscard={() => { setSessionMode('setup'); setCurrentSession(null); }} />;
  }

  return null;
};

export default FlowLab;
