
import React, { useState } from 'react';
import { DailyCheckin } from '../types';
import { useTranslation } from '../hooks/useTranslation';

// --- TYPES ---
type Step = 'biometric' | 'cognitive' | 'intention' | 'summary';

interface BiometricData {
  sleepQuality: number; // 1-10
  sleepHours: number; // 4-12
  wakeTime: string; // HH:mm
  hydrationLevel: number; // 1-10
  physicalEnergy: number; // 1-10
  stressLevel: number; // 1-10
}

interface CognitiveData {
  reactionTime: number; // milliseconds
  mentalClarity: number; // 1-10
  focus: number; // 1-10
  creativity: number; // 1-10
}

interface IntentionData {
  primaryFocus: string;
  challengeToday: string;
  successMetric: string;
  energyAllocation: {
    work: number; // 0-100%
    learning: number; // 0-100%
    recovery: number; // 0-100%
  };
}

// --- HELPER COMPONENTS ---
const SliderInput: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
  inverted?: boolean;
}> = ({ label, value, onChange, color, inverted = false }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm text-gray-400">{label}</label>
      <span className={`text-lg font-bold text-${color}-400`}>{value}</span>
    </div>
    <input
      type="range" min="1" max="10" step="1"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={`w-full accent-${color}-500`}
    />
  </div>
);

const EnergySlider: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
}> = ({ label, value, onChange, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm text-gray-400">{label}</label>
      <span className={`text-sm font-bold text-${color}-400`}>{value}%</span>
    </div>
    <input
      type="range" min="0" max="100" step="5"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={`w-full accent-${color}-500`}
    />
  </div>
);

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-800/30 p-3 rounded-lg text-center">
    <div className="text-white font-bold text-lg">{value}</div>
    <div className="text-gray-400 text-xs">{label}</div>
  </div>
);


// --- STEP COMPONENTS ---
const BiometricStep: React.FC<{
  biometrics: BiometricData;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricData>>;
}> = ({ biometrics, setBiometrics }) => {
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
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700"/>
              <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - biometrics.sleepQuality / 10)}`}
                      className="transition-all duration-500" strokeLinecap="round"/>
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
              onChange={(e) => setBiometrics(prev => ({...prev, sleepHours: parseFloat(e.target.value)}))}
              className="w-full accent-blue-500"
            />
            <span className="text-white text-sm">{biometrics.sleepHours}h</span>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.wakeTime')}</label>
            <input
              type="time"
              value={biometrics.wakeTime}
              onChange={(e) => setBiometrics(prev => ({...prev, wakeTime: e.target.value}))}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <SliderInput 
            label={t('neuralAlignment.sleepQuality')}
            value={biometrics.sleepQuality}
            onChange={(val) => setBiometrics(prev => ({...prev, sleepQuality: val}))}
            color="blue" 
          />
          <SliderInput 
            label={t('neuralAlignment.physicalEnergy')}
            value={biometrics.physicalEnergy}
            onChange={(val) => setBiometrics(prev => ({...prev, physicalEnergy: val}))}
            color="green" 
          />
          <SliderInput 
            label={t('neuralAlignment.hydrationLevel')}
            value={biometrics.hydrationLevel}
            onChange={(val) => setBiometrics(prev => ({...prev, hydrationLevel: val}))}
            color="cyan" 
          />
          <SliderInput 
            label={t('neuralAlignment.stressLevel')}
            value={biometrics.stressLevel}
            onChange={(val) => setBiometrics(prev => ({...prev, stressLevel: val}))}
            color="red" 
            inverted 
          />
        </div>
      </div>
    );
};
const CognitiveStep: React.FC<{
  cognitive: CognitiveData;
  setCognitive: React.Dispatch<React.SetStateAction<CognitiveData>>;
}> = ({ cognitive, setCognitive }) => {
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
      setCognitive(prev => ({...prev, reactionTime}));
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
          onChange={(val) => setCognitive(prev => ({...prev, mentalClarity: val}))}
          color="purple" 
        />
        <SliderInput 
          label={t('neuralAlignment.focusCapacity')}
          value={cognitive.focus}
          onChange={(val) => setCognitive(prev => ({...prev, focus: val}))}
          color="blue" 
        />
        <SliderInput 
          label={t('neuralAlignment.creativeState')}
          value={cognitive.creativity}
          onChange={(val) => setCognitive(prev => ({...prev, creativity: val}))}
          color="pink" 
        />
      </div>
    </div>
  );
};

const IntentionStep: React.FC<{
  intention: IntentionData;
  setIntention: React.Dispatch<React.SetStateAction<IntentionData>>;
}> = ({ intention, setIntention }) => {
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
                onChange={(e) => setIntention(prev => ({...prev, primaryFocus: e.target.value}))}
                placeholder={t('neuralAlignment.primaryFocusPlaceholder')}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.biggestChallenge')}</label>
                <input
                type="text"
                value={intention.challengeToday}
                onChange={(e) => setIntention(prev => ({...prev, challengeToday: e.target.value}))}
                placeholder={t('neuralAlignment.biggestChallengePlaceholder')}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('neuralAlignment.successMetric')}</label>
                <input
                type="text"
                value={intention.successMetric}
                onChange={(e) => setIntention(prev => ({...prev, successMetric: e.target.value}))}
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
                    energyAllocation: {...prev.energyAllocation, work: val}
                }))}
                color="blue"
                />
                <EnergySlider 
                label={t('neuralAlignment.learning')}
                value={intention.energyAllocation.learning}
                onChange={(val) => setIntention(prev => ({
                    ...prev, 
                    energyAllocation: {...prev.energyAllocation, learning: val}
                }))}
                color="green"
                />
                <EnergySlider 
                label={t('neuralAlignment.recovery')}
                value={intention.energyAllocation.recovery}
                onChange={(val) => setIntention(prev => ({
                    ...prev, 
                    energyAllocation: {...prev.energyAllocation, recovery: val}
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

const SummaryStep: React.FC<{
  biometrics: BiometricData;
  cognitive: CognitiveData;
  intention: IntentionData;
}> = ({ biometrics, cognitive, intention }) => {
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


// --- MAIN COMPONENT ---
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
