import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CognitiveSession } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface DualNBackTrainerProps {
  onSessionComplete: (session: CognitiveSession) => void;
}

const DualNBackTrainer: React.FC<DualNBackTrainerProps> = ({ onSessionComplete }) => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [currentLevel, setCurrentLevel] = useState(2);
  const [sequence, setSequence] = useState<{position: number, audio: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  
  // State for scoring
  const scoreRef = useRef({
      posHits: 0, posMisses: 0, posFalseAlarms: 0,
      audioHits: 0, audioMisses: 0, audioFalseAlarms: 0,
      posOpportunities: 0, audioOpportunities: 0
  });
  const userActionRef = useRef({ pos: false, audio: false });

  // Game configuration
  const GRID_SIZE = 9; // 3x3 grid
  const SEQUENCE_LENGTH = 20;
  const INTER_STIMULUS_INTERVAL = 2500; // ms

  const generateSequence = useCallback((level: number) => {
    let newSequence: {position: number, audio: number}[] = [];
    for (let i = 0; i < SEQUENCE_LENGTH + level; i++) {
        let posMatch = Math.random() < 0.25; // ~25% chance of match
        let audioMatch = Math.random() < 0.25;
        
        let position = posMatch && i >= level ? newSequence[i - level].position : Math.floor(Math.random() * GRID_SIZE);
        let audio = audioMatch && i >= level ? newSequence[i - level].audio : Math.floor(Math.random() * 8);

        newSequence.push({ position, audio });
    }
    setSequence(newSequence);
  }, [GRID_SIZE, SEQUENCE_LENGTH]);


  const startGame = () => {
    generateSequence(currentLevel);
    setGameState('playing');
    setCurrentIndex(0);
    scoreRef.current = { posHits: 0, posMisses: 0, posFalseAlarms: 0, audioHits: 0, audioMisses: 0, audioFalseAlarms: 0, posOpportunities: 0, audioOpportunities: 0 };
    setScore(0);
    setSessionStartTime(Date.now());
  };

  const handleResponse = useCallback((type: 'position' | 'audio') => {
      if (gameState !== 'playing' || currentIndex < currentLevel) return;
      userActionRef.current[type === 'position' ? 'pos' : 'audio'] = true;
  }, [gameState, currentIndex, currentLevel]);
  
  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'KeyA') handleResponse('position'); // 'A' for position
        if (event.code === 'KeyL') handleResponse('audio');    // 'L' for audio
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResponse]);


  const processTurn = useCallback(() => {
    if (currentIndex < currentLevel) return;

    const currentTurn = sequence[currentIndex];
    const targetTurn = sequence[currentIndex - currentLevel];
    
    const isPosMatch = currentTurn.position === targetTurn.position;
    const isAudioMatch = currentTurn.audio === targetTurn.audio;

    if (isPosMatch) scoreRef.current.posOpportunities++;
    if (isAudioMatch) scoreRef.current.audioOpportunities++;
    
    // Position scoring
    if (userActionRef.current.pos) {
        if (isPosMatch) scoreRef.current.posHits++;
        else scoreRef.current.posFalseAlarms++;
    } else {
        if (isPosMatch) scoreRef.current.posMisses++;
    }

    // Audio scoring
    if (userActionRef.current.audio) {
        if (isAudioMatch) scoreRef.current.audioHits++;
        else scoreRef.current.audioFalseAlarms++;
    } else {
        if (isAudioMatch) scoreRef.current.audioMisses++;
    }

    userActionRef.current = { pos: false, audio: false };
  }, [currentIndex, currentLevel, sequence]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
        processTurn();
        if (currentIndex >= (SEQUENCE_LENGTH + currentLevel - 1)) {
            calculateScore();
            setGameState('results');
            return;
        }
        setCurrentIndex(prev => prev + 1);
    }, INTER_STIMULUS_INTERVAL);
    
    return () => clearInterval(timer);
  }, [gameState, currentIndex, processTurn]);
  
  const calculateScore = () => {
    const { posHits, posMisses, posFalseAlarms, audioHits, audioMisses, audioFalseAlarms, posOpportunities, audioOpportunities } = scoreRef.current;
    const posAccuracy = posOpportunities > 0 ? (posHits / (posOpportunities + posFalseAlarms)) * 100 : 100;
    const audioAccuracy = audioOpportunities > 0 ? (audioHits / (audioOpportunities + audioFalseAlarms)) * 100 : 100;
    setScore(Math.round((posAccuracy + audioAccuracy) / 2));
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
    if (currentIndex >= sequence.length) return null;
    const currentStimulus = sequence[currentIndex];
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
              <li>Press 'A' for position match</li>
              <li>Press 'L' for audio match</li>
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
          <div className="text-lg font-bold">{t('dualNBack.trial')} {currentIndex - currentLevel + 1} / {SEQUENCE_LENGTH}</div>
          <div className="text-sm text-gray-400">{currentLevel}-Back {t('dualNBack.levelLabel')}</div>
        </div>
        {renderStimulus()}
        <div className="flex justify-center gap-8 mb-8">
          <button onClick={() => handleResponse('position')} className="bg-blue-600 px-6 py-3 rounded-lg font-medium">{t('dualNBack.posMatch')} (A)</button>
          <button onClick={() => handleResponse('audio')} className="bg-green-600 px-6 py-3 rounded-lg font-medium">{t('dualNBack.audioMatch')} (L)</button>
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