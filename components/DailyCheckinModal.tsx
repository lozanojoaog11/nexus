import React, { useState } from 'react';
import { DailyCheckin } from '../types';
import { ACCENT_COLOR } from '../constants';
import MorningRoutine from './MorningRoutine';

interface DailyCheckinModalProps {
  onConfirm: (checkinData: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => void;
  isProcessing: boolean;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="w-full">
        <div className="flex justify-between items-baseline mb-1">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-lg font-bold text-white w-8 text-right" style={{color: ACCENT_COLOR}}>{value}</span>
        </div>
        <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00A9FF]"
        />
    </div>
);

const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ onConfirm, isProcessing }) => {
  const [energia, setEnergia] = useState(7);
  const [clareza, setClareza] = useState(7);
  const [momentum, setMomentum] = useState(7);
  const [notes, setNotes] = useState('');
  const [completedHabitIds] = useState<string[]>([]); // Mantido para compatibilidade, mas a lógica agora está na rotina.
  const [routineNotes, setRoutineNotes] = useState<string>('');
  
  const handleSubmit = () => {
    if (isProcessing) return;
    const combinedNotes = `Brain Dump: ${notes || 'Nenhum'}\nRotina Matinal: ${routineNotes || 'Nenhuma atividade registrada.'}`;
    onConfirm({ energia, clareza, momentum, notes: combinedNotes, completedHabitIds });
  };
  
  const handleRoutineComplete = (activities: string[]) => {
      setRoutineNotes(activities.join(', '));
      // A IA usará essas notas para entender o início do dia.
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center space-y-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Check-in Diário</h2>
            <p className="text-gray-400 mt-2">Alinhe sua intenção para o dia.</p>
        </div>
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <svg className="animate-spin h-8 w-8 text-[#00A9FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400 mt-4">Gerando sua diretriz diária...</p>
          </div>
        ) : (
          <>
            <div className="w-full space-y-4">
                <Slider label="Energia" value={energia} onChange={(e) => setEnergia(parseInt(e.target.value))} />
                <Slider label="Clareza" value={clareza} onChange={(e) => setClareza(parseInt(e.target.value))} />
                <Slider label="Momentum" value={momentum} onChange={(e) => setMomentum(parseInt(e.target.value))} />
            </div>

            <div className="w-full p-4 bg-black/30 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Construa sua Rotina Matinal</h3>
                <MorningRoutine onComplete={handleRoutineComplete} />
            </div>

            <div className="w-full">
              <label htmlFor="brain-dump" className="text-sm font-medium text-gray-300 mb-2 block">Brain Dump</label>
              <textarea
                id="brain-dump"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="O que está ocupando sua mente? Descarregue aqui..."
                className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!routineNotes} // Desabilita até a rotina ser completada
              className="w-full bg-[#00A9FF] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Confirmar Alinhamento
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyCheckinModal;