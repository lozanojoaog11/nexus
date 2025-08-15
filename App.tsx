
import React, { useState, useMemo } from 'react';
import { View, Habit, Project, Task, Book, DevelopmentGraph, CalendarEvent, Goal, DevelopmentNode, BookNote, DailyCheckin } from './types';
import useDatabase from './hooks/useDatabase';
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
import Login from './components/Login';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const {
    loading,
    isAuthenticated, isAuthReady,
    signIn, signUp, signOut,
    dailyCheckin, handleCheckinConfirm,
    habits, addHabit, deleteHabit, toggleHabitCompletion,
    projects, addProject, deleteProject, selectedProjectId, setSelectedProjectId,
    tasks, addTask, updateTask, updateTaskStatus,
    books, saveBook, deleteBook, addNoteToBook, updateNote, deleteNote,
    developmentGraph, saveDevelopmentNode, deleteDevelopmentNode,
    agendaEvents,
    goals, saveGoal, deleteGoal,
  } = useDatabase();

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

  const allTasks = useMemo(() => Object.values(tasks), [tasks]);

  const onCheckinConfirm = async (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => {
    setIsProcessingCheckin(true);
    await handleCheckinConfirm(checkinData);
    setIsProcessingCheckin(false);
    setShowCheckinModal(false);
  };

  const openGoalModal = (goal: Goal | null = null) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const openDevelopmentAreaModal = (node: DevelopmentNode | null = null) => {
    setEditingDevelopmentNode(node);
    setIsDevelopmentAreaModalOpen(true);
  };

  const openBookModal = (book: Book | null = null) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const renderView = () => {
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-[#00A9FF] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400 mt-4">Sincronizando com a nuvem...</p>
                </div>
            </div>
        );
    }
      
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = !!dailyCheckin && dailyCheckin.date === today;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                    checkin={dailyCheckin} 
                    hasCheckedInToday={hasCheckedInToday}
                    onStartCheckin={() => setShowCheckinModal(true)}
                    projects={projects}
                    habits={habits} 
                    goals={goals}
                    developmentGraph={developmentGraph}
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
                    developmentNodes={developmentGraph.nodes}
                />;
      case 'goals':
        return <Goals 
                    goals={goals}
                    onAddGoal={() => openGoalModal(null)}
                    onEditGoal={(goal) => openGoalModal(goal)}
                    onDeleteGoal={deleteGoal}
                />;
      case 'agenda':
        return <Agenda events={agendaEvents} tasks={allTasks} />;
      case 'development':
        return <Development 
                  graph={developmentGraph}
                  goals={goals}
                  tasks={allTasks}
                  books={books}
                  onAddNode={() => openDevelopmentAreaModal(null)}
                  onEditNode={(node) => openDevelopmentAreaModal(node)}
                  onDeleteNode={deleteDevelopmentNode} 
                />;
      case 'guardian':
        return <Guardian />;
      case 'library':
        return <Library 
                  books={books} 
                  addNoteToBook={addNoteToBook}
                  onAddBook={() => openBookModal(null)}
                  onEditBook={(book) => openBookModal(book)}
                  onDeleteBook={deleteBook}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                />;
      default:
        return <Dashboard 
                    checkin={dailyCheckin} 
                    hasCheckedInToday={hasCheckedInToday}
                    onStartCheckin={() => setShowCheckinModal(true)}
                    projects={projects}
                    habits={habits} 
                    goals={goals}
                    developmentGraph={developmentGraph}
                    allTasks={allTasks}
                />;
    }
  };

  if (!isAuthReady) {
    return (
        <div className="flex h-screen w-screen bg-black/10 items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#00A9FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  if (!isAuthenticated) {
      return <Login onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="flex h-screen w-screen text-white">
      {showCheckinModal && <DailyCheckinModal onConfirm={onCheckinConfirm} isProcessing={isProcessingCheckin}/>}
      {isAddHabitModalOpen && <AddHabitModal onClose={() => setIsAddHabitModalOpen(false)} onAdd={addHabit} />}
      {isAddProjectModalOpen && <AddProjectModal onClose={() => setIsAddProjectModalOpen(false)} onAdd={addProject} />}
      {isGoalModalOpen && <GoalModal 
                            onClose={() => { setEditingGoal(null); setIsGoalModalOpen(false); }} 
                            onSave={saveGoal} 
                            goalToEdit={editingGoal}
                            developmentNodes={developmentGraph.nodes}
                            projects={projects}
                          />}
      {isDevelopmentAreaModalOpen && <DevelopmentAreaModal 
                            onClose={() => { setEditingDevelopmentNode(null); setIsDevelopmentAreaModalOpen(false); }}
                            onSave={saveDevelopmentNode}
                            nodeToEdit={editingDevelopmentNode}
                          />}
      {isBookModalOpen && <BookModal
                            onClose={() => { setEditingBook(null); setIsBookModalOpen(false); }}
                            onSave={saveBook}
                            bookToEdit={editingBook}
                            developmentNodes={developmentGraph.nodes}
                          />}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onSignOut={signOut} />
      <main className="flex-1 bg-black/10">
        {renderView()}
      </main>
    </div>
  );
};

export default App;