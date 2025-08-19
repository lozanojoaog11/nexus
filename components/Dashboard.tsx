

import React, { useMemo } from 'react';
import { DailyCheckin, Habit, Task, Goal } from '../types';
import { useTranslation } from '../hooks/useTranslation';

// --- TYPES ---
interface NeuralPanelData {
  id: 'cognitive' | 'physical' | 'emotional' | 'social';
  dimension: string;
  currentScore: number; // 0-100
  weeklyTrend: number; // -100 to +100
  streakDays: number;
  nextMilestone: string;
  color: string; // gradient colors
}

interface DashboardProps {
  checkin: DailyCheckin | null;
  hasCheckedInToday: boolean;
  onStartCheckin: () => void;
  habits: Habit[];
  goals: Goal[];
  tasks: Task[];
  yesterdaysIncompleteKeystoneHabits: number;
}

// --- HELPER FUNCTIONS ---
const calculateCognitiveScore = (habits: Habit[], tasks: Task[], checkin: DailyCheckin | null): number => {
  let score = 0;
  
  // Sleep quality impact (from checkin)
  if (checkin?.energia) {
      if (checkin.energia >= 8) score += 25;
      else if (checkin.energia >= 6) score += 15;
      else score += 5;
  }
  
  // Cognitive habits completion
  const cognitiveHabits = habits.filter(h => h.category === 'Mente');
  if (cognitiveHabits.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const completedToday = cognitiveHabits.filter(h => 
          (h.history || []).some(entry => entry.date === todayStr && entry.completed)
      ).length;
      score += (completedToday / cognitiveHabits.length) * 35;
  }
  
  // Task completion impact
  const completedTasks = tasks.filter(t => t.status === 'Concluído');
  score += Math.min(completedTasks.length * 10, 40);
  
  return Math.round(Math.min(score, 100));
};

const calculatePhysicalScore = (habits: Habit[], checkin: DailyCheckin | null): number => {
    let score = 0;
    // Energy level from checkin
    if (checkin?.energia) {
        score += (checkin.energia / 10) * 40;
    }

    // Physical habits completion
    const physicalHabits = habits.filter(h => h.category === 'Corpo');
    if (physicalHabits.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedToday = physicalHabits.filter(h =>
            (h.history || []).some(entry => entry.date === todayStr && entry.completed)
        ).length;
        score += (completedToday / physicalHabits.length) * 60;
    }
    return Math.round(Math.min(score, 100));
}

const calculateBaseNeuralEfficiency = (panels: NeuralPanelData[]): number => {
    if (panels.length === 0) return 0;
    const totalScore = panels.reduce((sum, panel) => sum + panel.currentScore, 0);
    return Math.round(totalScore / panels.length);
};

const calculateWeeklyTrend = (dimension: 'cognitive' | 'physical' | 'emotional' | 'social'): number => {
  // Placeholder logic
  return Math.floor(Math.random() * 10) - 2; // -2 to +7
};

const calculateStreakDays = (dimension: 'cognitive' | 'physical' | 'emotional' | 'social'): number => {
  // Placeholder logic
  return Math.floor(Math.random() * 15) + 1; // 1-15 days
};


// --- SUB-COMPONENTS ---
const NeuralPanel: React.FC<{panel: NeuralPanelData}> = ({ panel }) => {
    const { t } = useTranslation();
    const colorParts = panel.color.split(' ');
    const fromColorClass = colorParts[0] || 'from-gray-500';

    const fromColorName = fromColorClass.substring(5, fromColorClass.lastIndexOf('-'));
    
    const strokeColor = {
        blue: '#3B82F6',
        green: '#22C55E',
        yellow: '#F59E0B',
        rose: '#F43F5E',
    }[fromColorName] || '#9CA3AF';

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-white/10 shadow-lg shadow-black/30`}>
            <div className="absolute inset-0 opacity-10 blur-xl">
            <div className={`w-full h-full bg-gradient-to-br ${panel.color}`}></div>
            </div>
            
            <div className="relative z-10 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700/50"/>
                    <circle cx="32" cy="32" r="28" stroke={strokeColor} strokeWidth="4" fill="transparent" 
                            strokeDasharray={`${2 * Math.PI * 28}`} 
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - panel.currentScore / 100)}`}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{panel.currentScore}</span>
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg">{panel.dimension}</h3>
                <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-bold ${panel.weeklyTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {panel.weeklyTrend >= 0 ? '↗' : '↘'} {Math.abs(panel.weeklyTrend)}%
                </span>
                <span className="text-gray-500 text-xs">{t('dashboard.weeklyTrend')}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1 truncate" title={panel.nextMilestone}>{t('dashboard.nextMilestone')} {panel.nextMilestone}</p>
            </div>
            
            <div className="text-center bg-white/5 p-2 rounded-md">
                <div className="text-orange-400 font-bold text-lg">{panel.streakDays}</div>
                <div className="text-gray-400 text-xs leading-none">{t('dashboard.streakDays')}</div>
            </div>
            </div>
        </div>
    );
};

