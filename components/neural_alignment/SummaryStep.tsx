import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { BiometricData } from './BiometricStep';
import { CognitiveData } from './CognitiveStep';
import { IntentionData } from './IntentionStep';
import { MetricCard } from './common';

interface SummaryStepProps {
    biometrics: BiometricData;
    cognitive: CognitiveData;
    intention: IntentionData;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ biometrics, cognitive, intention }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('neuralAlignment.summaryTitle')}</h2>
                <p className="text-gray-400">{t('neuralAlignment.summarySubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <MetricCard label={t('neuralAlignment.sleepQuality')} value={`${biometrics.sleepQuality}/10`} />
                <MetricCard label={t('neuralAlignment.physicalEnergy')} value={`${biometrics.physicalEnergy}/10`} />
                <MetricCard label={t('neuralAlignment.mentalClarity')} value={`${cognitive.mentalClarity}/10`} />
                <MetricCard label={t('neuralAlignment.reactionTest')} value={`${cognitive.reactionTime}ms`} />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl">
                <h3 className="text-white font-semibold mb-2">{t('neuralAlignment.intentionToday')}</h3>
                <p className="text-gray-300 text-sm">{intention.primaryFocus || t('neuralAlignment.notDefined')}</p>
            </div>
        </div>
    );
};

export default SummaryStep;
