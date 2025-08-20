import React, { useState, useRef, useEffect } from 'react';
import { generateInitialEcosystem } from '../services/geminiService';
import { Habit, Project, Task, DevelopmentNode, DevelopmentEdge } from '../types';

interface OnboardingViewProps {
    onOnboardingComplete: () => void;
    addHabit: (name: string, category: "Corpo" | "Mente" | "Execução", frequency: number) => Promise<void>;
    addProject: (name: string) => Promise<string | null>;
    addTask: (projectId: string, content: string, isMIT?: boolean) => Promise<void>;
    saveDevelopmentNode: (node: DevelopmentNode) => Promise<string | null>;
    saveDevelopmentEdge: (edge: Omit<DevelopmentEdge, 'id'>) => Promise<void>;
}

type FlowState = 'choice' | 'conversation' | 'generating' | 'complete';

const questions = [
    "Qual é o seu maior objetivo profissional ou projeto para os próximos 12 meses?",
    "Qual é o maior obstáculo interno que te impede de alcançar esse objetivo (ex: procrastinação, falta de foco, desorganização)?",
    "Qual hábito, se você o construísse consistentemente, teria o maior impacto positivo na sua vida?",
    "Para finalizar, descreva um dia em que você se sentiu absolutamente imparável. O que você estava fazendo? Como se sentia? Isso nos ajuda a entender seu estado de 'flow' ideal."
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ 
    onOnboardingComplete, addHabit, addProject, addTask, saveDevelopmentNode, saveDevelopmentEdge
}) => {
    const [flowState, setFlowState] = useState<FlowState>('choice');
    const [conversation, setConversation] = useState<{ q: string, a: string }[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flowState === 'conversation') {
            inputRef.current?.focus();
        }
    }, [flowState, currentQuestionIndex]);

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
            const ecosystem = await generateInitialEcosystem(transcript);

            const idMap = new Map<string, string>();
            
            // 1. Create Projects & Nodes to get real IDs
            for (const project of ecosystem.projects) {
                const newId = await addProject(project.name);
                if (newId) idMap.set(project.id, newId);
            }
            for (const node of ecosystem.developmentGraph.nodes) {
                const newId = await saveDevelopmentNode(node);
                if (newId) idMap.set(node.id, newId);
            }

            // 2. Create items that depend on the new IDs
            const habitPromises = ecosystem.habits.map((h: any) => addHabit(h.name, h.category, h.frequency));
            const taskPromises = ecosystem.tasks.map((t: any) => {
                const realProjectId = idMap.get(t.projectId);
                return realProjectId ? addTask(realProjectId, t.content, t.isMIT) : Promise.resolve();
            });
            const edgePromises = ecosystem.developmentGraph.edges.map((e: any) => {
                const realSource = idMap.get(e.source);
                const realTarget = idMap.get(e.target);
                return (realSource && realTarget) ? saveDevelopmentEdge({ ...e, source: realSource, target: realTarget }) : Promise.resolve();
            });

            await Promise.all([...habitPromises, ...taskPromises, ...edgePromises]);
            
            setFlowState('complete');
            onOnboardingComplete();

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
                        <div className="flex gap-2">
                           <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                                className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
                                placeholder="Sua resposta..."
                            />
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
