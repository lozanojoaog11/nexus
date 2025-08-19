import React, { useState, useMemo } from 'react';
import { Achievement, UserLevel, StreakData } from '../types';
import AchievementGallery from './AchievementGallery';
import StreakAnalyzer from './StreakAnalyzer';
import { useTranslation } from '../hooks/useTranslation';

interface ConstellationProps {
  achievements: Achievement[];
  userLevel: UserLevel;
  activeStreaks: StreakData[];
}

const AchievementConstellation: React.FC<ConstellationProps> = ({
  achievements, userLevel, activeStreaks
}) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'analytics' | 'streaks'>('overview');

  if (activeTab === 'overview') {
    return (
      <div className="p-8 text-white w-full h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">{t('achievements.title')}</h1>
          <p className="text-gray-400 mt-2">{t('achievements.subtitle')}</p>
        </header>
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-2xl border border-purple-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-purple-400">{userLevel.title}</h2>
              <p className="text-gray-300">{userLevel.evolutionStage}</p>
              <p className="text-sm text-gray-400 mt-2">{t('achievements.level')} {userLevel.currentLevel} {t('achievements.architect')}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-yellow-400">{userLevel.totalXP}</div>
              <div className="text-gray-400 text-sm">{t('achievements.totalXp')}</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{t('achievements.progressToLevel', { level: userLevel.currentLevel + 1 })}</span>
              <span>{userLevel.currentXP} / {userLevel.currentXP + userLevel.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3"><div className="bg-gradient-to-r from-yellow-400 to-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${(userLevel.currentXP / (userLevel.currentXP + userLevel.xpToNextLevel)) * 100}%` }}></div></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {activeStreaks.map(streak => <StreakCard key={streak.type} streak={streak} />)}
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{t('achievements.recent')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.filter(a => a.unlockedAt).slice(-6).map(a => <AchievementCard key={a.id} achievement={a} isRecent />)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['cognitive', 'physical', 'mastery'].map(category => {
            const catAchievements = achievements.filter(a => a.category === category);
            const unlocked = catAchievements.filter(a => a.unlockedAt).length;
            return <CategoryProgress key={category} category={category} unlocked={unlocked} total={catAchievements.length} onClick={() => setActiveTab('achievements')} />;
          })}
        </div>
      </div>
    );
  }
  if (activeTab === 'achievements') {
    return <AchievementGallery achievements={achievements} onBack={() => setActiveTab('overview')} />;
  }
  if (activeTab === 'streaks') {
    return <StreakAnalyzer streaks={activeStreaks} habits={[]} onBack={() => setActiveTab('overview')} />;
  }
  return null;
};

// SUB-COMPONENTS
const StreakCard: React.FC<{streak: StreakData}> = ({ streak }) => {
  const streakColor = streak.count >= 7 ? 'text-green-400' : streak.count >= 3 ? 'text-yellow-400' : 'text-gray-400';
  const fireEmoji = streak.count >= 7 ? '🔥' : streak.count >= 3 ? '⚡' : '💫';
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4"><span className="text-2xl">{fireEmoji}</span><span className={`text-3xl font-bold ${streakColor}`}>{streak.count}</span></div>
      <div className="text-white font-medium">{streak.type}</div>
      <div className="text-sm text-gray-400">Best: {streak.bestStreak} days</div>
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement; isRecent?: boolean; }> = ({ achievement, isRecent = false }) => {
  const { t, language } = useTranslation();
  const tierColors: Record<string, string> = { bronze: 'from-amber-600 to-amber-800', silver: 'from-gray-400 to-gray-600', gold: 'from-yellow-400 to-yellow-600', platinum: 'from-blue-400 to-purple-600', diamond: 'from-cyan-400 to-blue-600' };
  const isUnlocked = !!achievement.unlockedAt;
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
  return (
    <div className={`relative p-6 rounded-xl border transition-all ${isUnlocked ? `bg-gradient-to-br ${tierColors[achievement.tier]} border-transparent shadow-lg` : 'bg-gray-900/50 border-gray-700'} ${isRecent ? 'animate-pulse' : ''}`}>
      {isUnlocked && <div className="absolute top-2 right-2"><span className="text-2xl">✨</span></div>}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{achievement.icon}</span>
        <div><h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.name}</h3><p className={`text-sm ${isUnlocked ? 'text-gray-200' : 'text-gray-500'}`}>{achievement.description}</p></div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{t('achievements.progress')}</span><span className={isUnlocked ? 'text-white' : 'text-gray-400'}>{achievement.progress}/{achievement.maxProgress}</span></div>
        <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-600'}`} style={{width: `${progressPercent}%`}}></div></div>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${isUnlocked ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>{achievement.tier}</span>
        <span className={`font-bold ${isUnlocked ? 'text-yellow-300' : 'text-gray-500'}`}>+{achievement.xpReward} XP</span>
      </div>
      {isUnlocked && achievement.unlockedAt && <div className="mt-3 text-xs text-gray-300 text-center">{t('achievements.unlocked')}: {new Date(achievement.unlockedAt).toLocaleDateString(language)}</div>}
    </div>
  );
};

const CategoryProgress: React.FC<{ category: string; unlocked: number; total: number; onClick: () => void; }> = ({ category, unlocked, total, onClick }) => {
  const { t } = useTranslation();
  const categoryIcons: Record<string, string> = { cognitive: '🧠', physical: '💪', social: '🌟', spiritual: '🧘', mastery: '👑' };
  const categoryColors: Record<string, string> = { cognitive: 'from-purple-500 to-blue-600', physical: 'from-green-500 to-emerald-600', social: 'from-yellow-500 to-orange-600', spiritual: 'from-indigo-500 to-purple-600', mastery: 'from-red-500 to-pink-600' };
  const completionRate = total > 0 ? (unlocked / total) * 100 : 0;
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${categoryColors[category]} flex items-center justify-center text-2xl`}>{categoryIcons[category]}</div>
        <div><h3 className="font-bold capitalize">{t(`achievements.categories.${category}`)}</h3><p className="text-sm text-gray-400">{unlocked}/{total} {t('achievements.unlocked')}</p></div>
      </div>
      <div className="mb-3"><div className="w-full bg-gray-700 rounded-full h-3"><div className={`h-3 rounded-full bg-gradient-to-r ${categoryColors[category]} transition-all duration-500`} style={{width: `${completionRate}%`}}></div></div></div>
      <div className="text-center"><span className="text-lg font-bold text-white">{Math.round(completionRate)}%</span><span className="text-gray-400 text-sm ml-1">{t('achievements.complete')}</span></div>
    </div>
  );
};

export default AchievementConstellation;
