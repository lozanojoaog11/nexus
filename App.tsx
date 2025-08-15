
import React, { useState, useEffect } from 'react';
import { View, DailyCheckin, Habit, Project, Task, TaskStatus, Book, DevelopmentGraph, CalendarEvent, Goal, DevelopmentNode, BookNote } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import Guardian from './components/Guardian';
import Library from './components/Library';
import DailyCheckinModal from './components/DailyCheckinModal';
import Development from './components/Development';
import Habits from './components/Habits';
import AddHabitModal from './components/AddHabitModal';
import AddProjectModal from './components/AddProjectModal';
import Agenda from './components/Agenda';
import Goals from './components/Goals';
import GoalModal from './components/GoalModal';
import DevelopmentAreaModal from './components/DevelopmentAreaModal';
import BookModal from './components/BookModal';
import { INITIAL_HABITS, INITIAL_PROJECTS, INITIAL_BOOKS, INITIAL_DEVELOPMENT_DATA, USER_MANIFESTO, INITIAL_AGENDA_EVENTS, INITIAL_GOALS } from './constants';
import { generateDailyDirective } from './services/geminiService';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [dailyCheckin, setDailyCheckin] = useLocalStorage<DailyCheckin | null>('eixo-checkin', null);
  const [habits, setHabits] = useLocalStorage<Habit[]>('eixo-habits', INITIAL_HABITS);
  const [projects, setProjects] = useLocalStorage<Project[]>('eixo-projects', INITIAL_PROJECTS);
  const [books, setBooks] = useLocalStorage<Book[]>('eixo-books', INITIAL_BOOKS);
  const [development, setDevelopment] = useLocalStorage<DevelopmentGraph>('eixo-development', INITIAL_DEVELOPMENT_DATA);
  const [agendaEvents, setAgendaEvents] = useLocalStorage<CalendarEvent[]>('eixo-agenda', INITIAL_AGENDA_EVENTS);
  const [goals, setGoals] = useLocalStorage<Goal[]>('eixo-goals', INITIAL_GOALS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isDevelopmentAreaModalOpen, setIsDevelopmentAreaModalOpen] = useState(false);
  const [editingDevelopmentNode, setEditingDevelopmentNode] = useState<DevelopmentNode | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);


  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId]);


  const handleCheckinConfirm = async (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => {
    setIsProcessingCheckin(true);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    try {
        const directive = await generateDailyDirective(checkinData, USER_MANIFESTO);
        setDailyCheckin({ date: todayStr, timestamp: today.toISOString(), ...checkinData, directive });
    } catch (error) {
        console.error("Failed to generate directive:", error);
        setDailyCheckin({ date: todayStr, timestamp: today.toISOString(), ...checkinData, directive: "Diretriz indisponível. Foque no essencial." });
    }
    
    setIsProcessingCheckin(false);
    setShowCheckinModal(false);
  };
  
const calculateCurrentStreak = (history: Habit['history']) => {
    let streak = 0;
    const sortedHistory = [...history]
      .filter(h => h.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedHistory.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const lastCompletionDate = new Date(sortedHistory[0].date);
    // Adjust for timezone by getting the date part only
    lastCompletionDate.setMinutes(lastCompletionDate.getMinutes() + lastCompletionDate.getTimezoneOffset());
    const lastCompletionStr = lastCompletionDate.toISOString().split('T')[0];
    
    if(lastCompletionStr !== todayStr && lastCompletionStr !== yesterdayStr) return 0;

    streak = 1;
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i].date);
      const next = new Date(sortedHistory[i+1].date);
      const diff = (current.getTime() - next.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
}


const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prevHabits => 
        prevHabits.map(habit => {
            if (habit.id === habitId) {
                const newHistory = [...habit.history];
                const historyIndex = newHistory.findIndex(h => h.date === date);

                if (historyIndex > -1) {
                    newHistory[historyIndex] = { ...newHistory[historyIndex], completed: !newHistory[historyIndex].completed };
                } else {
                    newHistory.push({ date, completed: true });
                }
                
                const newCurrentStreak = calculateCurrentStreak(newHistory);
                const newBestStreak = Math.max(habit.bestStreak || 0, newCurrentStreak);

                return { ...habit, history: newHistory, bestStreak: newBestStreak };
            }
            return habit;
        })
    );
};


