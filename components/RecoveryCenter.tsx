
import React from 'react';
import { RecoveryData } from '../types';

interface RecoveryCenterProps {
  recoveryData: RecoveryData | undefined;
  onUpdate: (data: RecoveryData) => void;
  onBack: () => void;
}

const RecoveryCenter: React.FC<RecoveryCenterProps> = ({ onBack }) => {
    return (
        <div className="p-8 text-white w-full h-full">
            <button onClick={onBack} className="mb-4 text-sm hover:text-gray-300">{'< Back to Overview'}</button>
            <div className="text-center p-8 bg-gray-800/50 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Recovery Center</h2>
                <p className="text-gray-400">This module is under development.</p>
            </div>
        </div>
    );
};
export default RecoveryCenter;