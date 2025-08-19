import React, { useState } from 'react';
import { FlowSession } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionCompletionViewProps {
    session: FlowSession;
    onSave: (session: FlowSession, earnedXp: number) => void;
    onDiscard: () => void;
}

const SessionCompletionView: React.FC<SessionCompletionViewProps> = ({ session, onSave, onDiscard }) => {
    const { t } = useTranslation();
    const [flowRating, setFlowRating] = useState(7);
    const [focusQuality, setFocusQuality] = useState(7);
    const [notes, setNotes] = useState('');
    const handleSave = () => {
        const earnedXp = Math.round(session.duration * (flowRating / 10) * Math.max(0, (1 - (session.distractionCount / 10))));
        onSave({ ...session, flowRating, focusQuality, notes }, earnedXp);
    };
    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">{t('flowLab.complete.title')}</h2>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                    <h3 className="font-semibold mb-4">{t('flowLab.complete.summary')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>{t('flowLab.complete.duration')}: {session.duration} {t('flowLab.minutes')}</div>
                        <div>{t('flowLab.complete.distractions')}: {session.distractionCount}</div>
                        <div>{t('flowLab.complete.task')}: {session.taskCompleted}</div>
                        <div>{t('flowLab.complete.environment')}: {session.environment.musicType}</div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.flowQuality')}: {flowRating}</label>
                        <input type="range" min="1" max="10" value={flowRating} onChange={(e) => setFlowRating(parseInt(e.target.value))} className="w-full accent-purple-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.focusQuality')}: {focusQuality}</label>
                        <input type="range" min="1" max="10" value={focusQuality} onChange={(e) => setFocusQuality(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('flowLab.complete.notes')}</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('flowLab.complete.notesPlaceholder')} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 rows-3" />
                    </div>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={onDiscard} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg">{t('flowLab.complete.discard')}</button>
                    <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 py-3 rounded-lg font-bold">{t('flowLab.complete.save')}</button>
                </div>
            </div>
        </div>
    );
};

export default SessionCompletionView;
