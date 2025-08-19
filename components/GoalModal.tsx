

import React, { useState, useEffect } from 'react';
import { Goal, Milestone, GoalHorizon, DevelopmentNode, Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface GoalModalProps {
  onClose: () => void;
  onSave: (goal: Goal) => void;
  goalToEdit: Goal | null;
  developmentNodes: DevelopmentNode[];
  projects: Project[];
}

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const GoalModal: React.FC<GoalModalProps> = ({ onClose, onSave, goalToEdit, developmentNodes, projects }) => {
  const { t, language } = useTranslation();
  const [goal, setGoal] = useState<Omit<Goal, 'id'>>({
    name: '',
    areaId: '',
    horizon: 'Curto Prazo (até 3 meses)',
    deadline: '',
    description: '',
    expectedResults: '',
    successMetrics: '',
    tags: '',
    relatedProjectIds: [],
    milestones: [],
    ...goalToEdit,
  });

  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGoal(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddMilestone = () => {
    if(newMilestoneName.trim() && newMilestoneDate) {
        const newMilestone: Milestone = {
            id: `m${Date.now()}`,
            name: newMilestoneName.trim(),
            date: newMilestoneDate,
        };
        setGoal(prev => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
        setNewMilestoneName('');
        setNewMilestoneDate('');
    }
  };

  const handleDeleteMilestone = (milestoneId: string) => {
      setGoal(prev => ({...prev, milestones: prev.milestones.filter(m => m.id !== milestoneId)}));
  };

  const handleSubmit = () => {
    if (goal.name.trim() && goal.areaId && goal.deadline) {
        const goalToSave = { ...goal, id: goalToEdit?.id || '' };
        onSave(goalToSave);
    }
  };
  
  const developmentAreas = developmentNodes.filter(n => n.type === 'Ponto de Fuga' || n.type === 'Objetivo');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-3xl flex flex-col animate-fade-in-up max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">{goalToEdit ? t('goalModal.editTitle') : t('goalModal.addTitle')}</h2>
        
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.name')}</label>
                    <input name="name" value={goal.name} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.devArea')}</label>
                    <select name="areaId" value={goal.areaId} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700">
                        <option value="" disabled>{t('goalModal.selectArea')}</option>
                        {developmentAreas.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.horizon')}</label>
                    <select name="horizon" value={goal.horizon} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700">
                        <option value="Curto Prazo (até 3 meses)">{t('goalModal.horizons.short')}</option>
                        <option value="Médio Prazo (3-12 meses)">{t('goalModal.horizons.medium')}</option>
                        <option value="Longo Prazo (>1 ano)">{t('goalModal.horizons.long')}</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.deadline')}</label>
                    <input type="date" name="deadline" value={goal.deadline} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.description')}</label>
                <textarea name="description" value={goal.description} onChange={handleChange} rows={2} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.expectedResults')}</label>
                <textarea name="expectedResults" value={goal.expectedResults} onChange={handleChange} rows={2} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.successMetrics')}</label>
                <textarea name="successMetrics" value={goal.successMetrics} onChange={handleChange} rows={2} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
            <div>
                 <label className="text-sm font-medium text-gray-300 mb-1 block">{t('goalModal.tags')}</label>
                 <input name="tags" value={goal.tags} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
            
            <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold text-white mb-2">{t('goalModal.milestones')}</h3>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {goal.milestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                            <span className="text-sm">{m.name} - {new Date(m.date + 'T12:00:00').toLocaleDateString(language)}</span>
                            <button onClick={() => handleDeleteMilestone(m.id)} className="p-1 text-gray-500 hover:text-red-400">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <input value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} placeholder={t('goalModal.milestoneNamePlaceholder')} className="flex-grow bg-gray-700/60 p-2 rounded-lg border border-gray-600 text-sm"/>
                    <input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="bg-gray-700/60 p-2 rounded-lg border border-gray-600 text-sm"/>
                    <button onClick={handleAddMilestone} className="bg-white/10 text-white font-semibold px-3 py-2 rounded-lg text-sm hover:bg-white/20">{t('goalModal.addMilestone')}</button>
                </div>
            </div>
        </div>
        
        <div className="w-full flex gap-4 mt-6 pt-6 border-t border-white/10">
            <button onClick={onClose} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-700">{t('goalModal.cancel')}</button>
            <button onClick={handleSubmit} className="w-full bg-[#00A9FF] text-black font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-lg shadow-[#00A9FF]/20">{t('goalModal.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
