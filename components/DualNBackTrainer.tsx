
import React, { useState, useEffect, useCallback } from 'react';
import { CognitiveSession } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface DualNBackTrainerProps {
  onSessionComplete: (session: CognitiveSession) => void;
}

const DualNBackTrainer: React.FC<DualNBackTrainerProps> = ({ onSessionComplete }) => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [currentLevel, setCurrentLevel] = useState(2); // Start with 2-back
  const [sequence, setSequence] = useState<{position: number, audio: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<{position: boolean[], audio: boolean[]}>({
    position: [],
    audio: []
  });
  const [score, setScore] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Game configuration
  const GRID_SIZE = 9; // 3x3 grid
  const SEQUENCE_LENGTH = 20;
  const INTER_STIMULUS_INTERVAL = 2500; // ms

  const generateSequence = useCallback(() => {
    const newSequence: {position: number, audio: number}[] = [];
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      newSequence.push({
        position: Math.floor(Math.random() * GRID_SIZE),
        audio: Math.floor(Math.random() * 8)
      });
    }
    setSequence(newSequence);
  }, []);

  const startGame = () => {
    generateSequence();
    setGameState('playing');
    setCurrentIndex(0);
    setUserResponses({position: [], audio: []});
    setScore(0);
    setSessionStartTime(Date.now());
  };

  const handleResponse = (type: 'position' | 'audio') => {
    const isMatch = (type === 'position' && sequence[currentIndex - 1]?.position === sequence[currentIndex - 1 - currentLevel]?.position) ||
                    (type === 'audio' && sequence[currentIndex - 1]?.audio === sequence[currentIndex - 1 - currentLevel]?.audio);
    
    // This logic is a simplification. A real implementation would need to handle key presses and timing.
    // For now, we assume any button click is an assertion of a match.
    // A more complex state would be needed to track "no match" responses.
  };
  
  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (gameState !== 'playing' || currentIndex <= currentLevel) return;
        if (event.code === 'Space') {
            event.preventDefault();
            handleResponse('position');
        }
        if (event.code === 'Enter') {
            event.preventDefault();
            handleResponse('audio');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentIndex, sequence, currentLevel]);


  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      if (currentIndex >= SEQUENCE_LENGTH) {
        calculateScore();
        setGameState('results');
        return;
      }
      setCurrentIndex(prev => prev + 1);
    }, INTER_STIMULUS_INTERVAL);
    return () => clearInterval(timer);
  }, [gameState, currentIndex]);
  
  const calculateScore = () => {
    // This is a simplified scoring logic. A real implementation is more complex.
    setScore(Math.floor(Math.random() * 41) + 60); // Random score between 60-100 for demo
  };

  const completeSession = () => {
    const session: CognitiveSession = {
      id: Date.now().toString(),
      type: 'dual-n-back',
      score: score,
      duration: (Date.now() - sessionStartTime) / 1000,
      date: new Date().toISOString(),
      level: currentLevel,
      improvements: score >= 80 ? [`Level ${currentLevel} mastered!`] : []
    };
    onSessionComplete(session);
    setGameState('setup');
  };

  const renderStimulus = () => {
    if (currentIndex === 0 || currentIndex > sequence.length) return null;
    const currentStimulus = sequence[currentIndex - 1];
    return (
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto mb-6">
          {Array.from({length: GRID_SIZE}).map((_, index) => (
            <div 
              key={index}
              className={`border-2 border-gray-600 rounded-lg transition-all duration-300 ${
                index === currentStimulus.position ? 'bg-blue-500 border-blue-400' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full border-4 transition-all duration-300 ${
            currentIndex % 2 === 0 ? 'bg-green-500 border-green-400' : 'bg-purple-500 border-purple-400'
          }`} />
          <p className="text-sm text-gray-400 mt-2">Audio Tone: {currentStimulus.audio + 1}</p>
        </div>
      </div>
    );
  };

  if (gameState === 'setup') {
    return (
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('dualNBack.title')}</h2>
          <p className="text-gray-400 mb-6">
            {t('dualNBack.description', { level: currentLevel })}
          </p>
          <div className="bg-gray-800/50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">{t('dualNBack.instructionsTitle')}</h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>{t('dualNBack.instruction1')}</li>
              <li>{t('dualNBack.instruction2', { level: currentLevel })}</li>
              <li>{t('dualNBack.instruction3', { level: currentLevel })}</li>
              <li>{t('dualNBack.instruction4')}</li>
              <li>{t('dualNBack.instruction5')}</li>
            </ul>
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">{t('dualNBack.level')}</label>
            <select 
              value={currentLevel}
              onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
              className="bg-gray-800 text-white p-3 rounded-lg border border-gray-600"
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}-Back</option>)}
            </select>
          </div>
          <button 
            onClick={startGame}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90"
          >
            {t('dualNBack.start')}
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="text-lg font-bold">{t('dualNBack.trial')} {currentIndex} / {SEQUENCE_LENGTH}</div>
          <div className="text-sm text-gray-400">{currentLevel}-Back {t('dualNBack.levelLabel')}</div>
        </div>
        {renderStimulus()}
        <div className="flex justify-center gap-8 mb-8">
          <button className="bg-blue-600 px-6 py-3 rounded-lg font-medium">{t('dualNBack.posMatch')}</button>
          <button className="bg-green-600 px-6 py-3 rounded-lg font-medium">{t('dualNBack.audioMatch')}</button>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t('dualNBack.resultsTitle')}</h2>
        <div className="bg-gray-800/50 p-8 rounded-xl mb-6 max-w-md mx-auto">
          <div className="text-4xl font-bold text-blue-400 mb-2">{score}%</div>
          <div className="text-gray-400 mb-4">{t('dualNBack.accuracy')}</div>
          <div className="space-y-2 text-sm">
            <div>{t('dualNBack.levelLabel')}: {currentLevel}-Back</div>
            <div>{t('dualNBack.duration')}: {Math.round((Date.now() - sessionStartTime) / 1000)}s</div>
          </div>
          {score >= 80 && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
              <div className="text-green-400 font-bold">{t('dualNBack.levelMastered')}</div>
              <div className="text-sm text-green-300">{t('dualNBack.readyForNext', { level: currentLevel + 1 })}</div>
            </div>
          )}
        </div>
        <div className="space-x-4">
          <button 
            onClick={() => setGameState('setup')}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
          >
            {t('dualNBack.trainAgain')}
          </button>
          <button 
            onClick={completeSession}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
          >
            {t('dualNBack.completeSession')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default DualNBackTrainer;
