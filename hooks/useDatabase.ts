import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/firebase';
import { generateDailyDirective } from '../services/geminiService';
import { Habit, Task, Project, Book, BookNote, Goal, Milestone, DevelopmentGraph, DailyCheckin, TaskStatus, DevelopmentNode, FlowSession, CognitiveSession, BiohackingMetrics } from '../types';

interface AppState {
  dailyCheckins: Record<string, DailyCheckin>;
  habits: Record<string, Habit>;
  tasks: Record<string, Task>;
  projects: Record<string, Project>;
  books: Record<string, Book>;
  bookNotes: Record<string, Record<string, BookNote>>;
  goals: Record<string, Goal>;
  milestones: Record<string, Record<string, Milestone>>;
  developmentGraph: DevelopmentGraph;
  agendaEvents: Record<string, any>; // Simplified for now
  flowSessions: Record<string, FlowSession>;
  cognitiveSessions: Record<string, CognitiveSession>;
  biohackingMetrics: Record<string, BiohackingMetrics>;
}

const initialState: AppState = {
  dailyCheckins: {},
  habits: {},
  tasks: {},
  projects: {},
  books: {},
  bookNotes: {},
  goals: {},
  milestones: {},
  developmentGraph: { nodes: [], edges: [] },
  agendaEvents: {},
  flowSessions: {},
  cognitiveSessions: {},
  biohackingMetrics: {},
};

const calculateCurrentStreak = (history: { date: string, completed: boolean }[]) => {
    let streak = 0;
    const sortedHistory = [...(history || [])]
      .filter(h => h.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedHistory.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Adjust for timezone when parsing date strings
    const lastCompletionDate = new Date(sortedHistory[0].date + 'T12:00:00Z');
    const lastCompletionStr = lastCompletionDate.toISOString().split('T')[0];
    
    if(lastCompletionStr !== todayStr && lastCompletionStr !== yesterdayStr) return 0;

    streak = 1;
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i].date + 'T12:00:00Z');
      const next = new Date(sortedHistory[i+1].date + 'T12:00:00Z');
      const diff = (current.getTime() - next.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
};

