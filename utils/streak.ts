import { Habit } from '../types';

export const calculateCurrentStreak = (history: { date: string, completed: boolean }[]): number => {
    let streak = 0;
    const sortedHistory = [...(history || [])]
      .filter(h => h.completed)
      .map(h => h.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedHistory.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const lastCompletionDate = new Date(sortedHistory[0]);
    
    if (lastCompletionDate.toISOString().split('T')[0] !== todayStr && lastCompletionDate.toISOString().split('T')[0] !== yesterdayStr) {
      return 0;
    }

    streak = 1;
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i]);
      const next = new Date(sortedHistory[i+1]);
      
      const diff = (current.getTime() - next.getTime()) / (1000 * 3600 * 24);
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
};
