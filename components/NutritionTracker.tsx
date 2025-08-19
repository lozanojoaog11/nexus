
import React from 'react';
import { NutritionData } from '../types';

interface NutritionTrackerProps {
  nutritionData: NutritionData | undefined;
  onUpdate: (data: NutritionData) => void;
  onBack: () => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ onBack }) => {
    return (
        <div className="p-8 text-white w-full h-full">
            <button onClick={onBack} className="mb-4 text-sm hover:text-gray-300">{'< Back to Overview'}</button>
            <div className="text-center p-8 bg-gray-800/50 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Nutrition Tracker</h2>
                <p className="text-gray-400">This module is under development.</p>
            </div>
        </div>
    );
};
export default NutritionTracker;