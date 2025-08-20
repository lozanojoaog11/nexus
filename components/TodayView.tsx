import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { DailyCheckin, Task, Habit, CalendarEvent, TaskStatus, View } from '../types';

interface TodayViewProps {
    dailyCheckin: DailyCheckin | null;
    tasks: Task[];
    habits: Habit[];
    agendaEvents: CalendarEvent[];
    updateTaskStatus: (projectId: string, taskId: string, newStatus: TaskStatus) => void;
    toggleHabitCompletion: (habitId: string, date: string, isCompleted: boolean) => void;
    setCurrentView: (view: View) => void;
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);


const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            {title}
        </h2>
        <div>{children}</div>
    </div>
);

const TodayView: React.FC<TodayViewProps> = ({ dailyCheckin, tasks, habits, agendaEvents, updateTaskStatus, toggleHabitCompletion, setCurrentView }) => {
    const { t } = useTranslation();
    const todayStr = new Date().toISOString().split('T')[0];
    const activeStrategy = dailyCheckin?.activeStrategy;

    const strategyInfo = activeStrategy ? {
        eat_the_frog: { icon: '🐸', text: t('todayView.strategy.eatTheFrog') },
        small_wins: { icon: '🏆', text: t('todayView.strategy.smallWins') },
        deep_work_focus: { icon: '🎯', text: t('todayView.strategy.deepWorkFocus') }
    }[activeStrategy] : null;

    const essentialFocusTasks = React.useMemo(() => {
        if (!activeStrategy) {
            return tasks.filter(task => task.isMIT && task.status !== 'Concluído');
        }

        switch (activeStrategy) {
            case 'small_wins':
                return tasks
                    .filter(task => task.status === 'A Fazer')
                    .sort((a, b) => a.content.length - b.content.length)
                    .slice(0, 3);
            case 'deep_work_focus':
            case 'eat_the_frog':
            default:
                return tasks.filter(task => task.isMIT && task.status !== 'Concluído');
        }
    }, [tasks, activeStrategy]);

    const mitExists = React.useMemo(() => tasks.some(task => task.isMIT), [tasks]);
    
    const todaysEvents = React.useMemo(() => 
        agendaEvents
            .filter(event => event.date === todayStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime)), 
    [agendaEvents, todayStr]);

    return (
        <div className="p-8 text-white w-full h-full animate-fade-in-up overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">{t('todayView.title')}</h1>
                <p className="text-gray-400 mt-1">{t('todayView.subtitle')}</p>
            </header>

            {strategyInfo && (
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-2xl mb-6 flex items-center gap-4 animate-fade-in">
                    <span className="text-3xl">{strategyInfo.icon}</span>
                    <div>
                        <p className="text-blue-200 font-semibold">{strategyInfo.text}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <Section title={t('todayView.neuralDirective')} icon="🧠">
                        <p className="text-gray-300 italic leading-relaxed">
                            {dailyCheckin?.directive || t('todayView.noDirective')}
                        </p>
                    </Section>

                    <Section title={t('todayView.essentialFocus')} icon="🎯">
                        {(() => {
                            if (essentialFocusTasks.length > 0) {
                                return (
                                    <div className="space-y-3">
                                        {essentialFocusTasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-3 group">
                                                <button 
                                                    onClick={() => updateTaskStatus(task.projectId!, task.id, 'Concluído')}
                                                    className="w-6 h-6 flex-shrink-0 rounded-md border-2 border-gray-600 group-hover:border-blue-500 transition-colors flex items-center justify-center"
                                                >
                                                </button>
                                                <span className="text-gray-200 group-hover:text-white transition-colors">{task.content}</span>
                                            </div>
                                        ))}
                                        {activeStrategy === 'deep_work_focus' && (
                                            <button 
                                                onClick={() => setCurrentView('flowlab')} 
                                                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                🎯 {t('todayView.startFlowSession')}
                                            </button>
                                        )}
                                    </div>
                                );
                            }

                            if (activeStrategy === 'small_wins') {
                                return <p className="text-gray-500">{t('todayView.noSmallTasks')}</p>;
                            }

                            if (mitExists) {
                                return <p className="text-green-400">{t('todayView.allMissionsComplete')}</p>;
                            }

                            return <p className="text-gray-500">{t('todayView.noMissions')}</p>;
                        })()}
                    </Section>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Section title={t('todayView.todaysRituals')} icon="⚙️">
                        {habits.length > 0 ? (
                            <div className="space-y-3">
                                {habits.map(habit => {
                                    const isCompleted = (habit.history || []).some(h => h.date === todayStr && h.completed);
                                    return (
                                        <div key={habit.id} className="flex items-center gap-3 group">
                                             <button 
                                                onClick={() => toggleHabitCompletion(habit.id, todayStr, isCompleted)}
                                                className={`w-6 h-6 flex-shrink-0 rounded-md border-2 transition-colors flex items-center justify-center ${isCompleted ? 'bg-green-500/30 border-green-500' : 'border-gray-600 group-hover:border-green-500'}`}
                                            >
                                                {isCompleted && <CheckIcon className="w-4 h-4 text-green-400"/>}
                                            </button>
                                            <span className={`transition-colors ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>{habit.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500">{t('todayView.noRituals')}</p>
                        )}
                    </Section>
                    
                    <Section title={t('todayView.agenda')} icon="📅">
                        {todaysEvents.length > 0 ? (
                            <div className="space-y-3">
                                {todaysEvents.map(event => (
                                    <div key={event.id} className="flex items-center gap-3">
                                        <div className="w-20 text-right text-purple-400 font-semibold">{event.startTime}</div>
                                        <div className="w-1 h-8 bg-purple-500/50 rounded-full"></div>
                                        <div className="text-gray-200">{event.title}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">{t('todayView.noEvents')}</p>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default TodayView;