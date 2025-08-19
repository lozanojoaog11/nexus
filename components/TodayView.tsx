import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TodayView: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="p-8 text-white w-full h-full animate-fade-in-up">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">{t('todayView.title')}</h1>
                <p className="text-gray-400 mt-1">{t('todayView.subtitle')}</p>
            </header>
            {/* O conteúdo da TodayView será adicionado nas próximas etapas */}
        </div>
    );
};

export default TodayView;
