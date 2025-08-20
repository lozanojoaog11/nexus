import React, { useState, useMemo, useEffect } from 'react';
import { View, Habit, Project, Task, Book, DevelopmentGraph, CalendarEvent, Goal, DevelopmentNode, DailyCheckin, FlowSession, CognitiveSession, BiohackingMetrics, Achievement, UserLevel, StreakData, DevelopmentEdge } from './types';
import useDatabase from './hooks/useDatabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import NeuralArchitectAI from './components/NeuralArchitectAI';
import Library from './components/Library';
import NeuralAlignmentModal from './components/NeuralAlignmentModal';
import Development from './components/Development';
import Habits from './components/Habits';
import AddHabitModal from './components/AddHabitModal';
import AddProjectModal from './components/AddProjectModal';
import Agenda from './components/Agenda';
import Goals from './components/Goals';
import GoalModal from './components/GoalModal';
import DevelopmentAreaModal from './components/DevelopmentAreaModal';
import BookModal from './components/BookModal';
import Login from './components/Login';
import CognitiveTraining from './components/CognitiveTraining';
import FlowLab from './components/FlowLab';
import BiohackingSuite from './components/BiohackingSuite';
import AchievementConstellation from './components/AchievementConstellation';
import NeuralAnalytics from './components/NeuralAnalytics';
import TodayView from './components/TodayView';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { calculateDateStreak } from './utils/streak';
import OnboardingView from './components/OnboardingView';

const AppModals: React.FC<{
    projects: Project[];
    developmentGraph: DevelopmentGraph;
    saveGoal: (goal: Goal) => Promise<void>;
    saveDevelopmentNode: (node: DevelopmentNode) => Promise<string | null>;
    saveBook: (book: Book) => Promise<void>;
    addHabit: (name: string, category: "Corpo" | "Mente" | "Execução", frequency: number) => Promise<void>;
    addProject: (name: string) => Promise<string | null>;
}> = ({ projects, developmentGraph, saveGoal, saveDevelopmentNode, saveBook, addHabit, addProject }) => {
    const { state, close } = useUI();

    return (
        <>
            {state.openModal === 'addHabit' && <AddHabitModal onClose={close} onAdd={addHabit} />}
            {state.openModal === 'addProject' && <AddProjectModal onClose={close} onAdd={addProject} />}
            {state.openModal === 'goal' && (
                <GoalModal 
                    onSave={saveGoal} 
                    developmentNodes={developmentGraph.nodes} 
                    projects={projects} 
                />
            )}
            {state.openModal === 'developmentArea' && (
                <DevelopmentAreaModal 
                    onSave={saveDevelopmentNode} 
                />
            )}
            {state.openModal === 'book' && (
                <BookModal 
                    onSave={saveBook} 
                    developmentNodes={developmentGraph.nodes} 
                />
            )}
        </>
    );
};


