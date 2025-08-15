
import React, { useState, useEffect } from 'react';
import { Task, DevelopmentNode, TaskStatus } from '../types';
import { DevelopmentIcon } from '../constants';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  developmentNodes: DevelopmentNode[];
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdate, developmentNodes }) => {
  const [content, setContent] = useState(task.content);
  const [notes, setNotes] = useState(task.notes || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [relatedNodeId, setRelatedNodeId] = useState(task.relatedDevelopmentNodeId || '');
  const [deadline, setDeadline] = useState(task.deadline || '');

  const handleSave = () => {
    onUpdate({
      ...task,
      content,
      notes,
      status,
      relatedDevelopmentNodeId: relatedNodeId || undefined,
      deadline: deadline || undefined,
    });
    onClose();
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl flex flex-col space-y-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        
        <div>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent text-white text-3xl font-bold focus:outline-none"
            />
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="task-status" className="text-sm font-medium text-gray-300 mb-2 block">Status</label>
                <select
                    id="task-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Em Progresso">Em Progresso</option>
                    <option value="Concluído">Concluído</option>
                </select>
            </div>
             <div>
                <label htmlFor="task-deadline" className="text-sm font-medium text-gray-300 mb-2 block">Prazo Final</label>
                <input
                    id="task-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                />
            </div>
             <div className="relative md:col-span-2">
                <label htmlFor="task-development" className="text-sm font-medium text-gray-300 mb-2 block">Vincular ao Desenvolvimento</label>
                <div className="absolute inset-y-0 left-0 top-7 flex items-center pl-3 pointer-events-none">
                     <DevelopmentIcon className="w-5 h-5 text-gray-400" />
                </div>
                <select
                    id="task-development"
                    value={relatedNodeId}
                    onChange={(e) => setRelatedNodeId(e.target.value)}
                    className="w-full bg-gray-800/60 text-white p-3 pl-10 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                >
                    <option value="">Nenhum Vínculo</option>
                    {developmentNodes.map(node => (
                        <option key={node.id} value={node.id}>[{node.type}] {node.label}</option>
                    ))}
                </select>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="task-notes" className="text-sm font-medium text-gray-300 mb-2 block">Notas</label>
                <textarea
                    id="task-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Adicione mais detalhes ou contexto aqui..."
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                />
            </div>
        </div>
            
        <div className="w-full flex gap-4 mt-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-700/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="w-full bg-[#00A9FF] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20"
            >
              Salvar Alterações
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;