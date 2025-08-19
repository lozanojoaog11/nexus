import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/firebase';
import { generateDailyDirective } from '../services/geminiService';
import { Habit, Task, Project, Book, BookNote, Goal, Milestone, DevelopmentGraph, DailyCheckin, TaskStatus, DevelopmentNode, FlowSession, CognitiveSession, BiohackingMetrics, UserProfile, DevelopmentEdge } from '../types';
import { calculateCurrentStreak } from '../utils/streak';

interface AppState {
  profile: UserProfile | null;
  dailyCheckins: Record<string, DailyCheckin>;
  habits: Record<string, Omit<Habit, 'history' | 'id'> & { id: string, history?: Record<string, boolean>}>;
  tasks: Record<string, Task>;
  projects: Record<string, Omit<Project, 'tasks' | 'id'> & { id: string }>;
  books: Record<string, Omit<Book, 'notes' | 'id'> & { id: string }>;
  bookNotes: Record<string, Record<string, BookNote>>;
  goals: Record<string, Omit<Goal, 'milestones' | 'id'> & { id: string }>;
  milestones: Record<string, Record<string, Milestone>>;
  developmentGraph: { 
      nodes: Record<string, DevelopmentNode>; 
      edges: Record<string, DevelopmentEdge>;
  };
  agendaEvents: Record<string, any>;
  flowSessions: Record<string, FlowSession>;
  cognitiveSessions: Record<string, CognitiveSession>;
  biohackingMetrics: Record<string, BiohackingMetrics>;
}

const initialState: Omit<AppState, 'profile'> = {
  dailyCheckins: {},
  habits: {},
  tasks: {},
  projects: {},
  books: {},
  bookNotes: {},
  goals: {},
  milestones: {},
  developmentGraph: { nodes: {}, edges: {} },
  agendaEvents: {},
  flowSessions: {},
  cognitiveSessions: {},
  biohackingMetrics: {},
};

