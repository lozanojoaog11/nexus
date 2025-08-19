import React, { useState } from 'react';
import { DailyCheckin } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import BiometricStep, { BiometricData } from './neural_alignment/BiometricStep';
import CognitiveStep, { CognitiveData } from './neural_alignment/CognitiveStep';
import IntentionStep, { IntentionData } from './neural_alignment/IntentionStep';
import SummaryStep from './neural_alignment/SummaryStep';

type Step = 'biometric' | 'cognitive' | 'intention' | 'summary';

const NeuralAlignmentModal: React.FC<{
  onConfirm: (data: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>) => void;
  isProcessing: boolean;
}> = ({ onConfirm, isProcessing }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('biometric');
  const [biometrics, setBiometrics] = useState<BiometricData>({
    sleepQuality: 7,
    sleepHours: 8,
    wakeTime: '07:00',
    hydrationLevel: 7,
    physicalEnergy: 7,
    stressLevel: 4
  });
  
  const [cognitive, setCognitive] = useState<CognitiveData>({
    reactionTime: 0,
    mentalClarity: 7,
    focus: 7,
    creativity: 7
  });
  
  const [intention, setIntention] = useState<IntentionData>({
    primaryFocus: '',
    challengeToday: '',
    successMetric: '',
    energyAllocation: { work: 60, learning: 25, recovery: 15 }
  });

  const steps: Step[] = ['biometric', 'cognitive', 'intention', 'summary'];

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const checkinData = {
      energia: biometrics.physicalEnergy,
      clareza: cognitive.mentalClarity,
      momentum: cognitive.focus,
      notes: `Biometrics: Sleep ${biometrics.sleepQuality}/10, Energy ${biometrics.physicalEnergy}/10
Cognitive: RT ${cognitive.reactionTime}ms, Clarity ${cognitive.mentalClarity}/10
Intention: ${intention.primaryFocus}
Challenge: ${intention.challengeToday}`,
      completedHabitIds: []
    };
    onConfirm(checkinData);
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        
        <div className="mb-8">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{width: `${((currentStepIndex) / (steps.length - 1)) * 100}%`}}
            ></div>
          </div>
        </div>

        {!isProcessing && (
          <>
            {currentStep === 'biometric' && <BiometricStep biometrics={biometrics} setBiometrics={setBiometrics} />}
            {currentStep === 'cognitive' && <CognitiveStep cognitive={cognitive} setCognitive={setCognitive} />}
            {currentStep === 'intention' && <IntentionStep intention={intention} setIntention={setIntention} />}
            {currentStep === 'summary' && <SummaryStep biometrics={biometrics} cognitive={cognitive} intention={intention} />}
          </>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-400">{t('neuralAlignment.generatingDirective')}</p>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-8 flex gap-4">
            {currentStepIndex > 0 && (
              <button 
                onClick={() => setCurrentStep(steps[currentStepIndex - 1])}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                {t('neuralAlignment.previous')}
              </button>
            )}
            <button 
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {currentStep === 'summary' ? t('neuralAlignment.complete') : t('neuralAlignment.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralAlignmentModal;