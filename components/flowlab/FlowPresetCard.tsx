import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface FlowPresetCardProps {
    preset: any;
    onSelect: () => void;
    currentEnergy: number;
}

const FlowPresetCard: React.FC<FlowPresetCardProps> = ({ preset, onSelect, currentEnergy }) => {
    const { t } = useTranslation();
    const compatibility = currentEnergy >= 7 ? t('flowLab.presets.compat.high') : currentEnergy >= 5 ? t('flowLab.presets.compat.medium') : t('flowLab.presets.compat.low');
    const compatibilityColor = currentEnergy >= 7 ? 'text-green-400' : currentEnergy >= 5 ? 'text-yellow-400' : 'text-red-400';
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${preset.color} flex items-center justify-center text-2xl`}>{preset.icon}</div>
                <div><h3 className="font-bold">{t(preset.nameKey)}</h3><p className="text-sm text-gray-400">{preset.duration} {t('flowLab.minutes')}</p></div>
            </div>
            <p className="text-sm text-gray-300 mb-4">{t(preset.descKey)}</p>
            <div className="flex justify-between items-center mb-4"><span className="text-xs text-gray-400">{t('flowLab.presets.compatibility')}:</span><span className={`text-xs font-bold ${compatibilityColor}`}>{compatibility}</span></div>
            <button onClick={onSelect} className={`w-full py-2 rounded-lg bg-gradient-to-r ${preset.color} text-white font-medium hover:opacity-90`}>{t('flowLab.presets.startFlow')}</button>
        </div>
    );
};

export default FlowPresetCard;