export default function useDatabase(language: string, userManifesto: string) {
  const [data, setData] = useState<Omit<AppState, 'profile'>>(initialState);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        setProfile(null);
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
      setProfile(allUserData?.profile || null);
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

  const isAuthenticated = useMemo(() => !!user, [user]);

  const signIn = useCallback((email: string, password: string) => {
    return dataService.signInWithEmailAndPassword(email, password);
  }, []);

  const signUp = useCallback((email: string, password: string) => {
    return dataService.signUpWithEmailAndPassword(email, password);
  }, []);

  const signOut = useCallback(() => {
    return dataService.signOut();
  }, []);

  const signInAnonymously = useCallback(() => {
    return dataService.signInAnonymously();
  }, []);

  const addXp = useCallback(async (amount: number) => {
    const currentXp = profile?.totalXp || 0;
    await dataService.updateData('profile', { totalXp: currentXp + amount });
  }, [profile]);
  
  // --- DATA TRANSFORMATION MEMOS ---

  const habits = useMemo((): Habit[] => {
    return Object.values(data.habits).map(h => {
        const history = Object.entries(h.history || {}).map(([date, completed]) => ({ date, completed: !!completed }));
        return {
            ...h,
            id: h.id!,
            history,
            bestStreak: h.bestStreak || 0,
            currentStreak: h.currentStreak || 0
        };
    });
  }, [data.habits]);

  const tasks = useMemo((): Task[] => Object.values(data.tasks), [data.tasks]);
  
  const projects = useMemo((): Project[] => {
      return Object.values(data.projects).map(p => ({
          ...p,
          id: p.id!,
          tasks: tasks.filter(t => t.projectId === p.id),
      }));
  }, [data.projects, tasks]);
  
  const books = useMemo((): Book[] => {
    return Object.values(data.books).map(b => ({
      ...b,
      id: b.id!,
      notes: Object.values(data.bookNotes[b.id!] || {}),
    }));
  }, [data.books, data.bookNotes]);

  const backlinks = useMemo(() => {
    const allBacklinks: Record<string, { bookId: string; bookTitle: string; note: BookNote }[]> = {};
    const bookTitleMap = books.reduce((acc, book) => {
        acc[book.title.toLowerCase()] = book.id;
        return acc;
    }, {} as Record<string, string>);

    const bookIdToTitleMap = books.reduce((acc, book) => {
      acc[book.id] = book.title;
      return acc;
    }, {} as Record<string, string>);

    for (const sourceBook of books) {
        for (const note of sourceBook.notes) {
            const matches = note.content.match(/\[\[(.*?)\]\]/g);
            if (matches) {
                for (const match of matches) {
                    const linkedTitle = match.slice(2, -2).toLowerCase();
                    const linkedBookId = bookTitleMap[linkedTitle];
                    
                    if (linkedBookId && linkedBookId !== sourceBook.id) {
                        if (!allBacklinks[linkedBookId]) {
                            allBacklinks[linkedBookId] = [];
                        }
                        // Avoid adding duplicate backlink from the same note
                        if (!allBacklinks[linkedBookId].some(bl => bl.note.id === note.id)) {
                             allBacklinks[linkedBookId].push({
                                bookId: sourceBook.id,
                                bookTitle: bookIdToTitleMap[sourceBook.id],
                                note: note,
                            });
                        }
                    }
                }
            }
        }
    }
    return allBacklinks;
  }, [books]);

  const developmentGraph = useMemo((): DevelopmentGraph => {
      return {
          nodes: Object.values(data.developmentGraph?.nodes || {}),
          edges: Object.values(data.developmentGraph?.edges || {}),
      };
  }, [data.developmentGraph]);
  
  const goals = useMemo((): Goal[] => {
      return Object.values(data.goals).map(g => ({
          ...g,
          id: g.id!,
          milestones: Object.values(data.milestones[g.id!] || {}),
      }));
  }, [data.goals, data.milestones]);

  const allDailyCheckins = useMemo(() => Object.values(data.dailyCheckins).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [data.dailyCheckins]);
  
  const dailyCheckin = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allDailyCheckins.find(c => c.date === today) || null;
  }, [allDailyCheckins]);
  
  const yesterdaysIncompleteKeystoneHabits = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return habits
      .filter(h => h.isKeystone)
      .filter(h => !(h.history || []).find(entry => entry.date === yesterdayStr && entry.completed))
      .length;
  }, [habits]);

  const agendaEvents = useMemo(() => Object.values(data.agendaEvents), [data.agendaEvents]);
  const flowSessions = useMemo(() => Object.values(data.flowSessions), [data.flowSessions]);
  const cognitiveSessions = useMemo(() => Object.values(data.cognitiveSessions), [data.cognitiveSessions]);
  const biohackingMetrics = useMemo(() => Object.values(data.biohackingMetrics), [data.biohackingMetrics]);

  // --- DATA MUTATION CALLBACKS ---

  const handleCheckinConfirm = useCallback(async (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const directive = await generateDailyDirective(checkinData, userManifesto, language);
    const newCheckin: DailyCheckin = {
      ...checkinData,
      date: todayStr,
      timestamp: today.toISOString(),
      directive,
    };
    await dataService.setData(`dailyCheckins/${todayStr}`, newCheckin);
  }, [language, userManifesto]);

  const addHabit = useCallback(async (name: string, category: Habit['category'], frequency: number) => {
    const newId = dataService.getNewId('habits');
    if (!newId) return;
    const newHabit: Omit<Habit, 'id'|'history'|'bestStreak'|'currentStreak'> = { name, category, frequency };
    await dataService.setData(`habits/${newId}`, {...newHabit, id: newId, bestStreak: 0, currentStreak: 0});
    await addXp(50);
  }, [addXp]);

  const deleteHabit = useCallback(async (habitId: string) => {
    await dataService.removeData(`habits/${habitId}`);
    await dataService.removeData(`habitHistory/${habitId}`);
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string, date: string, isCompleted: boolean) => {
    await dataService.setData(`habits/${habitId}/history/${date}`, !isCompleted);
    if (!isCompleted) await addXp(20); else await addXp(-10);
    
    const habitData = data.habits[habitId];
    if (habitData) {
        // Create a temporary history array for calculation
        const newHistoryRecord = {...(habitData.history || {}), [date]: !isCompleted};
        const historyArray = Object.entries(newHistoryRecord).map(([d, c]) => ({ date: d, completed: !!c }));

        const newStreak = calculateCurrentStreak(historyArray);
        const bestStreak = habitData.bestStreak || 0;
        
        const updates: { currentStreak: number; bestStreak?: number } = {
            currentStreak: newStreak
        };

        if (newStreak > bestStreak) {
            updates.bestStreak = newStreak;
        }
        
        await dataService.updateData(`habits/${habitId}`, updates);
    }
  }, [addXp, data.habits]);

  const addProject = useCallback(async (name: string) => {
    const newId = dataService.getNewId('projects');
    if (!newId) return;
    const newProject = { name, id: newId };
    await dataService.setData(`projects/${newId}`, newProject);
    await addXp(100);
  }, [addXp]);
  
  const deleteProject = useCallback(async (projectId: string) => {
    const tasksToDelete = tasks.filter(t => t.projectId === projectId);
    const updates: Record<string, null> = {};
    updates[`projects/${projectId}`] = null;
    tasksToDelete.forEach(t => { updates[`tasks/${t.id}`] = null; });
    await dataService.updateData('', updates);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(Object.keys(data.projects).filter(id => id !== projectId)[0] || null);
    }
  }, [tasks, selectedProjectId, data.projects]);

  const addTask = useCallback(async (projectId: string, content: string) => {
    const newId = dataService.getNewId('tasks');
    if (!newId) return;
    const newTask: Task = { id: newId, content, status: 'A Fazer', isMIT: false, projectId };
    await dataService.setData(`tasks/${newId}`, newTask);
  }, []);

  const updateTask = useCallback(async (projectId: string, updatedTask: Task) => {
    await dataService.setData(`tasks/${updatedTask.id}`, { ...updatedTask, projectId });
  }, []);

  const updateTaskStatus = useCallback(async (projectId: string, taskId: string, newStatus: TaskStatus) => {
    await dataService.updateData(`tasks/${taskId}`, { status: newStatus });
    if(newStatus === 'Concluído') await addXp(25);
  }, [addXp]);

  const saveBook = useCallback(async (book: Book) => {
    const { notes, ...bookData } = book;
    if (book.id) {
        await dataService.setData(`library/${book.id}`, bookData);
    } else {
        const newId = dataService.getNewId('library');
        if (!newId) return;
        await dataService.setData(`library/${newId}`, { ...bookData, id: newId });
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string) => {
    await dataService.removeData(`library/${bookId}`);
    await dataService.removeData(`bookNotes/${bookId}`);
  }, []);

  const addNoteToBook = useCallback(async (bookId: string, noteContent: string) => {
      const newId = dataService.getNewId(`bookNotes/${bookId}`);
      if (!newId) return;
      const newNote: BookNote = { id: newId, content: noteContent, createdAt: new Date().toISOString() };
      await dataService.setData(`bookNotes/${bookId}/${newId}`, newNote);
      await addXp(15);
  }, [addXp]);
  
  const updateNote = useCallback(async (bookId: string, note: BookNote) => {
      await dataService.setData(`bookNotes/${bookId}/${note.id}`, note);
  }, []);
  
  const deleteNote = useCallback(async (bookId: string, noteId: string) => {
      await dataService.removeData(`bookNotes/${bookId}/${noteId}`);
  }, []);

  const saveDevelopmentNode = useCallback(async (node: DevelopmentNode) => {
    if (node.id) {
        await dataService.setData(`developmentGraph/nodes/${node.id}`, node);
    } else {
        const newId = dataService.getNewId('developmentGraph/nodes');
        if (!newId) return;
        await dataService.setData(`developmentGraph/nodes/${newId}`, { ...node, id: newId });
    }
  }, []);

  const deleteDevelopmentNode = useCallback(async (nodeId: string) => {
    await dataService.removeData(`developmentGraph/nodes/${nodeId}`);
    const edges = Object.values(data.developmentGraph.edges || {});
    const updates: Record<string, null> = {};
    edges.forEach(edge => {
      if(edge.source === nodeId || edge.target === nodeId) {
        updates[`developmentGraph/edges/${edge.id}`] = null;
      }
    });
    await dataService.updateData('', updates);
  }, [data.developmentGraph.edges]);
  
  const saveGoal = useCallback(async (goal: Goal) => {
      const { milestones, ...goalData } = goal;
      const goalId = goal.id || dataService.getNewId('goals');
      if (!goalId) return;
      const milestoneUpdates: Record<string, Milestone> = {};
      milestones.forEach(m => { milestoneUpdates[m.id] = m; });
      await dataService.setData(`goals/${goalId}`, { ...goalData, id: goalId });
      await dataService.setData(`milestones/${goalId}`, milestoneUpdates);
  }, []);
  
  const deleteGoal = useCallback(async (goalId: string) => {
      await dataService.removeData(`goals/${goalId}`);
      await dataService.removeData(`milestones/${goalId}`);
  }, []);

  const saveFlowSession = useCallback(async (session: FlowSession, earnedXp: number) => {
      await dataService.setData(`flowSessions/${session.id}`, session);
      await addXp(earnedXp);
  }, [addXp]);

  const saveCognitiveSession = useCallback(async (session: CognitiveSession) => {
      await dataService.setData(`cognitiveSessions/${session.id}`, session);
  }, []);

  const saveBiohackingMetrics = useCallback(async (metrics: BiohackingMetrics) => {
      await dataService.setData(`biohackingMetrics/${metrics.date}`, metrics);
  }, []);

  return {
    loading,
    profile,
    isAuthenticated,
    isAuthReady,
    signIn,
    signUp,
    signOut,
    signInAnonymously,
    dailyCheckin,
    allDailyCheckins,
    handleCheckinConfirm,
    habits,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    addXp,
    yesterdaysIncompleteKeystoneHabits,
    projects,
    addProject,
    deleteProject,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    books,
    saveBook,
    deleteBook,
    addNoteToBook,
    updateNote,
    deleteNote,
    backlinks,
    developmentGraph,
    saveDevelopmentNode,
    deleteDevelopmentNode,
    agendaEvents,
    goals,
    saveGoal,
    deleteGoal,
    flowSessions,
    saveFlowSession,
    cognitiveSessions,
    saveCognitiveSession,
    biohackingMetrics,
    saveBiohackingMetrics
  };
}
