import React from 'react';
import { EnvironmentSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface EnvironmentControlsProps {
    environment: EnvironmentSettings;
    onChange: (env: EnvironmentSettings) => void;
}

const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({ environment, onChange }) => {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-2">{t('flowLab.env.musicType')}</label>
                <select value={environment.musicType} onChange={(e) => onChange({ ...environment, musicType: e.target.value as any })} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600">
                    <option value="none">{t('flowLab.env.music.none')}</option><option value="focus">{t('flowLab.env.music.focus')}</option><option value="ambient">{t('flowLab.env.music.ambient')}</option><option value="binaural">{t('flowLab.env.music.binaural')}</option><option value="nature">{t('flowLab.env.music.nature')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">{t('flowLab.env.noiseLevel')}</label>
                <select value={environment.noiseLevel} onChange={(e) => onChange({ ...environment, noiseLevel: e.target.value as any })} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600">
                    <option value="silent">{t('flowLab.env.noise.silent')}</option><option value="minimal">{t('flowLab.env.noise.minimal')}</option><option value="moderate">{t('flowLab.env.noise.moderate')}</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={environment.distractionsBlocked} onChange={(e) => onChange({ ...environment, distractionsBlocked: e.target.checked })} className="accent-blue-500" /><span className="text-sm text-gray-300">{t('flowLab.env.blockDistractions')}</span></label>
            </div>
        </div>
    );
};

export default EnvironmentControls;
