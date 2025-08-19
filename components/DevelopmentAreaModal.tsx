

import React, { useState, useEffect } from 'react';
import { DevelopmentNode, DevelopmentNodeType, IconName } from '../types';
import { ICON_MAP } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface DevelopmentAreaModalProps {
  onClose: () => void;
  onSave: (node: DevelopmentNode) => void;
  nodeToEdit: DevelopmentNode | null;
}

const DevelopmentAreaModal: React.FC<DevelopmentAreaModalProps> = ({ onClose, onSave, nodeToEdit }) => {
  const { t } = useTranslation();
  const [node, setNode] = useState<Omit<DevelopmentNode, 'id'>>({
    label: '',
    description: '',
    type: 'Skill',
    icon: 'Estudos',
    successMetrics: '',
    targetDate: '',
    ...nodeToEdit,
  });

  useEffect(() => {
    if (nodeToEdit) {
      setNode({ ...nodeToEdit });
    }
  }, [nodeToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNode(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIconSelect = (iconName: IconName) => {
    setNode(prev => ({...prev, icon: iconName}));
  };

  const handleSubmit = () => {
    if (node.label.trim()) {
      const nodeToSave = { ...node, id: nodeToEdit?.id || '' };
      onSave(nodeToSave);
      onClose();
    }
  };

  const nodeTypes: DevelopmentNodeType[] = ['Skill', 'Objetivo', 'Recurso', 'Mentor', 'Hábito', 'Ponto de Fuga'];
  const iconNames = Object.keys(ICON_MAP) as IconName[];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl flex flex-col animate-fade-in-up max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">{nodeToEdit ? t('devAreaModal.editTitle') : t('devAreaModal.addTitle')}</h2>
        
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('devAreaModal.name')}</label>
                <input name="label" value={node.label} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('devAreaModal.type')}</label>
                 <select name="type" value={node.type} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700">
                    {nodeTypes.map(type => 
                        <option key={type} value={type}>
                            {t(`devAreaModal.types.${type.replace(/\s/g, '').replace(/[()]/g, '')}`, {defaultValue: type})}
                        </option>
                    )}
                </select>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('devAreaModal.description')}</label>
                <textarea name="description" value={node.description} onChange={handleChange} rows={3} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t('devAreaModal.icon')}</label>
                <div className="grid grid-cols-8 gap-2">
                    {iconNames.map(name => {
                        const Icon = ICON_MAP[name];
                        return (
                             <button key={name} onClick={() => handleIconSelect(name)} className={`p-2 rounded-lg border-2 ${node.icon === name ? 'border-[#00A9FF] bg-[#00A9FF]/20' : 'border-gray-700 bg-gray-800/60 hover:border-gray-500'}`}>
                                <Icon className="w-6 h-6 mx-auto text-gray-300"/>
                            </button>
                        )
                    })}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('devAreaModal.successMetrics')}</label>
                <textarea name="successMetrics" value={node.successMetrics} onChange={handleChange} rows={2} placeholder={t('devAreaModal.successMetricsPlaceholder')} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{t('devAreaModal.targetDate')}</label>
                <input type="date" name="targetDate" value={node.targetDate || ''} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
            </div>
        </div>
        
        <div className="w-full flex gap-4 mt-6 pt-6 border-t border-white/10">
            <button onClick={onClose} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-700">{t('devAreaModal.cancel')}</button>
            <button onClick={handleSubmit} className="w-full bg-[#00A9FF] text-black font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-lg shadow-[#00A9FF]/20">{t('devAreaModal.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentAreaModal;
