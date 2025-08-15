
import React, { useState } from 'react';
import { Habit } from '../types';

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (name: string, category: Habit['category'], frequency: number) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Habit['category']>('Mente');
  const [frequency, setFrequency] = useState(7);

  const handleSubmit = () => {
    if (name.trim() && frequency > 0 && frequency <= 7) {
      onAdd(name.trim(), category, frequency);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center space-y-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Adicionar Novo Hábito</h2>
            <p className="text-gray-400 mt-2">Defina um novo ritual para seu sistema.</p>
        </div>
        
        <div className="w-full space-y-4">
            <div>
                <label htmlFor="habit-name" className="text-sm font-medium text-gray-300 mb-2 block">Nome</label>
                <input
                    id="habit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Leitura Focada"
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                />
            </div>
            <div>
                <label htmlFor="habit-category" className="text-sm font-medium text-gray-300 mb-2 block">Categoria</label>
                <select
                    id="habit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Habit['category'])}
                    className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                >
                    <option value="Mente">Mente</option>
                    <option value="Corpo">Corpo</option>
                    <option value="Execução">Execução</option>
                </select>
            </div>
             <div>
                <label htmlFor="habit-frequency" className="text-sm font-medium text-gray-300 mb-2 block">Frequência Semanal (1-7)</label>
                <input
                    id="habit-frequency"
                    type="number"
                    min="1"
                    max="7"
                    value={frequency}
                    onChange={(e) => setFrequency(parseInt(e.target.value))}
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
              onClick={handleSubmit}
              disabled={!name.trim() || frequency < 1 || frequency > 7}
              className="w-full bg-[#00A9FF] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Adicionar Hábito
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
