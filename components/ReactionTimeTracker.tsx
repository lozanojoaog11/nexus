
import React, { useState, useEffect, useRef } from 'react';
import { CognitiveSession } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ReactionTimeTrackerProps {
  onSessionComplete: (session: CognitiveSession) => void;
}

const TOTAL_ATTEMPTS = 5;

const ReactionTimeTracker: React.FC<ReactionTimeTrackerProps> = ({ onSessionComplete }) => {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState<'setup' | 'waiting' | 'active' | 'too-soon' | 'results'>('setup');
    const [attempts, setAttempts] = useState<number[]>([]);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const clickStartTimeRef = useRef<number>(0);

    const startTrial = () => {
        setGameState('waiting');
        const delay = Math.random() * 3000 + 2000; // 2-5s delay
        timerRef.current = setTimeout(() => {
            clickStartTimeRef.current = Date.now();
            setGameState('active');
        }, delay);
    };
    
    useEffect(() => {
        return () => { // Cleanup on unmount
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, []);

    const handleClick = () => {
        if (gameState === 'waiting') {
            if (timerRef.current) clearTimeout(timerRef.current);
            setGameState('too-soon');
            return;
        }

        if (gameState === 'active') {
            const reactionTime = Date.now() - clickStartTimeRef.current;
            const newAttempts = [...attempts, reactionTime];
            setAttempts(newAttempts);

            if (newAttempts.length >= TOTAL_ATTEMPTS) {
                setGameState('results');
            } else {
                startTrial();
            }
        }
    };
    
    const resetGame = () => {
        setAttempts([]);
        setGameState('setup');
    };

    const completeSession = () => {
        if (attempts.length === 0) return;
        const averageTime = attempts.reduce((a, b) => a + b, 0) / attempts.length;
        const session: CognitiveSession = {
            id: Date.now().toString(),
            type: 'reaction-time',
            score: Math.round(averageTime),
            duration: (Date.now() - sessionStartTime) / 1000,
            date: new Date().toISOString(),
            level: TOTAL_ATTEMPTS,
            improvements: [`Average reaction time: ${Math.round(averageTime)}ms`]
        };
        onSessionComplete(session);
        resetGame();
    };

    const renderGameState = () => {
        switch(gameState) {
            case 'setup':
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">{t('reactionTime.instructionsTitle')}</h3>
                        <ul className="text-gray-400 space-y-1 mb-6">
                            <li>{t('reactionTime.instruction1')}</li>
                            <li>{t('reactionTime.instruction2')}</li>
                            <li>{t('reactionTime.instruction3')}</li>
                        </ul>
                        <button onClick={() => { setSessionStartTime(Date.now()); startTrial(); }} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                           {t('reactionTime.start')}
                        </button>
                    </div>
                );
            case 'waiting':
                return (
                    <div onClick={handleClick} className="w-full h-64 bg-red-600 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                         <h3 className="text-3xl font-bold text-white">{t('reactionTime.getReady')}</h3>
                    </div>
                );
            case 'active':
                 return (
                    <div onClick={handleClick} className="w-full h-64 bg-green-500 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                         <h3 className="text-5xl font-bold text-white">{t('reactionTime.click')}</h3>
                    </div>
                );
            case 'too-soon':
                return (
                     <div onClick={startTrial} className="w-full h-64 bg-blue-600 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                         <h3 className="text-2xl font-bold text-white">{t('reactionTime.tooSoon')}</h3>
                         <p className="text-blue-200 mt-2">Click to try again</p>
                    </div>
                );
            case 'results':
                const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">{t('reactionTime.resultsTitle')}</h2>
                        <div className="bg-gray-800/50 p-8 rounded-xl mb-6 max-w-md mx-auto">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">{Math.round(average)} {t('reactionTime.ms')}</div>
                            <div className="text-gray-400 mb-4">{t('reactionTime.average')}</div>
                            <p className="text-white">{t('reactionTime.attempts')}: {attempts.join(', ')}</p>
                        </div>
                        <div className="space-x-4">
                            <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">{t('reactionTime.tryAgain')}</button>
                            <button onClick={completeSession} className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold">{t('reactionTime.saveSession')}</button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="p-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{t('reactionTime.title')}</h2>
                <p className="text-gray-400">{t('reactionTime.description')}</p>
            </div>
            <div className="max-w-3xl mx-auto">
                {renderGameState()}
            </div>
             <div className="mt-6 text-center">
                <p className="text-lg font-semibold">{t('reactionTime.attempts')}: {attempts.length} / {TOTAL_ATTEMPTS}</p>
                <div className="flex justify-center gap-2 mt-2">
                    {Array.from({length: TOTAL_ATTEMPTS}).map((_, i) => (
                        <div key={i} className={`w-8 h-2 rounded-full ${i < attempts.length ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ReactionTimeTracker;
