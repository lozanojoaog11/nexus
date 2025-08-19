
import React, { useState, useEffect, useMemo } from 'react';
import { CognitiveSession } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface MemoryPalaceBuilderProps {
  onSessionComplete: (session: CognitiveSession) => void;
}

const WORD_COUNT = 10;
const MEMORIZE_TIME = 60; // seconds

const sampleWords = ["Quantum", "Nebula", "Velocity", "Symphony", "Alchemy", "Zenith", "Horizon", "Catalyst", "Phoenix", "Mirage", "Labyrinth", "Chrysalis", "Solitude", "Serenity", "Cascade"];

const MemoryPalaceBuilder: React.FC<MemoryPalaceBuilderProps> = ({ onSessionComplete }) => {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState<'setup' | 'memorizing' | 'recalling' | 'results'>('setup');
    const [words, setWords] = useState<string[]>([]);
    const [recalledWords, setRecalledWords] = useState<string>('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(MEMORIZE_TIME);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);

    const startMemorization = () => {
        const shuffled = [...sampleWords].sort(() => 0.5 - Math.random());
        setWords(shuffled.slice(0, WORD_COUNT));
        setTimeLeft(MEMORIZE_TIME);
        setGameState('memorizing');
        setSessionStartTime(Date.now());
    };

    useEffect(() => {
        if (gameState !== 'memorizing' || timeLeft <= 0) return;
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        
        if (timeLeft === 0) {
            setGameState('recalling');
        }

        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);

    const checkAnswers = () => {
        const userWords = new Set(recalledWords.toLowerCase().split('\n').map(w => w.trim()).filter(Boolean));
        const correctWords = words.filter(w => userWords.has(w.toLowerCase()));
        const calculatedScore = Math.round((correctWords.length / WORD_COUNT) * 100);
        setScore(calculatedScore);
        setGameState('results');
    };
    
    const completeSession = () => {
        const session: CognitiveSession = {
          id: Date.now().toString(),
          type: 'memory-palace',
          score: score,
          duration: (Date.now() - sessionStartTime) / 1000,
          date: new Date().toISOString(),
          level: WORD_COUNT,
          improvements: [`Memorized ${Math.round(score/10)}/${WORD_COUNT} words`]
        };
        onSessionComplete(session);
        setRecalledWords('');
        setGameState('setup');
    };

    if (gameState === 'setup') {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('memoryPalace.title')}</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">{t('memoryPalace.description')}</p>
                 <button onClick={startMemorization} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                    {t('cognitive.startTraining')}
                </button>
            </div>
        );
    }

    if (gameState === 'memorizing') {
        return (
             <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('memoryPalace.memorizeTitle')}</h2>
                <p className="text-gray-400 mb-6">{t('memoryPalace.memorizeInstructions', { seconds: MEMORIZE_TIME })}</p>
                <div className="bg-gray-800/50 p-6 rounded-xl mb-6 max-w-md mx-auto">
                    <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {words.map(word => <li key={word} className="text-lg text-white text-left">{word}</li>)}
                    </ul>
                </div>
                <div className="text-4xl font-bold text-green-400">{timeLeft}</div>
                <p className="text-gray-400">{t('memoryPalace.timeRemaining')}</p>
            </div>
        );
    }
    
    if (gameState === 'recalling') {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('memoryPalace.recallTitle')}</h2>
                <p className="text-gray-400 mb-6">{t('memoryPalace.recallInstructions')}</p>
                <textarea 
                    value={recalledWords}
                    onChange={e => setRecalledWords(e.target.value)}
                    rows={10}
                    className="w-full max-w-md mx-auto bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500"
                    autoFocus
                />
                <button onClick={checkAnswers} className="mt-6 bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
                    {t('memoryPalace.checkAnswers')}
                </button>
            </div>
        )
    }

    if (gameState === 'results') {
        const correctCount = Math.round(score / 10);
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('memoryPalace.resultsTitle')}</h2>
                <div className="bg-gray-800/50 p-8 rounded-xl mb-6 max-w-md mx-auto">
                    <div className="text-4xl font-bold text-green-400 mb-2">{score}%</div>
                    <div className="text-gray-400 mb-4">{t('memoryPalace.yourScore')}</div>
                    <p className="text-white">{t('memoryPalace.correctWords')}: {correctCount} / {WORD_COUNT}</p>
                </div>
                 <div className="space-x-4">
                    <button onClick={() => setGameState('setup')} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">{t('memoryPalace.trainAgain')}</button>
                    <button onClick={completeSession} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold">{t('memoryPalace.saveSession')}</button>
                </div>
            </div>
        )
    }

    return null;
};

export default MemoryPalaceBuilder;
