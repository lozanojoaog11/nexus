import React, { useState, useRef, useEffect } from 'react';
import { generateInitialEcosystem } from '../services/geminiService';
import { Habit, Project, Task, DevelopmentNode, DevelopmentEdge, UserProfile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { dataService } from '../services/firebase';

interface OnboardingViewProps {
    onOnboardingComplete: () => void;
    performAtomicOnboarding: (updates: Record<string, any>) => Promise<void>;
    profile: UserProfile;
}

type FlowState = 'choice' | 'conversation' | 'generating' | 'complete';

const questions = [
  "Primeiro, qual é a sua grande missão? O 'Ponto de Fuga' que, se alcançado, mudaria tudo para você nos próximos 1-2 anos?",
  "Todo herói tem um 'dragão' para derrotar. Qual é o seu principal obstáculo interno? (Ex: procrastinação, falta de consistência, paralisia por análise, dificuldade em dizer não)",
  "Descreva seu 'estado de flow' ideal. Em que tipo de tarefa ou ambiente você se sente mais poderoso e focado?",
  "Como você prefere trabalhar? A) Com um plano claro e estruturado (Arquiteto). B) Explorando e conectando ideias de forma livre (Explorador). C) Focado em resultados e eficiência máxima (Executor).",
  "Para finalizar, qual é a primeira vitória, por menor que seja, que você gostaria de conquistar com a ajuda do Eixo OS na próxima semana?"
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ 
    onOnboardingComplete, performAtomicOnboarding, profile
}) => {
    const { language } = useTranslation();
    const [flowState, setFlowState] = useState<FlowState>('choice');
    const [conversation, setConversation] = useState<{ q: string, a: string }[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (flowState === 'conversation') {
            inputRef.current?.focus();
        }
    }, [flowState, currentQuestionIndex]);
    
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new (window as any).webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language;
            recognitionRef.current.onresult = (event: any) => {
                setUserInput(event.results[0][0].transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
        }
    }, [language]);
    
    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleStartConversation = () => {
        setFlowState('conversation');
    };
    
    const handleUserResponse = async () => {
        if (!userInput.trim()) return;

        const newConversation = [...conversation, { q: questions[currentQuestionIndex], a: userInput }];
        setConversation(newConversation);
        setUserInput('');

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            await triggerGenerationProcess(newConversation);
        }
    };
    
    const triggerGenerationProcess = async (finalConversation: { q: string, a: string }[]) => {
        setFlowState('generating');
        setError('');

        const transcript = finalConversation.map(item => `P: ${item.q}\nR: ${item.a}`).join('\n\n');

        try {
            const { ecosystem, profileUpdate } = await generateInitialEcosystem(transcript);

            const updates: Record<string, any> = {};
            const idMap = new Map<string, string>();
            
            // Generate all new IDs first and map them
            ecosystem.projects.forEach((p: any) => {
                const newId = dataService.getNewId('projects');
                if(newId) idMap.set(p.id, newId);
            });
            ecosystem.developmentGraph.nodes.forEach((n: any) => {
                 const newId = dataService.getNewId('developmentGraph/nodes');
                 if(newId) idMap.set(n.id, newId);
            });
            ecosystem.tasks.forEach((t: any) => {
                 const newId = dataService.getNewId('tasks');
                 if(newId) idMap.set(t.id, newId);
            });
            ecosystem.developmentGraph.edges.forEach((e: any) => {
                const newId = dataService.getNewId('developmentGraph/edges');
                if(newId) idMap.set(e.id, newId);
            });
            ecosystem.habits.forEach((h: any) => {
                const newId = dataService.getNewId('habits');
                if(newId) idMap.set(h.id, newId);
            });


            // Build the update object with correct, cross-referenced IDs
            ecosystem.projects.forEach((p: any) => {
                const realId = idMap.get(p.id);
                if (realId) updates[`projects/${realId}`] = { name: p.name, id: realId };
            });
             ecosystem.developmentGraph.nodes.forEach((n: any) => {
                const realId = idMap.get(n.id);
                if(realId) updates[`developmentGraph/nodes/${realId}`] = { ...n, id: realId };
            });
            ecosystem.tasks.forEach((t: any) => {
                const realId = idMap.get(t.id);
                const realProjectId = idMap.get(t.projectId);
                if (realId && realProjectId) {
                    updates[`tasks/${realId}`] = { ...t, id: realId, projectId: realProjectId, status: 'A Fazer' };
                }
            });
            ecosystem.developmentGraph.edges.forEach((e: any) => {
                const realId = idMap.get(e.id);
                const realSource = idMap.get(e.source);
                const realTarget = idMap.get(e.target);
                if (realId && realSource && realTarget) {
                    updates[`developmentGraph/edges/${realId}`] = { ...e, id: realId, source: realSource, target: realTarget };
                }
            });
            ecosystem.habits.forEach((h: any) => {
                const realId = idMap.get(h.id);
                if(realId) updates[`habits/${realId}`] = { ...h, id: realId, history: [], bestStreak: 0, currentStreak: 0 };
            });

            // Add profile update and mark onboarding as complete
            updates['profile'] = { ...profile, ...profileUpdate, onboardingCompleted: true };
            
            await performAtomicOnboarding(updates);
            
            setFlowState('complete');
            setTimeout(() => window.location.reload(), 2000); // Reload to apply the new state

        } catch (e: any) {
            setError(e.message || "Ocorreu um erro desconhecido.");
            setFlowState('conversation'); // Go back to conversation to allow retry
        }
    };

    const renderContent = () => {
        switch (flowState) {
            case 'choice':
                return (
                    <>
                        <h1 className="text-4xl font-bold tracking-wider">Bem-vindo ao Eixo OS</h1>
                        <p className="text-lg text-gray-300">Escolha como deseja iniciar sua jornada.</p>
                        <div className="flex flex-col md:flex-row gap-6 mt-8">
                            <button
                                onClick={handleStartConversation}
                                className="flex-1 p-6 bg-gray-800/50 border border-gray-700 rounded-lg text-left hover:border-purple-500/50 transition-colors"
                            >
                                <h2 className="text-xl font-semibold text-purple-400">Iniciar Diagnóstico Neural</h2>
                                <p className="text-gray-400 mt-2">Uma IA irá configurar seu Eixo OS em uma conversa de 5 minutos.</p>
                            </button>
                            <button
                                onClick={onOnboardingComplete}
                                className="flex-1 p-6 bg-gray-800/50 border border-gray-700 rounded-lg text-left hover:border-blue-500/50 transition-colors"
                            >
                                <h2 className="text-xl font-semibold text-blue-400">Começar com o Modelo Padrão</h2>
                                <p className="text-gray-400 mt-2">Explore o sistema com exemplos pré-configurados.</p>
                            </button>
                        </div>
                    </>
                );
            case 'conversation':
                return (
                    <div className="w-full text-left">
                        <p className="text-gray-300 mb-4">{questions[currentQuestionIndex]}</p>
                        <div className="flex gap-2 items-center">
                           <div className="flex-1 relative">
                               <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                                    className="w-full bg-gray-800/60 text-white p-3 pr-12 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                                    placeholder="Sua resposta..."
                                />
                                <button
                                    onClick={startListening}
                                    disabled={isListening}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                                        isListening 
                                        ? 'bg-red-500 text-white animate-pulse' 
                                        : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                           </div>
                            <button onClick={handleUserResponse} className="bg-[#00A9FF] text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-80">Enviar</button>
                        </div>
                        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>
                );
            case 'generating':
                return (
                     <div className="text-center">
                        <div className="animate-spin h-10 w-10 text-[#00A9FF] mx-auto mb-4 border-4 border-gray-600 border-t-[#00A9FF] rounded-full"></div>
                        <h2 className="text-2xl font-bold">Gerando seu Ecossistema...</h2>
                        <p className="text-gray-400 mt-2">Calibrando protocolos e forjando seu primeiro projeto.</p>
                    </div>
                )
             case 'complete':
                return (
                    <div className="text-center">
                         <svg className="w-16 h-16 text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-2xl font-bold">Eixo OS Configurado!</h2>
                        <p className="text-gray-400 mt-2">Seu ambiente personalizado está pronto. O sistema será recarregado.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center text-white animate-fade-in">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl text-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default OnboardingView;