const addHabit = (name: string, category: Habit['category'], frequency: number) => {
    const newHabit: Habit = {
        id: `h${Date.now()}`,
        name,
        category,
        frequency,
        history: [],
        bestStreak: 0,
    };
    setHabits(prev => [...prev, newHabit]);
    setIsAddHabitModalOpen(false);
};

const deleteHabit = (habitId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este hábito?')) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    }
};

  const addProject = (name: string) => {
    const newProject: Project = { id: `p${Date.now()}`, name, tasks: [] };
    setProjects(prev => {
        const newProjects = [...prev, newProject];
        setSelectedProjectId(newProject.id);
        return newProjects;
    });
    setIsAddProjectModalOpen(false);
  };

  const deleteProject = (projectId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este projeto e todas as suas tarefas?')) {
        setProjects(prev => {
            const remainingProjects = prev.filter(p => p.id !== projectId);
            if (selectedProjectId === projectId) {
                setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
            }
            return remainingProjects;
        });
      }
  };

  const updateTask = (projectId: string, updatedTask: Task) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            };
        }
        return p;
    }));
  };

  const updateTaskStatus = (projectId: string, taskId: string, newStatus: TaskStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) };
      }
      return p;
    }));
  };

  const addTask = (projectId: string, content: string) => {
    const newTask: Task = { id: `t${Date.now()}`, content, status: 'A Fazer', isMIT: false };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p));
  };

  const addNoteToBook = (bookId: string, noteContent: string) => {
    const newNote = { id: `n${Date.now()}`, content: noteContent, createdAt: new Date().toISOString() };
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, notes: [...b.notes, newNote] } : b));
  };

  const openBookModal = (book: Book | null = null) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (bookToSave: Book) => {
      setBooks(prev => {
          const exists = prev.some(b => b.id === bookToSave.id);
          if (exists) {
              return prev.map(b => b.id === bookToSave.id ? bookToSave : b);
          }
          return [...prev, { ...bookToSave, id: `b${Date.now()}` }];
      });
      setIsBookModalOpen(false);
      setEditingBook(null);
  };

  const handleDeleteBook = (bookId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este livro e todas as suas notas?')) {
          setBooks(prev => prev.filter(b => b.id !== bookId));
      }
  };

  const handleUpdateNote = (bookId: string, updatedNote: BookNote) => {
      setBooks(prev => prev.map(b => {
          if (b.id === bookId) {
              return {
                  ...b,
                  notes: b.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
              };
          }
          return b;
      }));
  };

  const handleDeleteNote = (bookId: string, noteId: string) => {
      setBooks(prev => prev.map(b => {
          if (b.id === bookId) {
              return { ...b, notes: b.notes.filter(n => n.id !== noteId) };
          }
          return b;
      }));
  };
  
  const handleSaveGoal = (goalToSave: Goal) => {
    const exists = goals.some(g => g.id === goalToSave.id);
    if (exists) {
        setGoals(prev => prev.map(g => g.id === goalToSave.id ? goalToSave : g));
    } else {
        setGoals(prev => [...prev, { ...goalToSave, id: `g${Date.now()}` }]);
    }
    setEditingGoal(null);
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
      if(window.confirm('Tem certeza que deseja excluir esta meta?')) {
          setGoals(prev => prev.filter(g => g.id !== goalId));
      }
  };

  const openGoalModal = (goal: Goal | null = null) => {
      setEditingGoal(goal);
      setIsGoalModalOpen(true);
  };

  const openDevelopmentAreaModal = (node: DevelopmentNode | null = null) => {
    setEditingDevelopmentNode(node);
    setIsDevelopmentAreaModalOpen(true);
  };

  const handleSaveDevelopmentNode = (nodeToSave: DevelopmentNode) => {
      setDevelopment(prev => {
          const exists = prev.nodes.some(n => n.id === nodeToSave.id);
          let newNodes;
          if (exists) {
              newNodes = prev.nodes.map(n => n.id === nodeToSave.id ? nodeToSave : n);
          } else {
              newNodes = [...prev.nodes, { ...nodeToSave, id: `dn${Date.now()}` }];
          }
          return { ...prev, nodes: newNodes };
      });
      setEditingDevelopmentNode(null);
      setIsDevelopmentAreaModalOpen(false);
  };

  const handleDeleteDevelopmentNode = (nodeId: string) => {
      if (window.confirm('Tem certeza que deseja excluir esta Área de Desenvolvimento? As conexões também serão removidas.')) {
          setDevelopment(prev => ({
              ...prev,
              nodes: prev.nodes.filter(n => n.id !== nodeId),
              edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
          }));
      }
  };

  const renderView = () => {
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = !!dailyCheckin && dailyCheckin.date === today;
    const allTasks = projects.flatMap(p => p.tasks);


    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                    checkin={dailyCheckin} 
                    hasCheckedInToday={hasCheckedInToday}
                    onStartCheckin={() => setShowCheckinModal(true)}
                    projects={projects}
                    habits={habits} 
                    goals={goals}
                    developmentGraph={development}
                    allTasks={allTasks}
                />;
      case 'habits':
        return <Habits 
                  habits={habits} 
                  toggleHabitCompletion={toggleHabitCompletion} 
                  onAddHabit={() => setIsAddHabitModalOpen(true)}
                  onDeleteHabit={deleteHabit}
                />;
      case 'projects':
        return <KanbanBoard 
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    updateTaskStatus={updateTaskStatus}
                    updateTask={updateTask}
                    addTask={addTask}
                    onAddProject={() => setIsAddProjectModalOpen(true)}
                    deleteProject={deleteProject}
                    developmentNodes={development.nodes}
                />;
      case 'goals':
        return <Goals 
                    goals={goals}
                    onAddGoal={() => openGoalModal(null)}
                    onEditGoal={(goal) => openGoalModal(goal)}
                    onDeleteGoal={handleDeleteGoal}
                />;
      case 'agenda':
        return <Agenda events={agendaEvents} tasks={projects.flatMap(p => p.tasks)} />;
      case 'development':
        return <Development 
                  graph={development}
                  goals={goals}
                  tasks={allTasks}
                  books={books}
                  onAddNode={() => openDevelopmentAreaModal(null)}
                  onEditNode={(node) => openDevelopmentAreaModal(node)}
                  onDeleteNode={handleDeleteDevelopmentNode} 
                />;
      case 'guardian':
        return <Guardian />;
      case 'library':
        return <Library 
                  books={books} 
                  addNoteToBook={addNoteToBook}
                  onAddBook={() => openBookModal(null)}
                  onEditBook={(book) => openBookModal(book)}
                  onDeleteBook={handleDeleteBook}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                />;
      default:
        return <Dashboard 
                    checkin={dailyCheckin} 
                    hasCheckedInToday={hasCheckedInToday}
                    onStartCheckin={() => setShowCheckinModal(true)}
                    projects={projects}
                    habits={habits} 
                    goals={goals}
                    developmentGraph={development}
                    allTasks={allTasks}
                />;
    }
  };

  return (
    <div className="flex h-screen w-screen text-white">
      {showCheckinModal && <DailyCheckinModal onConfirm={handleCheckinConfirm} isProcessing={isProcessingCheckin}/>}
      {isAddHabitModalOpen && <AddHabitModal onClose={() => setIsAddHabitModalOpen(false)} onAdd={addHabit} />}
      {isAddProjectModalOpen && <AddProjectModal onClose={() => setIsAddProjectModalOpen(false)} onAdd={addProject} />}
      {isGoalModalOpen && <GoalModal 
                            onClose={() => { setEditingGoal(null); setIsGoalModalOpen(false); }} 
                            onSave={handleSaveGoal} 
                            goalToEdit={editingGoal}
                            developmentNodes={development.nodes}
                            projects={projects}
                          />}
      {isDevelopmentAreaModalOpen && <DevelopmentAreaModal 
                            onClose={() => { setEditingDevelopmentNode(null); setIsDevelopmentAreaModalOpen(false); }}
                            onSave={handleSaveDevelopmentNode}
                            nodeToEdit={editingDevelopmentNode}
                          />}
      {isBookModalOpen && <BookModal
                            onClose={() => { setEditingBook(null); setIsBookModalOpen(false); }}
                            onSave={handleSaveBook}
                            bookToEdit={editingBook}
                            developmentNodes={development.nodes}
                          />}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 bg-black/10">
        {renderView()}
      </main>
    </div>
  );
};

export default App;