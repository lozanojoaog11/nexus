import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SliderInput } from './common';

export interface BiometricData {
    sleepQuality: number;
    sleepHours: number;
    wakeTime: string;
    hydrationLevel: number;
    physicalEnergy: number;
    stressLevel: number;
}

interface BiometricStepProps {
    biometrics: BiometricData;
    setBiometrics: React.Dispatch<React.SetStateAction<BiometricData>>;
}

const BiometricStep: React.FC<BiometricStepProps> = ({ biometrics, setBiometrics }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('neuralAlignment.biometricTitle')}</h2>
                <p className="text-gray-400">{t('neuralAlignment.biometricSubtitle')}</p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700" />
                        <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="6" fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - biometrics.sleepQuality / 10)}`}
                            className="transition-all duration-500" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{biometrics.sleepQuality}</span>
                        <span className="text-sm text-gray-400">{t('neuralAlignment.sleepQuality')}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.sleepHours')}</label>
                    <input
                        type="range" min="4" max="12" step="0.5"
                        value={biometrics.sleepHours}
                        onChange={(e) => setBiometrics(prev => ({ ...prev, sleepHours: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-500"
                    />
                    <span className="text-white text-sm">{biometrics.sleepHours}h</span>
                </div>
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.wakeTime')}</label>
                    <input
                        type="time"
                        value={biometrics.wakeTime}
                        onChange={(e) => setBiometrics(prev => ({ ...prev, wakeTime: e.target.value }))}
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <SliderInput
                    label={t('neuralAlignment.sleepQuality')}
                    value={biometrics.sleepQuality}
                    onChange={(val) => setBiometrics(prev => ({ ...prev, sleepQuality: val }))}
                    color="blue"
                />
                <SliderInput
                    label={t('neuralAlignment.physicalEnergy')}
                    value={biometrics.physicalEnergy}
                    onChange={(val) => setBiometrics(prev => ({ ...prev, physicalEnergy: val }))}
                    color="green"
                />
                <SliderInput
                    label={t('neuralAlignment.hydrationLevel')}
                    value={biometrics.hydrationLevel}
                    onChange={(val) => setBiometrics(prev => ({ ...prev, hydrationLevel: val }))}
                    color="cyan"
                />
                <SliderInput
                    label={t('neuralAlignment.stressLevel')}
                    value={biometrics.stressLevel}
                    onChange={(val) => setBiometrics(prev => ({ ...prev, stressLevel: val }))}
                    color="red"
                    inverted
                />
            </div>
        </div>
    );
};

export default BiometricStep;
