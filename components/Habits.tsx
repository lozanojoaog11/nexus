

import React, { useMemo } from 'react';
import { Habit } from '../types';
import { PlusIcon, ACCENT_COLOR } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface HabitsProps {
  habits: Habit[];
  toggleHabitCompletion: (habitId: string, date: string, isCompleted: boolean) => void;
  onAddHabit: () => void;
  onDeleteHabit: (habitId: string) => void;
}

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const HabitRow: React.FC<{
    habit: Habit;
    onToggle: (habitId: string, date: string, isCompleted: boolean) => void;
    onDelete: (habitId: string) => void;
}> = ({ habit, onToggle, onDelete }) => {
    const { t } = useTranslation();
    
    const completionRate = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const completedInLast30Days = (habit.history || []).filter(h => 
            h.completed && new Date(h.date) >= thirtyDaysAgo
        ).length;
        return Math.round((completedInLast30Days / 30) * 100);
    }, [habit.history]);

    const todayStr = new Date().toISOString().split('T')[0];
    const isCompletedToday = (habit.history || []).some(h => h.date === todayStr && h.completed);

    const translatedCategory = {
        'Mente': t('addHabitModal.mind'),
        'Corpo': t('addHabitModal.body'),
        'Execução': t('addHabitModal.execution'),
    }[habit.category] || habit.category;

    return (
        <div className="grid grid-cols-12 items-center gap-4 p-4 bg-[#1C1C1C] rounded-lg border border-white/10 group">
            <div className="col-span-5 flex items-center gap-3">
                {habit.isKeystone && <span title={t('habits.keystoneTooltip')}>🔑</span>}
                <div>
                    <p className="font-semibold text-white">{habit.name}</p>
                    <p className="text-xs text-gray-400">{translatedCategory}</p>
                </div>
            </div>
            <div className="col-span-2 text-center">
                <p className="font-bold text-lg text-white">{completionRate}%</p>
                <p className="text-xs text-gray-500">{t('habits.completion')}</p>
            </div>
            <div className="col-span-2 text-center">
                <p className="font-bold text-lg" style={{color: ACCENT_COLOR}}>{(habit as any).currentStreak || 0}</p>
                <p className="text-xs text-gray-500">{t('habits.currentStreak')}</p>
            </div>
            <div className="col-span-2 text-center">
                <p className="font-bold text-lg text-white">{habit.bestStreak || 0}</p>
                <p className="text-xs text-gray-500">{t('habits.bestStreak')}</p>
            </div>
            <div className="col-span-1 flex justify-end items-center">
                <button
                    onClick={() => onToggle(habit.id, todayStr, isCompletedToday)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                        isCompletedToday
                        ? `bg-[#00A9FF]/20 border-[#00A9FF]`
                        : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                    }`}
                >
                    {isCompletedToday && <CheckIcon className={`w-5 h-5 text-[#00A9FF]`} />}
                </button>
                 <button onClick={() => onDelete(habit.id)} className="ml-2 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
}

const Habits: React.FC<HabitsProps> = ({ habits, toggleHabitCompletion, onAddHabit, onDeleteHabit }) => {
  const { t } = useTranslation();
  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in-up">
      <header className="mb-8 flex-shrink-0 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">{t('habits.title')}</h1>
            <p className="text-gray-400 mt-1">{t('habits.subtitle')}</p>
        </div>
        <button
            onClick={onAddHabit}
            className="bg-[#00A9FF] text-black font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{t('habits.newHabit')}</span>
        </button>
      </header>

      <div className="flex-grow overflow-y-auto pr-2 space-y-3">
        {habits.map(habit => (
            <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
                onDelete={onDeleteHabit}
            />
        ))}
        {habits.length === 0 && (
            <div className="text-center text-gray-500 pt-16">
                <p>{t('habits.noHabits')}</p>
                <p className="mt-2">{t('habits.noHabitsCta')}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Habits;