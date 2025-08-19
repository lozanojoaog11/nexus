import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { EnergySlider } from './common';

export interface IntentionData {
    primaryFocus: string;
    challengeToday: string;
    successMetric: string;
    energyAllocation: {
        work: number;
        learning: number;
        recovery: number;
    };
}

interface IntentionStepProps {
    intention: IntentionData;
    setIntention: React.Dispatch<React.SetStateAction<IntentionData>>;
}

const IntentionStep: React.FC<IntentionStepProps> = ({ intention, setIntention }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('neuralAlignment.intentionTitle')}</h2>
                <p className="text-gray-400">{t('neuralAlignment.intentionSubtitle')}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.primaryFocus')}</label>
                    <input
                        type="text"
                        value={intention.primaryFocus}
                        onChange={(e) => setIntention(prev => ({ ...prev, primaryFocus: e.target.value }))}
                        placeholder={t('neuralAlignment.primaryFocusPlaceholder')}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.biggestChallenge')}</label>
                    <input
                        type="text"
                        value={intention.challengeToday}
                        onChange={(e) => setIntention(prev => ({ ...prev, challengeToday: e.target.value }))}
                        placeholder={t('neuralAlignment.biggestChallengePlaceholder')}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.successMetric')}</label>
                    <input
                        type="text"
                        value={intention.successMetric}
                        onChange={(e) => setIntention(prev => ({ ...prev, successMetric: e.target.value }))}
                        placeholder={t('neuralAlignment.successMetricPlaceholder')}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl">
                <h3 className="text-white font-semibold mb-4">{t('neuralAlignment.energyAllocation')}</h3>
                <div className="space-y-3">
                    <EnergySlider
                        label={t('neuralAlignment.work')}
                        value={intention.energyAllocation.work}
                        onChange={(val) => setIntention(prev => ({
                            ...prev,
                            energyAllocation: { ...prev.energyAllocation, work: val }
                        }))}
                        color="blue"
                    />
                    <EnergySlider
                        label={t('neuralAlignment.learning')}
                        value={intention.energyAllocation.learning}
                        onChange={(val) => setIntention(prev => ({
                            ...prev,
                            energyAllocation: { ...prev.energyAllocation, learning: val }
                        }))}
                        color="green"
                    />
                    <EnergySlider
                        label={t('neuralAlignment.recovery')}
                        value={intention.energyAllocation.recovery}
                        onChange={(val) => setIntention(prev => ({
                            ...prev,
                            energyAllocation: { ...prev.energyAllocation, recovery: val }
                        }))}
                        color="purple"
                    />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    {t('neuralAlignment.total')}: {intention.energyAllocation.work + intention.energyAllocation.learning + intention.energyAllocation.recovery}%
                </div>
            </div>
        </div>
    );
};

export default IntentionStep;
