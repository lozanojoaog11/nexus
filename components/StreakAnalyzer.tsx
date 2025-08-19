
import React from 'react';
import { StreakData, Habit } from '../types';

interface StreakAnalyzerProps {
  streaks: StreakData[];
  habits: Habit[];
  onBack: () => void;
}

const StreakAnalyzer: React.FC<StreakAnalyzerProps> = ({ streaks, habits, onBack }) => {
  return (
    <div className="p-8 text-white w-full h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Streak Analyzer</h1>
          <p className="text-gray-400">This module is under development.</p>
        </div>
      </div>
      <div className="text-center p-8 bg-gray-800/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Streak Analysis</h2>
        <p className="text-gray-400">Detailed analysis of your consistency patterns will be available here soon.</p>
      </div>
    </div>
  );
};

export default StreakAnalyzer;