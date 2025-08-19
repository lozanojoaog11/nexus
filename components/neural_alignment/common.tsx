import React from 'react';

export const SliderInput: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    color: string;
    inverted?: boolean;
}> = ({ label, value, onChange, color, inverted = false }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">{label}</label>
            <span className={`text-lg font-bold text-${color}-400`}>{value}</span>
        </div>
        <input
            type="range" min="1" max="10" step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`w-full accent-${color}-500`}
        />
    </div>
);

export const EnergySlider: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    color: string;
}> = ({ label, value, onChange, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">{label}</label>
            <span className={`text-sm font-bold text-${color}-400`}>{value}%</span>
        </div>
        <input
            type="range" min="0" max="100" step="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`w-full accent-${color}-500`}
        />
    </div>
);

export const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-gray-800/30 p-3 rounded-lg text-center">
        <div className="text-white font-bold text-lg">{value}</div>
        <div className="text-gray-400 text-xs">{label}</div>
    </div>
);
