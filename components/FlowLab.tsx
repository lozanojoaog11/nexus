
import React, { useState, useEffect, useRef } from 'react';
import { Task, DailyCheckin, FlowSession, EnvironmentSettings } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface FlowLabProps {
  tasks: Task[];
  checkin: DailyCheckin | null;
  sessionHistory: FlowSession[];
  onSessionSave: (session: FlowSession) => void;
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
    return <SessionCompletionView session={currentSession} onSave={(updatedSession) => { onSessionSave(updatedSession); setSessionMode('setup'); setCurrentSession(null); }} onDiscard={() => { setSessionMode('setup'); setCurrentSession(null); }} />;
  }

  return null;
};

// SUB-COMPONENTS
const FlowPresetCard: React.FC<{ preset: any; onSelect: () => void; currentEnergy: number; }> = ({ preset, onSelect, currentEnergy }) => {
  const { t } = useTranslation();
  const compatibility = currentEnergy >= 7 ? t('flowLab.presets.compat.high') : currentEnergy >= 5 ? t('flowLab.presets.compat.medium') : t('flowLab.presets.compat.low');
  const compatibilityColor = currentEnergy >= 7 ? 'text-green-400' : currentEnergy >= 5 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${preset.color} flex items-center justify-center text-2xl`}>{preset.icon}</div>
        <div><h3 className="font-bold">{t(preset.nameKey)}</h3><p className="text-sm text-gray-400">{preset.duration} {t('flowLab.minutes')}</p></div>
      </div>
      <p className="text-sm text-gray-300 mb-4">{t(preset.descKey)}</p>
      <div className="flex justify-between items-center mb-4"><span className="text-xs text-gray-400">{t('flowLab.presets.compatibility')}:</span><span className={`text-xs font-bold ${compatibilityColor}`}>{compatibility}</span></div>
      <button onClick={onSelect} className={`w-full py-2 rounded-lg bg-gradient-to-r ${preset.color} text-white font-medium hover:opacity-90`}>{t('flowLab.presets.startFlow')}</button>
    </div>
  );
};

const EnvironmentControls: React.FC<{ environment: EnvironmentSettings; onChange: (env: EnvironmentSettings) => void; }> = ({ environment, onChange }) => {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.env.musicType')}</label>
            <select value={environment.musicType} onChange={(e) => onChange({...environment, musicType: e.target.value as any})} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600">
                <option value="none">{t('flowLab.env.music.none')}</option><option value="focus">{t('flowLab.env.music.focus')}</option><option value="ambient">{t('flowLab.env.music.ambient')}</option><option value="binaural">{t('flowLab.env.music.binaural')}</option><option value="nature">{t('flowLab.env.music.nature')}</option>
            </select>
            </div>
            <div>
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.env.noiseLevel')}</label>
            <select value={environment.noiseLevel} onChange={(e) => onChange({...environment, noiseLevel: e.target.value as any})} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600">
                <option value="silent">{t('flowLab.env.noise.silent')}</option><option value="minimal">{t('flowLab.env.noise.minimal')}</option><option value="moderate">{t('flowLab.env.noise.moderate')}</option>
            </select>
            </div>
            <div className="col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={environment.distractionsBlocked} onChange={(e) => onChange({...environment, distractionsBlocked: e.target.checked})} className="accent-blue-500" /><span className="text-sm text-gray-300">{t('flowLab.env.blockDistractions')}</span></label>
            </div>
        </div>
    );
};

const SessionHistoryCard: React.FC<{ session: FlowSession }> = ({ session }) => {
    const { t, language } = useTranslation();
    return (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">🎯</div>
            <div>
                <div className="text-white font-medium">{session.taskCompleted || t('flowLab.history.untitled')}</div>
                <div className="text-gray-400 text-sm">{new Date(session.startTime).toLocaleDateString(language)} • {session.duration}{t('flowLab.minutes')}</div>
            </div>
            </div>
            <div className="text-right">
            <div className="text-white font-bold">{session.flowRating}/10</div>
            <div className="text-gray-400 text-xs">{session.distractionCount} {t('flowLab.history.distractions')}</div>
            </div>
        </div>
    );
};

const SessionCompletionView: React.FC<{ session: FlowSession; onSave: (session: FlowSession) => void; onDiscard: () => void; }> = ({ session, onSave, onDiscard }) => {
  const { t } = useTranslation();
  const [flowRating, setFlowRating] = useState(7);
  const [focusQuality, setFocusQuality] = useState(7);
  const [notes, setNotes] = useState('');
  const handleSave = () => { onSave({ ...session, flowRating, focusQuality, notes }); };
  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">{t('flowLab.complete.title')}</h2>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="font-semibold mb-4">{t('flowLab.complete.summary')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>{t('flowLab.complete.duration')}: {session.duration} {t('flowLab.minutes')}</div>
            <div>{t('flowLab.complete.distractions')}: {session.distractionCount}</div>
            <div>{t('flowLab.complete.task')}: {session.taskCompleted}</div>
            <div>{t('flowLab.complete.environment')}: {session.environment.musicType}</div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.flowQuality')}: {flowRating}</label>
            <input type="range" min="1" max="10" value={flowRating} onChange={(e) => setFlowRating(parseInt(e.target.value))} className="w-full accent-purple-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.focusQuality')}: {focusQuality}</label>
            <input type="range" min="1" max="10" value={focusQuality} onChange={(e) => setFocusQuality(parseInt(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('flowLab.complete.notesPlaceholder')} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 rows-3" />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onDiscard} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg">{t('flowLab.complete.discard')}</button>
          <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 py-3 rounded-lg font-bold">{t('flowLab.complete.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default FlowLab;