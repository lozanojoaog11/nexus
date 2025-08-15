
import React from 'react';
import { Goal } from '../types';
import { PlusIcon } from '../constants';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);


const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onEditGoal, onDeleteGoal }) => {
  const calculateProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => new Date(m.date) <= new Date()).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in-up">
      <header className="mb-8 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Metas Estratégicas</h1>
          <p className="text-gray-400 mt-1">Seus objetivos de longo prazo e marcos de progresso.</p>
        </div>
        <button
          onClick={onAddGoal}
          className="bg-[#00A9FF] text-black font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nova Meta</span>
        </button>
      </header>

      <div className="flex-grow overflow-y-auto pr-4">
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => {
              const progress = calculateProgress(goal);
              return (
                <div key={goal.id} className="bg-[#1C1C1C] rounded-2xl border border-white/10 p-6 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-white pr-4">{goal.name}</h2>
                      <span className="text-xs font-semibold bg-white/10 px-2 py-1 rounded-full flex-shrink-0">{goal.horizon}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden">{goal.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-400">Progresso</span>
                          <span className="text-xs font-bold text-[#00A9FF]">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-[#00A9FF] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <span>Prazo: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 mt-4 pt-4 flex justify-end items-center gap-2">
                     <div className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <button onClick={() => onEditGoal(goal)} className="p-2 rounded-md hover:bg-white/10 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="p-2 rounded-md hover:bg-red-500/20 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 pt-16">
            <p>Nenhuma meta estratégica definida.</p>
            <p className="mt-2">Clique em "Nova Meta" para começar a planejar seu futuro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;