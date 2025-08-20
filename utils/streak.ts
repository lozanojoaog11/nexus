import { Habit } from '../types';

export const calculateCurrentStreak = (history: { date: string, completed: boolean }[]): number => {
    if (!history || history.length === 0) return 0;

    const completedDates = history
      .filter(h => h.completed)
      .map(h => h.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
    return calculateDateStreak(completedDates);
};

export const calculateDateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;
    
    const uniqueSortedDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastDateStr = uniqueSortedDates[0];
    
    // Streak is broken if the last entry is older than yesterday
    if (lastDateStr < yesterdayStr) {
      return 0;
    }
    
    // If the last entry is today or yesterday, the streak is at least 1
    streak = 1;
    
    for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
        const current = new Date(uniqueSortedDates[i]);
        const next = new Date(uniqueSortedDates[i + 1]);
        
        const diff = (current.getTime() - next.getTime()) / (1000 * 3600 * 24);

        if (diff === 1) {
            streak++;
        } else {
            // Break the loop as soon as a day is skipped
            break;
        }
    }

    return streak;
};