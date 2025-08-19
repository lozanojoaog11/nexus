
import React, { useState } from 'react';
import { Achievement } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AchievementGalleryProps {
  achievements: Achievement[];
  onBack: () => void;
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ achievements, onBack }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const categories = ['all', 'cognitive', 'physical', 'social', 'spiritual', 'mastery'];
  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const tierMatch = selectedTier === 'all' || achievement.tier === selectedTier;
    return categoryMatch && tierMatch;
  });

  const unlockedCount = filteredAchievements.filter(a => a.unlockedAt).length;

  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('achievements.gallery.title')}</h1>
          <p className="text-gray-400">
            {t('achievements.gallery.subtitle', { unlocked: unlockedCount, total: filteredAchievements.length })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('achievements.gallery.category')}</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {t(`achievements.gallery.categories.${cat}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('achievements.gallery.tier')}</label>
          <select 
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            {tiers.map(tier => (
              <option key={tier} value={tier}>
                {t(`achievements.gallery.tiers.${tier}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map(achievement => (
          <AchievementDetailCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

const AchievementDetailCard: React.FC<{achievement: Achievement}> = ({ achievement }) => {
  const { t, language } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  
  const tierColors: Record<string, string> = { bronze: 'from-amber-600 to-amber-800', silver: 'from-gray-400 to-gray-600', gold: 'from-yellow-400 to-yellow-600', platinum: 'from-blue-400 to-purple-600', diamond: 'from-cyan-400 to-blue-600' };

  const isUnlocked = !!achievement.unlockedAt;
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div className={`relative p-6 rounded-xl border transition-all cursor-pointer ${ isUnlocked ? `bg-gradient-to-br ${tierColors[achievement.tier]} border-transparent shadow-lg` : 'bg-gray-900/50 border-gray-700 hover:border-gray-600' }`} onClick={() => setShowDetails(!showDetails)}>
      {isUnlocked && <div className="absolute top-2 right-2"><span className="text-2xl animate-pulse">✨</span></div>}
      <div className="text-center mb-4"><span className="text-4xl mb-2 block">{achievement.icon}</span><h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.name}</h3></div>
      <p className={`text-sm text-center mb-4 ${isUnlocked ? 'text-gray-200' : 'text-gray-500'}`}>{achievement.description}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{t('achievements.progress')}</span><span className={isUnlocked ? 'text-white' : 'text-gray-400'}>{achievement.progress}/{achievement.maxProgress}</span></div>
        <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-600'}`} style={{width: `${progressPercent}%`}}></div></div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${isUnlocked ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>{achievement.tier}</span>
        <span className={`font-bold ${isUnlocked ? 'text-yellow-300' : 'text-gray-500'}`}>+{achievement.xpReward} XP</span>
      </div>
      {showDetails && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg">
          <div className="text-xs text-gray-300 mb-2">{t('achievements.gallery.scientificBasis')}:</div><div className="text-sm text-gray-200">{achievement.scientificBasis}</div>
          {achievement.requirements.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-300 mb-2">{t('achievements.gallery.requirements')}:</div>
              {achievement.requirements.map((req, index) => <div key={index} className="text-sm text-gray-200">• {req.type}: {req.target} {req.timeframe ? `${t('achievements.gallery.timeframes.per')} ${t(`achievements.gallery.timeframes.${req.timeframe}`)}` : ''}</div>)}
            </div>
          )}
        </div>
      )}
      {isUnlocked && achievement.unlockedAt && <div className="mt-3 text-xs text-gray-300 text-center">{t('achievements.unlocked')}: {new Date(achievement.unlockedAt).toLocaleDateString(language)}</div>}
    </div>
  );
};

export default AchievementGallery;