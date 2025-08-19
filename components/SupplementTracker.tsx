
import React, { useState } from 'react';
import { SupplementLog } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SupplementTrackerProps {
  supplements: SupplementLog[];
  onUpdate: (data: SupplementLog[]) => void;
  onBack: () => void;
}

const SupplementTracker: React.FC<SupplementTrackerProps> = ({ supplements, onUpdate, onBack }) => {
    const { t } = useTranslation();
    const [log, setLog] = useState<SupplementLog[]>(supplements);
    const [isAdding, setIsAdding] = useState(false);
    const [newSupplement, setNewSupplement] = useState<SupplementLog>({ name: '', dosage: '', timing: '', purpose: '', effectiveness: 7 });

    const handleSave = () => {
        onUpdate(log);
        onBack();
    };
    
    const addSupplement = () => {
        setLog(prev => [...prev, newSupplement]);
        setIsAdding(false);
        setNewSupplement({ name: '', dosage: '', timing: '', purpose: '', effectiveness: 7 });
    };

    const removeSupplement = (index: number) => {
        setLog(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{t('biohacking.supplements.title')}</h1>
                    <p className="text-gray-400">{t('biohacking.supplements.description')}</p>
                </div>
            </div>

             <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('biohacking.supplements.todaysLog')}</h3>
                    {!isAdding && <button onClick={() => setIsAdding(true)} className="bg-orange-600 px-3 py-1 rounded text-sm font-semibold hover:bg-orange-700">{t('biohacking.supplements.logSupplement')}</button>}
                </div>
                {isAdding && (
                    <div className="p-4 bg-gray-800 rounded-lg mb-4 space-y-3">
                        <h4 className="font-semibold">{t('biohacking.supplements.addSupplement')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm">{t('biohacking.supplements.name')}</label><input type="text" value={newSupplement.name} onChange={e => setNewSupplement(s => ({...s, name: e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                            <div><label className="text-sm">{t('biohacking.supplements.dosage')}</label><input type="text" value={newSupplement.dosage} onChange={e => setNewSupplement(s => ({...s, dosage: e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                            <div><label className="text-sm">{t('biohacking.supplements.timing')}</label><input type="text" value={newSupplement.timing} onChange={e => setNewSupplement(s => ({...s, timing: e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                             <div><label className="text-sm">{t('biohacking.supplements.purpose')}</label><input type="text" value={newSupplement.purpose} onChange={e => setNewSupplement(s => ({...s, purpose: e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                        </div>
                        <div><label className="text-sm">{t('biohacking.supplements.effectiveness')}: {newSupplement.effectiveness}</label><input type="range" min="1" max="10" value={newSupplement.effectiveness} onChange={e=>setNewSupplement(m=>({...m, effectiveness: +e.target.value}))} className="w-full accent-orange-500"/></div>
                        <div className="flex gap-2 justify-end"><button onClick={()=>setIsAdding(false)} className="bg-gray-600 px-3 py-1 text-xs rounded">Cancelar</button><button onClick={addSupplement} className="bg-orange-600 px-3 py-1 text-xs rounded">Adicionar</button></div>
                    </div>
                )}
                 <div className="space-y-3">
                    {log.length > 0 ? log.map((sup, i) => (
                        <div key={i} className="p-3 bg-gray-800/50 rounded flex justify-between items-start">
                            <div>
                                <div className="font-semibold">{sup.name} <span className="font-normal text-sm text-gray-400">({sup.dosage})</span></div>
                                <div className="text-xs text-gray-300">{sup.purpose} - @ {sup.timing}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-400">{t('biohacking.metrics.effectiveness')}: {sup.effectiveness}/10</div>
                                <button onClick={() => removeSupplement(i)} className="text-xs text-red-500 hover:text-red-400 mt-1">Remover</button>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 text-center">{t('biohacking.supplements.noSupplements')}</p>}
                </div>
             </div>

            <button onClick={handleSave} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg">Salvar Stack de Suplementos</button>
        </div>
    );
};
export default SupplementTracker;
