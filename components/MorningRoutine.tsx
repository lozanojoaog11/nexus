import React, { useState, useEffect } from 'react';

type Step = 
  | 'start'
  | 'sleep'
  | 'workout'
  | 'stretch'
  | 'breakfast'
  | 'shower'
  | 'get_dressed'
  | 'brush_teeth'
  | 'meditation'
  | 'clutter'
  | 'declutter'
  | 'todo'
  | 'done';

interface MorningRoutineProps {
  onComplete: (activities: string[]) => void;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`w-full text-center p-3 rounded-lg transition-all duration-200 font-semibold ${className}`}>
        {children}
    </button>
);

const FlowCard: React.FC<{ children: React.ReactNode; isQuestion?: boolean }> = ({ children, isQuestion = false }) => (
    <div className={`text-center p-3 rounded-lg border text-sm ${isQuestion ? 'bg-gray-700 border-gray-600' : 'bg-gray-800/50 border-gray-700/50'}`}>
        <p className="font-medium text-white">{children}</p>
    </div>
);

const MorningRoutine: React.FC<MorningRoutineProps> = ({ onComplete }) => {
    const [step, setStep] = useState<Step>('start');
    const [activities, setActivities] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (step === 'done' && !isComplete) {
            onComplete(activities);
            setIsComplete(true);
        }
    }, [step, activities, onComplete, isComplete]);

    const handleAnswer = (nextStep: Step, activity?: string) => {
        if (activity) {
            setActivities(prev => [...prev, activity]);
        }
        setStep(nextStep);
    };

    const renderStep = () => {
        switch (step) {
            case 'start':
                return (
                     <ActionButton onClick={() => setStep('sleep')} className="bg-[#00A9FF] text-black hover:bg-opacity-90">
                        Começar Rotina
                    </ActionButton>
                )
            case 'sleep':
                return (
                    <div className="space-y-3 animate-fade-in-up">
                        <FlowCard isQuestion>Você dormiu bem?</FlowCard>
                        <div className="flex gap-3">
                            <ActionButton onClick={() => handleAnswer('workout', 'Dormiu bem')} className="bg-green-600/20 text-green-300 hover:bg-green-600/40">Sim</ActionButton>
                            <ActionButton onClick={() => handleAnswer('meditation')} className="bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40">Não</ActionButton>
                        </div>
                    </div>
                );
            case 'workout':
                return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>20 min de exercício</FlowCard>
                         <ActionButton onClick={() => handleAnswer('stretch', 'Exercício (20 min)')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'stretch':
                 return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>Alongamento</FlowCard>
                         <ActionButton onClick={() => handleAnswer('breakfast', 'Alongamento')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'breakfast':
                 return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>Tomar café da manhã</FlowCard>
                         <ActionButton onClick={() => handleAnswer('shower', 'Café da manhã')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'shower':
                 return (
                    <div className="space-y-3 animate-fade-in-up">
                        <FlowCard isQuestion>Tomar banho de manhã?</FlowCard>
                        <div className="flex gap-3">
                            <ActionButton onClick={() => handleAnswer('get_dressed', 'Banho')} className="bg-green-600/20 text-green-300 hover:bg-green-600/40">Sim</ActionButton>
                            <ActionButton onClick={() => handleAnswer('get_dressed')} className="bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40">Não</ActionButton>
                        </div>
                    </div>
                );
            case 'get_dressed':
                 return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>Vestir-se</FlowCard>
                         <ActionButton onClick={() => handleAnswer('brush_teeth', 'Vestir-se')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'brush_teeth':
                 return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>Escovar os dentes</FlowCard>
                         <ActionButton onClick={() => handleAnswer('clutter', 'Escovar dentes')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'meditation':
                return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>10 min de meditação</FlowCard>
                         <ActionButton onClick={() => handleAnswer('breakfast', 'Meditação (10 min)')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'clutter':
                 return (
                    <div className="space-y-3 animate-fade-in-up">
                        <FlowCard isQuestion>Seu espaço está bagunçado?</FlowCard>
                        <div className="flex gap-3">
                            <ActionButton onClick={() => handleAnswer('declutter')} className="bg-green-600/20 text-green-300 hover:bg-green-600/40">Sim</ActionButton>
                            <ActionButton onClick={() => handleAnswer('todo')} className="bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40">Não</ActionButton>
                        </div>
                    </div>
                );
            case 'declutter':
                return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>15 min para organizar</FlowCard>
                         <ActionButton onClick={() => handleAnswer('todo', 'Organização (15 min)')} className="bg-white/10 text-white hover:bg-white/20">
                            Concluído
                        </ActionButton>
                    </div>
                );
            case 'todo':
                 return (
                    <div className="space-y-2 animate-fade-in-up">
                        <FlowCard>Fazer lista de tarefas</FlowCard>
                         <ActionButton onClick={() => handleAnswer('done', 'Fazer To-Do list')} className="bg-white/10 text-white hover:bg-white/20">
                            Finalizar Rotina
                        </ActionButton>
                    </div>
                );
            case 'done':
                return (
                    <div className="animate-fade-in-up text-center p-4 bg-green-900/50 rounded-lg border border-green-500">
                        <p className="font-semibold text-green-300">Rotina concluída. Seu dia começou com força.</p>
                    </div>
                )
            default:
                return null;
        }
    };

    return <div className="w-full min-h-[52px] flex items-center justify-center">{renderStep()}</div>;
};

export default MorningRoutine;