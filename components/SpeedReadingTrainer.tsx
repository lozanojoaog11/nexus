
import React, { useState, useEffect, useMemo } from 'react';
import { CognitiveSession } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SpeedReadingTrainerProps {
    onSessionComplete: (session: CognitiveSession) => void;
}

const sampleText = "The synthesis of human cognition and artificial intelligence represents a new frontier in potential. By creating systems that amplify our innate abilities, we are not merely building tools, but cognitive exoskeletons. This symbiosis allows for unprecedented levels of creativity, problem-solving, and strategic execution. The key is deliberate intention paired with fluid execution, a philosophy that bridges the gap between raw potential and realized power. This approach requires rigorous self-assessment, continuous adaptation, and a deep understanding of one's own cognitive architecture.";

const comprehensionQuestions = [
    {
        question: "What is the main concept described in the text?",
        options: ["The dangers of AI", "Human-AI symbiosis", "The history of computers", "Financial investment strategies"],
        correct: 1
    },
    {
        question: "What does the text describe as the key to this new frontier?",
        options: ["Deliberate intention and fluid execution", "Rapid software development", "Ignoring human weaknesses", "Purely analytical thinking"],
        correct: 0
    },
    {
        question: "What are the systems that amplify our abilities called?",
        options: ["Advanced programs", "Neural networks", "Cognitive exoskeletons", "Digital assistants"],
        correct: 2
    }
];

const SpeedReadingTrainer: React.FC<SpeedReadingTrainerProps> = ({ onSessionComplete }) => {
    const { t } = useTranslation();
    const [gameState, setGameState] = useState<'setup' | 'reading' | 'quiz' | 'results'>('setup');
    const [wpm, setWpm] = useState(300);
    const [words, setWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(comprehensionQuestions.length).fill(null));
    const [score, setScore] = useState({ wpm: 0, comprehension: 0, final: 0 });
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);

    const startReading = () => {
        setWords(sampleText.split(/\s+/));
        setCurrentWordIndex(0);
        setGameState('reading');
        setSessionStartTime(Date.now());
    };

    useEffect(() => {
        if (gameState !== 'reading') return;
        
        const interval = 60000 / wpm;
        const timer = setInterval(() => {
            setCurrentWordIndex(prev => {
                if (prev >= words.length - 1) {
                    setGameState('quiz');
                    return prev;
                }
                return prev + 1;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [gameState, wpm, words.length]);

    const handleQuizSubmit = () => {
        const correctAnswers = quizAnswers.filter((answer, index) => answer === comprehensionQuestions[index].correct).length;
        const comprehension = (correctAnswers / comprehensionQuestions.length) * 100;
        const finalScore = Math.round(wpm * (comprehension / 100));
        setScore({ wpm, comprehension, final: finalScore });
        setGameState('results');
    };

    const completeSession = () => {
        const session: CognitiveSession = {
            id: Date.now().toString(),
            type: 'speed-reading',
            score: score.final,
            duration: (Date.now() - sessionStartTime) / 1000,
            date: new Date().toISOString(),
            level: wpm,
            improvements: [`Read at ${wpm} WPM with ${score.comprehension}% comprehension.`]
        };
        onSessionComplete(session);
        setGameState('setup');
    };

    if (gameState === 'setup') {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('speedReading.title')}</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">{t('speedReading.description')}</p>
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">{t('speedReading.wpm')}: {wpm}</label>
                    <input type="range" min="100" max="1000" step="50" value={wpm} onChange={e => setWpm(parseInt(e.target.value))} className="w-full max-w-md mx-auto accent-blue-500" />
                </div>
                <button onClick={startReading} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                    {t('speedReading.start')}
                </button>
            </div>
        );
    }
    
    if (gameState === 'reading') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-4xl h-48 bg-gray-800/50 rounded-xl flex items-center justify-center">
                    <p className="text-5xl font-semibold text-white">{words[currentWordIndex]}</p>
                </div>
                <div className="mt-4 text-gray-400">{currentWordIndex + 1} / {words.length}</div>
            </div>
        );
    }

    if (gameState === 'quiz') {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-6">{t('speedReading.comprehensionQuiz')}</h2>
                <div className="space-y-6">
                    {comprehensionQuestions.map((q, index) => (
                        <div key={index}>
                            <p className="font-semibold mb-3">{t('speedReading.question')} {index + 1}: {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, optIndex) => (
                                    <label key={optIndex} className={`block p-3 rounded-lg border-2 cursor-pointer ${quizAnswers[index] === optIndex ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800/50'}`}>
                                        <input type="radio" name={`q${index}`} value={optIndex} onChange={() => setQuizAnswers(prev => { const newAnswers = [...prev]; newAnswers[index] = optIndex; return newAnswers; })} className="hidden" />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <button onClick={handleQuizSubmit} disabled={quizAnswers.includes(null)} className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                     {t('speedReading.submit')}
                 </button>
            </div>
        );
    }
    
     if (gameState === 'results') {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{t('speedReading.resultsTitle')}</h2>
                <div className="bg-gray-800/50 p-8 rounded-xl mb-6 max-w-md mx-auto grid grid-cols-3 gap-4">
                    <div>
                        <div className="text-3xl font-bold text-blue-400">{score.wpm}</div>
                        <div className="text-gray-400 text-sm">{t('speedReading.yourWPM')}</div>
                    </div>
                     <div>
                        <div className="text-3xl font-bold text-green-400">{score.comprehension}%</div>
                        <div className="text-gray-400 text-sm">{t('speedReading.comprehension')}</div>
                    </div>
                     <div>
                        <div className="text-3xl font-bold text-purple-400">{score.final}</div>
                        <div className="text-gray-400 text-sm">{t('speedReading.finalScore')}</div>
                    </div>
                </div>
                 <div className="space-x-4">
                    <button onClick={() => setGameState('setup')} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">{t('speedReading.trainAgain')}</button>
                    <button onClick={completeSession} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold">{t('speedReading.saveSession')}</button>
                </div>
            </div>
        );
    }

    return null;
};
export default SpeedReadingTrainer;
