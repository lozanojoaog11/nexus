import React from 'react';
import { FlowSession } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionHistoryCardProps {
    session: FlowSession;
}

const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({ session }) => {
    const { t, language } = useTranslation();
    return (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">🎯</div>
                <div>
                    <div className="text-white font-medium">{session.taskCompleted || t('flowLab.history.untitled')}</div>
                    <div className="text-gray-400 text-sm">{new Date(session.startTime).toLocaleDateString(language)} • {session.duration}{t('flowLab.minutes')}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-white font-bold">{session.flowRating}/10</div>
                <div className="text-gray-400 text-xs">{session.distractionCount} {t('flowLab.history.distractions')}</div>
            </div>
        </div>
    );
};

export default SessionHistoryCard;
