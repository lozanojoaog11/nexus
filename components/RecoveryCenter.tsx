
import React, { useState } from 'react';
import { RecoveryData, RecoveryActivity } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface RecoveryCenterProps {
  recoveryData: RecoveryData | undefined;
  onUpdate: (data: RecoveryData) => void;
  onBack: () => void;
}

const RecoveryCenter: React.FC<RecoveryCenterProps> = ({ recoveryData, onUpdate, onBack }) => {
    const { t } = useTranslation();
    const [data, setData] = useState<RecoveryData>(recoveryData || {
        hrvScore: 60, restingHeartRate: 55, stressLevel: 4, recoveryActivities: [], readiness: 7
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newActivity, setNewActivity] = useState<Omit<RecoveryActivity, 'quality'>>({type: 'meditation', duration: 15});
    const [newActivityQuality, setNewActivityQuality] = useState(8);

    const handleSave = () => {
        onUpdate(data);
        onBack();
    };

    const addActivity = () => {
        setData(prev => ({...prev, recoveryActivities: [...prev.recoveryActivities, {...newActivity, quality: newActivityQuality}]}));
        setIsAdding(false);
        setNewActivity({type: 'meditation', duration: 15});
        setNewActivityQuality(8);
    };

    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{t('biohacking.recovery.title')}</h1>
                    <p className="text-gray-400">{t('biohacking.recovery.description')}</p>
                </div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6 text-center">
                <h3 className="text-lg font-semibold mb-2">{t('biohacking.recovery.readiness')}</h3>
                <div className="text-5xl font-bold text-blue-400">{data.readiness}/10</div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('biohacking.recovery.metrics')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="text-sm text-gray-400 mb-1">{t('biohacking.recovery.hrv')}</label><input type="number" value={data.hrvScore} onChange={e => setData(d => ({...d, hrvScore: +e.target.value}))} className="w-full bg-gray-800 p-2 rounded"/></div>
                    <div><label className="text-sm text-gray-400 mb-1">{t('biohacking.recovery.restingHR')}</label><input type="number" value={data.restingHeartRate} onChange={e => setData(d => ({...d, restingHeartRate: +e.target.value}))} className="w-full bg-gray-800 p-2 rounded"/></div>
                    <div><label className="text-sm text-gray-400 mb-1">{t('biohacking.recovery.stressLevel')}: {data.stressLevel}</label><input type="range" min="1" max="10" value={data.stressLevel} onChange={e => setData(d => ({...d, stressLevel: +e.target.value}))} className="w-full accent-blue-500"/></div>
                </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('biohacking.recovery.activities')}</h3>
                    {!isAdding && <button onClick={() => setIsAdding(true)} className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700">+</button>}
                </div>
                {isAdding && (
                    <div className="p-4 bg-gray-800 rounded-lg mb-4 space-y-3">
                        <h4 className="font-semibold">{t('biohacking.recovery.activity.add')}</h4>
                        <div><label className="text-sm">{t('biohacking.recovery.activity.type')}</label><select value={newActivity.type} onChange={e=>setNewActivity(m=>({...m, type: e.target.value as any}))} className="w-full bg-gray-700 p-2 rounded mt-1"><option value="meditation">{t('biohacking.recovery.activity.types.meditation')}</option><option value="breathing">{t('biohacking.recovery.activity.types.breathing')}</option><option value="stretching">{t('biohacking.recovery.activity.types.stretching')}</option><option value="massage">{t('biohacking.recovery.activity.types.massage')}</option><option value="nap">{t('biohacking.recovery.activity.types.nap')}</option></select></div>
                        <div><label className="text-sm">{t('biohacking.recovery.activity.duration')}</label><input type="number" value={newActivity.duration} onChange={e=>setNewActivity(m=>({...m, duration: +e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                        <div><label className="text-sm">{t('biohacking.recovery.activity.quality')}: {newActivityQuality}</label><input type="range" min="1" max="10" value={newActivityQuality} onChange={e=>setNewActivityQuality(+e.target.value)} className="w-full accent-blue-500"/></div>
                        <div className="flex gap-2 justify-end"><button onClick={()=>setIsAdding(false)} className="bg-gray-600 px-3 py-1 text-xs rounded">Cancelar</button><button onClick={addActivity} className="bg-blue-600 px-3 py-1 text-xs rounded">Adicionar</button></div>
                    </div>
                )}
                 <div className="space-y-3">
                    {data.recoveryActivities.length > 0 ? data.recoveryActivities.map((act, i) => (
                        <div key={i} className="p-3 bg-gray-800/50 rounded flex justify-between">
                            <div><span className="font-semibold capitalize">{t(`biohacking.recovery.activity.types.${act.type}`)}</span> - <span className="text-gray-300">{act.duration} min</span></div>
                            <div className="text-sm text-gray-400">{t('biohacking.metrics.quality')}: {act.quality}/10</div>
                        </div>
                    )) : <p className="text-gray-500 text-center">{t('biohacking.recovery.noActivities')}</p>}
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3 rounded-lg">{t('biohacking.recovery.save')}</button>
        </div>
    );
};
export default RecoveryCenter;