const NeuralEfficiencyScore: React.FC<{score: number; penaltyApplied: boolean}> = ({ score, penaltyApplied }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-tr from-[#121212] via-gray-900 to-black p-6 rounded-2xl border border-purple-500/20 shadow-2xl shadow-black/50">
      <div className="text-center">
        <h2 className="text-gray-400 text-sm mb-2 font-medium tracking-widest uppercase">{t('dashboard.neuralEfficiency')}</h2>
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-subtle-glow">
          {score}
        </div>
        <p className="text-gray-500 text-sm mt-2">{t('dashboard.progressProtocol')}</p>
        {penaltyApplied && (
            <p className="text-yellow-500 text-xs mt-2 animate-pulse">{t('dashboard.efficiencyPenalty')}</p>
        )}
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC<DashboardProps> = ({ checkin, hasCheckedInToday, onStartCheckin, habits, goals, tasks, yesterdaysIncompleteKeystoneHabits }) => {
    const { t } = useTranslation();
    
    const neuralDimensions = useMemo<NeuralPanelData[]>(() => {
        const cognitiveMilestone = goals.find(g => g.name.toLowerCase().includes('curso'))?.name || t('dashboard.milestone.cognitive');
        return [
            {
                id: 'cognitive',
                dimension: t('dashboard.cognitive'),
                currentScore: calculateCognitiveScore(habits, tasks, checkin),
                weeklyTrend: calculateWeeklyTrend('cognitive'),
                streakDays: calculateStreakDays('cognitive'),
                nextMilestone: cognitiveMilestone,
                color: 'from-blue-500 to-purple-600'
            },
            {
                id: 'physical',
                dimension: t('dashboard.physical'),
                currentScore: calculatePhysicalScore(habits, checkin),
                weeklyTrend: calculateWeeklyTrend('physical'),
                streakDays: calculateStreakDays('physical'),
                nextMilestone: t('dashboard.milestone.physical'),
                color: 'from-green-500 to-teal-500'
            },
            {
                id: 'emotional',
                dimension: t('dashboard.emotional'),
                currentScore: 78, // Placeholder score
                weeklyTrend: calculateWeeklyTrend('emotional'),
                streakDays: calculateStreakDays('emotional'),
                nextMilestone: t('dashboard.milestone.emotional'),
                color: 'from-yellow-500 to-orange-500'
            },
            {
                id: 'social',
                dimension: t('dashboard.social'),
                currentScore: 65, // Placeholder score
                weeklyTrend: calculateWeeklyTrend('social'),
                streakDays: calculateStreakDays('social'),
                nextMilestone: t('dashboard.milestone.social'),
                color: 'from-rose-500 to-pink-600'
            },
        ];
    }, [habits, tasks, checkin, goals, t]);
    
    const neuralEfficiency = useMemo(() => {
        const baseScore = calculateBaseNeuralEfficiency(neuralDimensions);
        const penaltyMultiplier = 1 - (yesterdaysIncompleteKeystoneHabits * 0.05);
        return Math.round(baseScore * penaltyMultiplier);
    }, [neuralDimensions, yesterdaysIncompleteKeystoneHabits]);

    const { completedHabitsToday, focusMinutesToday, learningPointsToday } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(h => (h.history || []).some(e => e.date === todayStr && e.completed));
        
        const deepWorkHabit = completedToday.find(h => h.name.toLowerCase().includes('deep work'));
        const readingHabit = completedToday.find(h => h.name.toLowerCase().includes('leitura'));

        return {
            completedHabitsToday: completedToday.length,
            focusMinutesToday: deepWorkHabit ? 90 : 0, // Assuming 90 mins from initial data
            learningPointsToday: readingHabit ? 15 : 0, // Assuming 15 mins/points from initial data
        };
    }, [habits]);

    if (!hasCheckedInToday) {
        return (
            <div className="p-8 text-white w-full h-full flex flex-col items-center justify-center animate-fade-in-up">
                <div className="text-center p-12 bg-[#1C1C1C] rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white">{t('dashboard.checkinPromptTitle')}</h2>
                    <p className="text-gray-400 mt-2 mb-6">{t('dashboard.checkinPromptSubtitle')}</p>
                    <button onClick={onStartCheckin} className="bg-[#00A9FF] text-black font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 animate-subtle-glow">
                        {t('dashboard.startCheckin')}
                    </button>
                </div>
            </div>
        );
    }
  
    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto animate-fade-in-up">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {t('dashboard.title')}
                </h1>
                <p className="text-gray-400">{t('dashboard.subtitle')}</p>
            </header>

            <div className="mb-8">
                <NeuralEfficiencyScore score={neuralEfficiency} penaltyApplied={yesterdaysIncompleteKeystoneHabits > 0}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {neuralDimensions.map(panel => (
                    <NeuralPanel key={panel.id} panel={panel} />
                ))}
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">{t('dashboard.neuralActivity')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center bg-black/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400">{completedHabitsToday}</div>
                        <div className="text-gray-400 text-sm mt-1">{t('dashboard.protocolsActive')}</div>
                    </div>
                    <div className="text-center bg-black/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-400">{focusMinutesToday}</div>
                        <div className="text-gray-400 text-sm mt-1">{t('dashboard.deepWorkMin')}</div>
                    </div>
                    <div className="text-center bg-black/30 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-purple-400">{learningPointsToday}</div>
                        <div className="text-gray-400 text-sm mt-1">{t('dashboard.learningXP')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;