const MainApp: React.FC = () => {
  const { t, language } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const {
    loading,
    profile,
    isAuthenticated, isAuthReady,
    signIn, signUp, signOut, signInAnonymously,
    dailyCheckin, allDailyCheckins, handleCheckinConfirm,
    completeStandardOnboarding,
    performAtomicOnboarding,
    habits, addHabit, deleteHabit, toggleHabitCompletion, addXp,
    yesterdaysIncompleteKeystoneHabits,
    projects, addProject, deleteProject, selectedProjectId, setSelectedProjectId,
    tasks, addTask, updateTask, updateTaskStatus,
    books, saveBook, deleteBook, addNoteToBook, updateNote, deleteNote,
    backlinks,
    developmentGraph, saveDevelopmentNode, deleteDevelopmentNode, saveDevelopmentEdge,
    agendaEvents,
    goals, saveGoal, deleteGoal,
    flowSessions, saveFlowSession,
    cognitiveSessions, saveCognitiveSession,
    biohackingMetrics, saveBiohackingMetrics
  } = useDatabase(language, t('userManifesto'));

  const [showCheckin, setShowCheckin] = useState(false);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState(false);

  const allTasks = useMemo(() => projects.flatMap(p => p.tasks), [projects]);

  // --- Achievement Calculation Logic (Centralized) ---
  const evolutionTitles = useMemo(() => [
    { level: 1, title: t('achievements.levels.1.title'), stage: t('achievements.levels.1.stage') }, { level: 5, title: t('achievements.levels.5.title'), stage: t('achievements.levels.5.stage') }, { level: 10, title: t('achievements.levels.10.title'), stage: t('achievements.levels.10.stage') }, { level: 15, title: t('achievements.levels.15.title'), stage: t('achievements.levels.15.stage') }, { level: 20, title: t('achievements.levels.20.title'), stage: t('achievements.levels.20.stage') }, { level: 25, title: t('achievements.levels.25.title'), stage: t('achievements.levels.25.stage') }, { level: 30, title: t('achievements.levels.30.title'), stage: t('achievements.levels.30.stage') }, { level: 40, title: t('achievements.levels.40.title'), stage: t('achievements.levels.40.stage') }, { level: 50, title: t('achievements.levels.50.title'), stage: t('achievements.levels.50.stage') }
  ], [t]);

  const achievementDefinitions = useMemo((): Omit<Achievement, 'progress' | 'unlockedAt'>[] => [
    { id: 'first_flow', name: t('achievements.defs.first_flow.name'), description: t('achievements.defs.first_flow.desc'), category: 'cognitive', tier: 'bronze', icon: '🎯', xpReward: 50, maxProgress: 1, requirements: [{ type: 'flow_sessions', target: 1 }], scientificBasis: t('achievements.defs.first_flow.science') }, { id: 'flow_master', name: t('achievements.defs.flow_master.name'), description: t('achievements.defs.flow_master.desc'), category: 'cognitive', tier: 'gold', icon: '🌊', xpReward: 500, maxProgress: 50, requirements: [{ type: 'flow_sessions', target: 50 }], scientificBasis: t('achievements.defs.flow_master.science') }, { id: 'cognitive_breakthrough', name: t('achievements.defs.cognitive_breakthrough.name'), description: t('achievements.defs.cognitive_breakthrough.desc'), category: 'cognitive', tier: 'platinum', icon: '🧠', xpReward: 750, maxProgress: 1, requirements: [{ type: 'cognitive_score', target: 90, metric: 'dual_n_back_4' }], scientificBasis: t('achievements.defs.cognitive_breakthrough.science') }, { id: 'sleep_champion', name: t('achievements.defs.sleep_champion.name'), description: t('achievements.defs.sleep_champion.desc'), category: 'physical', tier: 'gold', icon: '😴', xpReward: 400, maxProgress: 30, requirements: [{ type: 'sleep_quality', target: 8, timeframe: 'daily' }], scientificBasis: t('achievements.defs.sleep_champion.science') }, { id: 'habit_architect', name: t('achievements.defs.habit_architect.name'), description: t('achievements.defs.habit_architect.desc'), category: 'mastery', tier: 'diamond', icon: '⚙️', xpReward: 1000, maxProgress: 90, requirements: [{ type: 'habit_streak', target: 90, timeframe: 'daily' }], scientificBasis: t('achievements.defs.habit_architect.science') }, { id: 'consistency_king', name: t('achievements.defs.consistency_king.name'), description: t('achievements.defs.consistency_king.desc'), category: 'mastery', tier: 'diamond', icon: '👑', xpReward: 2000, maxProgress: 365, requirements: [{ type: 'consistency', target: 365, timeframe: 'daily' }], scientificBasis: t('achievements.defs.consistency_king.science') },
  ], [t]);

  const achievements = useMemo(() => {
    return achievementDefinitions.map(definition => {
      let progress = 0;
      definition.requirements.forEach(req => {
        switch (req.type) {
          case 'flow_sessions': progress = Math.min(flowSessions.length, definition.maxProgress); break;
          case 'cognitive_score': if (req.metric === 'dual_n_back_4') { const s = cognitiveSessions.filter(s => s.type === 'dual-n-back' && s.level >= 4 && s.score >= req.target); progress = s.length > 0 ? 1 : 0; } break;
          case 'sleep_quality': const recent = biohackingMetrics.slice(-30); const q = recent.filter(d => d.sleep.quality >= req.target); progress = Math.min(q.length, definition.maxProgress); break;
          case 'task_completion': const c = allTasks.filter(t => t.status === 'Concluído'); progress = Math.min(c.length, definition.maxProgress); break;
          case 'habit_streak': progress = Math.min(Math.max(0, ...habits.map(h => h.currentStreak || 0)), definition.maxProgress); break;
          case 'consistency': 
            const checkinDates = new Set(allDailyCheckins.map(c => c.date));
            const keystoneHabitDates = new Set(
                habits.filter(h => h.isKeystone)
                      .flatMap(h => h.history)
                      .filter(entry => entry.completed)
                      .map(entry => entry.date)
            );
            const consistentDays = [...checkinDates].filter(date => keystoneHabitDates.has(date));
            const consistencyStreak = calculateDateStreak(consistentDays);
            progress = Math.min(consistencyStreak, definition.maxProgress);
            break;
        }
      });
      const isUnlocked = progress >= definition.maxProgress;
      return { ...definition, progress, unlockedAt: isUnlocked ? new Date().toISOString() : undefined };
    });
  }, [achievementDefinitions, allTasks, flowSessions, cognitiveSessions, biohackingMetrics, habits, allDailyCheckins]);
  
  const prevAchievementsRef = React.useRef<Achievement[]>([]);
  useEffect(() => {
    const newlyUnlocked = achievements.filter(current => {
        const prev = prevAchievementsRef.current.find(p => p.id === current.id);
        return current.unlockedAt && !prev?.unlockedAt;
    });

    if (newlyUnlocked.length > 0) {
        const xpFromAchievements = newlyUnlocked.reduce((sum, ach) => sum + ach.xpReward, 0);
        addXp(xpFromAchievements);
    }

    prevAchievementsRef.current = achievements;
  }, [achievements, addXp]);


  const userLevel = useMemo(() => {
    const totalXP = profile?.totalXp || 0;
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const currentXP = totalXP - xpForCurrentLevel;
    const xpToNextLevel = xpForNextLevel - xpForCurrentLevel;
    const levelData = evolutionTitles.reduce((prev, curr) => currentLevel >= curr.level ? curr : prev, evolutionTitles[0]);
    return { currentLevel, currentXP, xpToNextLevel: xpToNextLevel, totalXP, title: levelData.title, evolutionStage: levelData.stage, capabilities: [] };
  }, [profile, evolutionTitles]);
  
  const activeStreaks = useMemo((): StreakData[] => {
    const checkinStreak = calculateDateStreak(allDailyCheckins.map(c => c.date));
    const habitStreak = Math.max(0, ...habits.map(h => h.currentStreak || 0));
    const flowStreak = calculateDateStreak(flowSessions.map(s => s.startTime.split('T')[0]));
    
    return [
      { type: t('achievements.streaks.checkin'), count: checkinStreak, bestStreak: 0, lastUpdate: new Date().toISOString() }, // bestStreak needs DB support
      { type: t('achievements.streaks.habits'), count: habitStreak, bestStreak: Math.max(0, ...habits.map(h => h.bestStreak || 0)), lastUpdate: new Date().toISOString() },
      { type: t('achievements.streaks.flow'), count: flowStreak, bestStreak: 0, lastUpdate: new Date().toISOString() } // bestStreak needs DB support
    ];
  }, [allDailyCheckins, habits, flowSessions, t]);

  // --- End of Achievement Logic ---
  
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = !!dailyCheckin && dailyCheckin.date === today;

  const onCheckinConfirm = async (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp' | 'activeStrategy'>) => {
    setIsProcessingCheckin(true);
    await handleCheckinConfirm(checkinData);
    setIsProcessingCheckin(false);
    setShowCheckin(false);
  };

  const renderView = () => {
      
    switch (currentView) {
      case 'dashboard': return <Dashboard checkin={dailyCheckin} hasCheckedInToday={hasCheckedInToday} onStartCheckin={() => setShowCheckin(true)} habits={habits} goals={goals} tasks={allTasks} yesterdaysIncompleteKeystoneHabits={yesterdaysIncompleteKeystoneHabits} allDailyCheckins={allDailyCheckins} biohackingMetrics={biohackingMetrics} activeStreaks={activeStreaks} />;
      case 'today': return <TodayView 
                                dailyCheckin={dailyCheckin}
                                tasks={allTasks}
                                habits={habits}
                                agendaEvents={agendaEvents}
                                updateTaskStatus={updateTaskStatus}
                                toggleHabitCompletion={toggleHabitCompletion}
                                setCurrentView={setCurrentView}
                            />;
      case 'habits': return <Habits habits={habits} toggleHabitCompletion={toggleHabitCompletion} onDeleteHabit={deleteHabit} />;
      case 'projects': return <KanbanBoard projects={projects} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} updateTaskStatus={updateTaskStatus} updateTask={updateTask} addTask={addTask} deleteProject={deleteProject} developmentNodes={developmentGraph.nodes} />;
      case 'goals': return <Goals goals={goals} onDeleteGoal={deleteGoal} />;
      case 'agenda': return <Agenda events={agendaEvents} tasks={allTasks} goals={goals} />;
      case 'development': return <Development graph={developmentGraph} goals={goals} tasks={allTasks} books={books} onDeleteNode={deleteDevelopmentNode}  />;
      case 'cognitive': return <CognitiveTraining sessions={cognitiveSessions} onSessionComplete={saveCognitiveSession} />;
      case 'flowlab': return <FlowLab tasks={allTasks} checkin={dailyCheckin} sessionHistory={flowSessions} onSessionSave={saveFlowSession} />;
      case 'biohacking': return <BiohackingSuite checkin={dailyCheckin} habits={habits} metricsHistory={biohackingMetrics} onMetricsSave={saveBiohackingMetrics} />;
      case 'achievements': return <AchievementConstellation achievements={achievements} userLevel={userLevel} activeStreaks={activeStreaks} totalXP={profile?.totalXp || 0} />;
      case 'analytics': return <NeuralAnalytics checkins={allDailyCheckins} habits={habits} tasks={allTasks} goals={goals} flowSessions={flowSessions} cognitiveSessions={cognitiveSessions} biohackingData={biohackingMetrics} achievements={achievements} />;
      case 'guardian': return <NeuralArchitectAI profile={profile} checkin={dailyCheckin} habits={habits} goals={goals} tasks={allTasks} developmentNodes={developmentGraph.nodes} />;
      case 'library': return <Library books={books} backlinks={backlinks} addNoteToBook={addNoteToBook} onDeleteBook={deleteBook} onUpdateNote={updateNote} onDeleteNote={deleteNote} />;
      default: return <Dashboard checkin={dailyCheckin} hasCheckedInToday={hasCheckedInToday} onStartCheckin={() => setShowCheckin(true)} habits={habits} goals={goals} tasks={allTasks} yesterdaysIncompleteKeystoneHabits={yesterdaysIncompleteKeystoneHabits} allDailyCheckins={allDailyCheckins} biohackingMetrics={biohackingMetrics} activeStreaks={activeStreaks} />;
    }
  };

  if (!isAuthReady || (isAuthenticated && loading)) {
    return (
        <div className="flex h-screen w-screen bg-black/10 items-center justify-center">
             <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-[#00A9FF] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400 mt-4">{!isAuthReady ? t('loading.auth') : t('loading.syncing')}</p>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
      return <Login onSignIn={signIn} onSignUp={signUp} onSignInAnonymously={signInAnonymously} />;
  }
  
  if (isAuthenticated && profile && profile.onboardingCompleted === false) {
    return (
      <OnboardingView 
        onOnboardingComplete={completeStandardOnboarding}
        performAtomicOnboarding={performAtomicOnboarding}
        profile={profile}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen text-white">
      {showCheckin && <NeuralAlignmentModal onConfirm={onCheckinConfirm} isProcessing={isProcessingCheckin}/>}
      
      <AppModals 
        projects={projects}
        developmentGraph={developmentGraph}
        saveGoal={saveGoal}
        saveDevelopmentNode={saveDevelopmentNode}
        saveBook={saveBook}
        addHabit={addHabit}
        addProject={addProject}
      />

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onSignOut={signOut} />
      <main className="flex-1 bg-black/10">
        {renderView()}
      </main>
    </div>
  );
}

const App: React.FC = () => (
  <LanguageProvider>
    <UIProvider>
      <MainApp />
    </UIProvider>
  </LanguageProvider>
);

export default App;