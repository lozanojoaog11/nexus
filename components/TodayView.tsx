import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { DailyCheckin, Task, Habit, CalendarEvent, TaskStatus } from '../types';

interface TodayViewProps {
    dailyCheckin: DailyCheckin | null;
    tasks: Task[];
    habits: Habit[];
    agendaEvents: CalendarEvent[];
    updateTaskStatus: (projectId: string, taskId: string, newStatus: TaskStatus) => void;
    toggleHabitCompletion: (habitId: string, date: string, isCompleted: boolean) => void;
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

const TodayView: React.FC<TodayViewProps> = ({ dailyCheckin, tasks, habits, agendaEvents, updateTaskStatus, toggleHabitCompletion }) => {
    const { t, language } = useTranslation();
    const todayStr = new Date().toISOString().split('T')[0];

    const todaysMITs = React.useMemo(() => tasks.filter(task => task.isMIT), [tasks]);
    const incompleteMITs = todaysMITs.filter(task => task.status !== 'Concluído');
    
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <Section title={t('todayView.neuralDirective')} icon="🧠">
                        <p className="text-gray-300 italic leading-relaxed">
                            {dailyCheckin?.directive || t('todayView.noDirective')}
                        </p>
                    </Section>

                    <Section title={t('todayView.essentialFocus')} icon="🎯">
                        {incompleteMITs.length > 0 ? (
                            <div className="space-y-3">
                                {incompleteMITs.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 group">
                                        <button 
                                            onClick={() => updateTaskStatus(task.projectId!, task.id, 'Concluído')}
                                            className="w-6 h-6 flex-shrink-0 rounded-md border-2 border-gray-600 group-hover:border-blue-500 transition-colors flex items-center justify-center"
                                        >
                                            {/* Check icon can be added here on completion */}
                                        </button>
                                        <span className="text-gray-200 group-hover:text-white transition-colors">{task.content}</span>
                                    </div>
                                ))}
                            </div>
                        ) : todaysMITs.length > 0 ? (
                             <p className="text-green-400">{t('todayView.allMissionsComplete')}</p>
                        ) : (
                            <p className="text-gray-500">{t('todayView.noMissions')}</p>
                        )}
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
