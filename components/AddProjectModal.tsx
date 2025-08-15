
import React, { useState } from 'react';

interface AddProjectModalProps {
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center space-y-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Adicionar Novo Projeto</h2>
            <p className="text-gray-400 mt-2">Defina um novo fluxo de trabalho.</p>
        </div>
        
        <div className="w-full space-y-4">
            <div>
                <label htmlFor="project-name" className="text-sm font-medium text-gray-300 mb-2 block">Nome do Projeto</label>
                <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: d.IA.logo"
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                    autoFocus
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
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full bg-[#00A9FF] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Criar Projeto
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
