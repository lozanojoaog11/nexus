
import React, { useState, useMemo } from 'react';
import { Project, Task, TaskStatus, DevelopmentNode } from '../types';
import { PlusIcon, DevelopmentIcon } from '../constants';
import TaskDetailModal from './TaskDetailModal';

interface KanbanBoardProps {
  projects: Project[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: TaskStatus) => void;
  updateTask: (projectId: string, updatedTask: Task) => void;
  addTask: (projectId: string, content: string) => void;
  onAddProject: () => void;
  deleteProject: (projectId: string) => void;
  developmentNodes: DevelopmentNode[];
}

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const KanbanCard: React.FC<{ task: Task; onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void; onClick: () => void }> = ({ task, onDragStart, onClick }) => (
  <div
    draggable
    onClick={onClick}
    onDragStart={(e) => onDragStart(e, task.id)}
    className={`p-4 bg-gray-800/80 rounded-lg border border-white/10 mb-3 cursor-pointer active:cursor-grabbing transition-all duration-200 hover:border-[#00A9FF]/50 hover:bg-gray-700/50 group ${task.isMIT ? 'border-l-4 border-l-[#00A9FF] animate-subtle-glow' : ''}`}
    >
    <p className="text-sm text-gray-200">{task.content}</p>
    {task.relatedDevelopmentNodeId && (
        <div className="mt-2 flex items-center gap-1.5">
            <DevelopmentIcon className="w-3 h-3 text-gray-500 group-hover:text-[#00A9FF] transition-colors" />
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Vinculado</span>
        </div>
    )}
  </div>
);

const KanbanColumn: React.FC<{
  title: TaskStatus;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onCardClick: (task: Task) => void;
}> = ({ title, tasks, onDragStart, onDrop, onCardClick }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, title);
  };

  return (
    <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 bg-black/30 rounded-xl p-4 min-w-[300px] transition-colors duration-300 ${isOver ? 'bg-white/10' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-300 uppercase tracking-wider text-sm">{title}</h3>
        <span className="text-xs font-bold text-gray-500 bg-gray-900/50 rounded-full px-2 py-1">{tasks.length}</span>
      </div>
      <div className="h-full">
        {tasks.map(task => (
          <KanbanCard key={task.id} task={task} onDragStart={onDragStart} onClick={() => onCardClick(task)}/>
        ))}
      </div>
    </div>
  );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, selectedProjectId, setSelectedProjectId, updateTaskStatus, updateTask, addTask, onAddProject, deleteProject, developmentNodes }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  const progress = useMemo(() => {
    if (!selectedProject || selectedProject.tasks.length === 0) return 0;
    const completed = selectedProject.tasks.filter(t => t.status === 'Concluído').length;
    return Math.round((completed / selectedProject.tasks.length) * 100);
  }, [selectedProject]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    if (draggedTaskId && selectedProjectId) {
      updateTaskStatus(selectedProjectId, draggedTaskId, newStatus);
    }
    setDraggedTaskId(null);
  };
  
  const handleAddTask = () => {
    if (newTaskContent.trim() && selectedProjectId) {
        addTask(selectedProjectId, newTaskContent.trim());
        setNewTaskContent('');
    }
  };
  
  const handleCardClick = (task: Task) => {
      setSelectedTask(task);
      setShowTaskModal(true);
  };

  const handleModalClose = () => {
      setShowTaskModal(false);
      setSelectedTask(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
      if(selectedProjectId) {
          updateTask(selectedProjectId, updatedTask);
      }
  };
  
  if (projects.length === 0 || !selectedProject) {
    return (
        <div className="p-8 text-center text-gray-400 w-full h-full flex flex-col items-center justify-center">
            <p className="mb-4">Nenhum projeto encontrado. Crie um para começar.</p>
            <button onClick={onAddProject} className="bg-[#00A9FF] text-black font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 flex items-center space-x-2">
                <PlusIcon className="w-5 h-5"/>
                <span>Novo Projeto</span>
            </button>
        </div>
    );
  }

  const columns: TaskStatus[] = ['A Fazer', 'Em Progresso', 'Concluído'];

  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in-up">
      {showTaskModal && selectedTask && (
          <TaskDetailModal 
            task={selectedTask}
            onClose={handleModalClose}
            onUpdate={handleTaskUpdate}
            developmentNodes={developmentNodes}
          />
      )}
      <header className="mb-6 flex-shrink-0">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2">
                    <div className="bg-[#00A9FF] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-sm text-gray-400 mt-1">{progress}% concluído</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <select 
                    value={selectedProjectId || ''} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={onAddProject} className="p-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => deleteProject(selectedProject.id)} className="p-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-red-900/50 hover:border-red-500/50 transition-colors">
                    <TrashIcon className="w-5 h-5 pointer-events-none"/>
                </button>
            </div>
        </div>
      </header>

      <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
        {columns.map(status => (
            <KanbanColumn 
                key={status}
                title={status}
                tasks={selectedProject.tasks.filter(t => t.status === status)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onCardClick={handleCardClick}
            />
        ))}
      </div>
      
      <footer className="mt-6 flex-shrink-0 flex gap-3">
        <input 
            type="text" 
            value={newTaskContent}
            onChange={e => setNewTaskContent(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Adicionar nova tarefa..."
            className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
        />
        <button onClick={handleAddTask} className="bg-[#00A9FF] text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-80 transition-all">
            Adicionar
        </button>
      </footer>
    </div>
  );
};

export default KanbanBoard;