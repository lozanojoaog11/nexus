import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SliderInput } from './common';

export interface CognitiveData {
    reactionTime: number;
    mentalClarity: number;
    focus: number;
    creativity: number;
}

interface CognitiveStepProps {
    cognitive: CognitiveData;
    setCognitive: React.Dispatch<React.SetStateAction<CognitiveData>>;
}

const CognitiveStep: React.FC<CognitiveStepProps> = ({ cognitive, setCognitive }) => {
    const { t } = useTranslation();
    const [reactionTest, setReactionTest] = useState<'ready' | 'waiting' | 'click' | 'result'>('ready');
    const [testStartTime, setTestStartTime] = useState(0);

    const startReactionTest = () => {
        setReactionTest('waiting');
        const delay = Math.random() * 2000 + 1500; // 1.5-3.5s
        setTimeout(() => {
            setReactionTest('click');
            setTestStartTime(Date.now());
        }, delay);
    };

    const handleReactionClick = () => {
        if (reactionTest === 'click') {
            const reactionTime = Date.now() - testStartTime;
            setCognitive(prev => ({ ...prev, reactionTime }));
            setReactionTest('result');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('neuralAlignment.cognitiveTitle')}</h2>
                <p className="text-gray-400">{t('neuralAlignment.cognitiveSubtitle')}</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('neuralAlignment.reactionTest')}</h3>

                {reactionTest === 'ready' && (
                    <button
                        onClick={startReactionTest}
                        className="w-full h-40 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border border-gray-600 hover:from-gray-600 hover:to-gray-700 transition-all text-white font-medium"
                    >
                        {t('neuralAlignment.startTest')}
                    </button>
                )}

                {reactionTest === 'waiting' && (
                    <div className="w-full h-40 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{t('neuralAlignment.wait')}</span>
                    </div>
                )}

                {reactionTest === 'click' && (
                    <button
                        onClick={handleReactionClick}
                        className="w-full h-40 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center animate-pulse"
                    >
                        <span className="text-white font-bold text-3xl">{t('neuralAlignment.clickNow')}</span>
                    </button>
                )}

                {reactionTest === 'result' && (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-3xl">{cognitive.reactionTime}ms</span>
                        <span className="text-blue-200 mt-2">
                            {cognitive.reactionTime < 250 ? t('neuralAlignment.excellent') :
                                cognitive.reactionTime < 350 ? t('neuralAlignment.veryGood') :
                                    cognitive.reactionTime < 450 ? t('neuralAlignment.good') : t('neuralAlignment.canImprove')}
                        </span>
                        <button
                            onClick={() => setReactionTest('ready')}
                            className="mt-3 px-4 py-2 bg-white/20 rounded text-sm"
                        >
                            {t('neuralAlignment.testAgain')}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <SliderInput
                    label={t('neuralAlignment.mentalClarity')}
                    value={cognitive.mentalClarity}
                    onChange={(val) => setCognitive(prev => ({ ...prev, mentalClarity: val }))}
                    color="purple"
                />
                <SliderInput
                    label={t('neuralAlignment.focusCapacity')}
                    value={cognitive.focus}
                    onChange={(val) => setCognitive(prev => ({ ...prev, focus: val }))}
                    color="blue"
                />
                <SliderInput
                    label={t('neuralAlignment.creativeState')}
                    value={cognitive.creativity}
                    onChange={(val) => setCognitive(prev => ({ ...prev, creativity: val }))}
                    color="pink"
                />
            </div>
        </div>
    );
};

export default CognitiveStep;