export default function useDatabase(language: string, userManifesto: string) {
  const [data, setData] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // --- Auth Effect ---
  useEffect(() => {
    const unsubscribe = dataService.onAuthStateChange(newUser => {
      setUser(newUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Loading Effect ---
  useEffect(() => {
    if (!user) {
        setData(initialState);
        setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribe = dataService.onDataChange('/', (allUserData: any) => {
      setData({
        dailyCheckins: allUserData?.dailyCheckins || {},
        habits: allUserData?.habits || {},
        tasks: allUserData?.tasks || {},
        projects: allUserData?.projects || {},
        books: allUserData?.library || {},
        bookNotes: allUserData?.bookNotes || {},
        goals: allUserData?.goals || {},
        milestones: allUserData?.milestones || {},
        developmentGraph: allUserData?.developmentGraph || { nodes: {}, edges: {} },
        agendaEvents: allUserData?.calendarEvents || {},
        flowSessions: allUserData?.flowSessions || {},
        cognitiveSessions: allUserData?.cognitiveSessions || {},
        biohackingMetrics: allUserData?.biohackingMetrics || {},
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedProjectId && Object.keys(data.projects).length > 0) {
      setSelectedProjectId(Object.keys(data.projects)[0]);
    } else if (Object.keys(data.projects).length === 0) {
      setSelectedProjectId(null);
    }
  }, [data.projects, selectedProjectId]);
  
  // --- Memoized Data Transformations ---
  const allDailyCheckins = useMemo(() => Object.values(data.dailyCheckins), [data.dailyCheckins]);
  const dailyCheckin = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return allDailyCheckins.find(c => c.date === todayStr) || null;
  }, [allDailyCheckins]);
  
  const habits = useMemo(() => {
    return Object.values(data.habits).map(h => ({
        ...h,
        history: Object.entries(h.history || {}).map(([date, completed]) => ({ date, completed: !!completed })),
        currentStreak: calculateCurrentStreak(Object.entries(h.history || {}).map(([date, completed]) => ({ date, completed: !!completed })))
    }));
  }, [data.habits]);
  
  const projects = useMemo(() => {
      return Object.values(data.projects).map(p => ({
          ...p,
          tasks: Object.values(data.tasks).filter(t => t.projectId === p.id)
      }));
  }, [data.projects, data.tasks]);

  const books = useMemo(() => {
      return Object.values(data.books).map(b => ({
          ...b,
          notes: Object.values(data.bookNotes[b.id] || {})
      }))
  }, [data.books, data.bookNotes]);

  const goals = useMemo(() => {
    return Object.values(data.goals).map(g => ({
        ...g,
        milestones: Object.values(data.milestones[g.id] || {})
    }));
  }, [data.goals, data.milestones]);

  const developmentGraph = useMemo(() => ({
      nodes: Object.values(data.developmentGraph.nodes || {}),
      edges: Object.values(data.developmentGraph.edges || {}),
  }), [data.developmentGraph]);
  
  const agendaEvents = useMemo(() => Object.values(data.agendaEvents), [data.agendaEvents]);

  const flowSessions = useMemo(() => Object.values(data.flowSessions), [data.flowSessions]);
  const cognitiveSessions = useMemo(() => Object.values(data.cognitiveSessions), [data.cognitiveSessions]);
  const biohackingMetrics = useMemo(() => Object.values(data.biohackingMetrics), [data.biohackingMetrics]);

  // --- Auth Handlers ---
  const signIn = (email: string, password: string) => dataService.signInWithEmailAndPassword(email, password);
  const signUp = (email: string, password: string) => dataService.signUpWithEmailAndPassword(email, password);
  const signOut = () => dataService.signOut();
  const signInAnonymously = () => dataService.signInAnonymously();

  // --- Data Handlers ---
  const handleCheckinConfirm = async (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    try {
        const directive = await generateDailyDirective(checkinData, userManifesto, language);
        await dataService.setData(`dailyCheckins/${todayStr}`, { date: todayStr, timestamp: today.toISOString(), ...checkinData, directive });
    } catch (error) {
        console.error("Failed to generate directive:", error);
        await dataService.setData(`dailyCheckins/${todayStr}`, { date: todayStr, timestamp: today.toISOString(), ...checkinData, directive: "Directive unavailable. Focus on the essential." });
    }
  };

  const addHabit = (name: string, category: Habit['category'], frequency: number) => {
    dataService.addToList('habits', { name, category, frequency, bestStreak: 0 });
  };
  
  const deleteHabit = (habitId: string) => {
    dataService.removeData(`habits/${habitId}`);
  };

  const toggleHabitCompletion = async (habitId: string, date: string, isCompleted: boolean) => {
    await dataService.setData(`habits/${habitId}/history/${date}`, !isCompleted);
    // Recalculate and update best streak
    const habitSnap = await dataService.getData(`habits/${habitId}`);
    if (habitSnap) {
        const history = Object.entries(habitSnap.history || {}).map(([date, completed]) => ({date, completed: !!completed}));
        const currentStreak = calculateCurrentStreak(history);
        const bestStreak = Math.max(habitSnap.bestStreak || 0, currentStreak);
        if (bestStreak > (habitSnap.bestStreak || 0)) {
            await dataService.setData(`habits/${habitId}/bestStreak`, bestStreak);
        }
    }
  };

  const addProject = async (name: string) => {
    const newId = await dataService.addToList('projects', { name });
    if(newId) setSelectedProjectId(newId);
  };

  const deleteProject = (projectId: string) => {
      const tasksToDelete = Object.values(data.tasks).filter(t => t.projectId === projectId);
      const updates: Record<string, null> = {};
      tasksToDelete.forEach(t => { updates[`/tasks/${t.id}`] = null; });
      updates[`/projects/${projectId}`] = null;
      dataService.updateData('/', updates);
  };
  
  const addTask = (projectId: string, content: string) => {
    dataService.addToList('tasks', { content, status: 'A Fazer', isMIT: false, projectId });
  };
  
  const updateTask = (projectId: string, updatedTask: Task) => {
    const { id, ...taskData } = updatedTask;
    dataService.setData(`tasks/${id}`, taskData);
  };
  
  const updateTaskStatus = (projectId: string, taskId: string, newStatus: TaskStatus) => {
    dataService.setData(`tasks/${taskId}/status`, newStatus);
  };

  const saveBook = (bookToSave: Book) => {
      const { notes, ...bookData } = bookToSave;
      if (bookData.id) {
          dataService.setData(`library/${bookData.id}`, bookData);
      } else {
          dataService.addToList('library', bookData);
      }
  };
  
  const deleteBook = (bookId: string) => {
      dataService.removeData(`library/${bookId}`);
      dataService.removeData(`bookNotes/${bookId}`);
  };
  
  const addNoteToBook = (bookId: string, noteContent: string) => {
      dataService.addToList(`bookNotes/${bookId}`, { content: noteContent, createdAt: new Date().toISOString() });
  };
  
  const updateNote = (bookId: string, updatedNote: BookNote) => {
      const { id, ...noteData } = updatedNote;
      dataService.setData(`bookNotes/${bookId}/${id}`, noteData);
  };

  const deleteNote = (bookId: string, noteId: string) => {
      dataService.removeData(`bookNotes/${bookId}/${noteId}`);
  };
  
  const saveGoal = (goalToSave: Goal) => {
      const { milestones, ...goalData } = goalToSave;
      if (goalData.id) {
          dataService.setData(`goals/${goalData.id}`, goalData);
          const milestonesUpdate: Record<string, Milestone> = {};
          milestones.forEach(m => { milestonesUpdate[m.id] = m; });
          dataService.setData(`milestones/${goalData.id}`, milestonesUpdate);
      } else {
          const newGoalId = dataService.getNewId('goals');
          if (newGoalId) {
            goalData.id = newGoalId;
            const updates: Record<string, any> = {};
            updates[`/goals/${newGoalId}`] = goalData;
            const milestonesUpdate: Record<string, Milestone> = {};
            milestones.forEach(m => { milestonesUpdate[m.id] = m; });
            updates[`/milestones/${newGoalId}`] = milestonesUpdate;
            dataService.updateData('/', updates);
          }
      }
  };
  
  const deleteGoal = (goalId: string) => {
      dataService.removeData(`goals/${goalId}`);
      dataService.removeData(`milestones/${goalId}`);
  };

  const saveDevelopmentNode = (nodeToSave: DevelopmentNode) => {
      if(nodeToSave.id) {
          dataService.setData(`developmentGraph/nodes/${nodeToSave.id}`, nodeToSave);
      } else {
          dataService.addToList('developmentGraph/nodes', nodeToSave);
      }
  };

  const deleteDevelopmentNode = (nodeId: string) => {
      const updates: Record<string, null> = {};
      updates[`developmentGraph/nodes/${nodeId}`] = null;
      Object.values(data.developmentGraph.edges || {}).forEach(edge => {
          if (edge.source === nodeId || edge.target === nodeId) {
              updates[`developmentGraph/edges/${edge.id}`] = null;
          }
      });
      dataService.updateData('/', updates);
  };
  
  const saveFlowSession = (session: FlowSession) => {
      dataService.setData(`flowSessions/${session.id}`, session);
  };

  const saveCognitiveSession = (session: CognitiveSession) => {
      dataService.setData(`cognitiveSessions/${session.id}`, session);
  };
  
  const saveBiohackingMetrics = (metrics: BiohackingMetrics) => {
      dataService.setData(`biohackingMetrics/${metrics.date}`, metrics);
  };


  return {
    loading,
    isAuthenticated: !!user,
    isAuthReady,
    signIn, signUp, signOut, signInAnonymously,
    dailyCheckin,
    allDailyCheckins,
    handleCheckinConfirm,
    habits, addHabit, deleteHabit, toggleHabitCompletion,
    projects, addProject, deleteProject, selectedProjectId, setSelectedProjectId,
    tasks: data.tasks, addTask, updateTask, updateTaskStatus,
    books, saveBook, deleteBook, addNoteToBook, updateNote, deleteNote,
    developmentGraph, saveDevelopmentNode, deleteDevelopmentNode,
    agendaEvents,
    goals, saveGoal, deleteGoal,
    flowSessions, saveFlowSession,
    cognitiveSessions, saveCognitiveSession,
    biohackingMetrics, saveBiohackingMetrics
  };
}
