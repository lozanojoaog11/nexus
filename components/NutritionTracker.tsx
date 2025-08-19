
import React, { useState } from 'react';
import { NutritionData, MealEntry } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface NutritionTrackerProps {
  nutritionData: NutritionData | undefined;
  onUpdate: (data: NutritionData) => void;
  onBack: () => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ nutritionData, onUpdate, onBack }) => {
    const { t } = useTranslation();
    const [data, setData] = useState<NutritionData>(nutritionData || {
        calories: 2000, macros: { protein: 150, carbs: 200, fat: 80 }, meals: [], fastingWindow: 16, lastMeal: '20:00', hydrationLevel: 7, energyStability: 7
    });
    
    // States for new meal form
    const [newMeal, setNewMeal] = useState<Omit<MealEntry, 'time'>>({type: 'lunch', description: '', portion: 'medium', satisfaction: 7});
    const [isAddingMeal, setIsAddingMeal] = useState(false);

    const handleSave = () => {
        onUpdate(data);
        onBack();
    };

    const addMeal = () => {
        const mealToAdd: MealEntry = {
            ...newMeal,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setData(prev => ({ ...prev, meals: [...prev.meals, mealToAdd] }));
        setIsAddingMeal(false);
        setNewMeal({type: 'lunch', description: '', portion: 'medium', satisfaction: 7});
    };

    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{t('biohacking.nutrition.title')}</h1>
                    <p className="text-gray-400">{t('biohacking.nutrition.description')}</p>
                </div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('biohacking.nutrition.dailyTotals')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-sm text-gray-400">{t('biohacking.nutrition.calories')}</label><input type="number" value={data.calories} onChange={e => setData(d => ({...d, calories: +e.target.value}))} className="w-full bg-gray-800 p-2 rounded mt-1"/></div>
                    <div><label className="text-sm text-gray-400">{t('biohacking.nutrition.protein')}</label><input type="number" value={data.macros.protein} onChange={e => setData(d => ({...d, macros: {...d.macros, protein: +e.target.value}}))} className="w-full bg-gray-800 p-2 rounded mt-1"/></div>
                    <div><label className="text-sm text-gray-400">{t('biohacking.nutrition.carbs')}</label><input type="number" value={data.macros.carbs} onChange={e => setData(d => ({...d, macros: {...d.macros, carbs: +e.target.value}}))} className="w-full bg-gray-800 p-2 rounded mt-1"/></div>
                    <div><label className="text-sm text-gray-400">{t('biohacking.nutrition.fat')}</label><input type="number" value={data.macros.fat} onChange={e => setData(d => ({...d, macros: {...d.macros, fat: +e.target.value}}))} className="w-full bg-gray-800 p-2 rounded mt-1"/></div>
                </div>
                 <div className="mt-4">
                    <label className="text-sm text-gray-400">{t('biohacking.nutrition.energyStability')}: {data.energyStability}/10</label>
                    <input type="range" min="1" max="10" value={data.energyStability} onChange={e => setData(d => ({...d, energyStability: +e.target.value}))} className="w-full accent-green-500"/>
                </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                 <h3 className="text-lg font-semibold mb-4">{t('biohacking.nutrition.fasting')}</h3>
                 <div><label className="text-sm text-gray-400">{t('biohacking.nutrition.fastingWindow')}: {data.fastingWindow}h</label><input type="range" min="12" max="20" value={data.fastingWindow} onChange={e => setData(d => ({...d, fastingWindow: +e.target.value}))} className="w-full accent-green-500"/></div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('biohacking.nutrition.meals')}</h3>
                    {!isAddingMeal && <button onClick={() => setIsAddingMeal(true)} className="bg-green-600 px-3 py-1 rounded text-sm font-semibold hover:bg-green-700">+</button>}
                </div>
                {isAddingMeal && (
                    <div className="p-4 bg-gray-800 rounded-lg mb-4 space-y-3">
                        <h4 className="font-semibold">{t('biohacking.nutrition.meal.add')}</h4>
                        <div><label className="text-sm">{t('biohacking.nutrition.meal.type')}</label><select value={newMeal.type} onChange={e=>setNewMeal(m=>({...m, type: e.target.value as any}))} className="w-full bg-gray-700 p-2 rounded mt-1"><option value="breakfast">{t('biohacking.nutrition.meal.types.breakfast')}</option><option value="lunch">{t('biohacking.nutrition.meal.types.lunch')}</option><option value="dinner">{t('biohacking.nutrition.meal.types.dinner')}</option><option value="snack">{t('biohacking.nutrition.meal.types.snack')}</option></select></div>
                        <div><label className="text-sm">{t('biohacking.nutrition.meal.description')}</label><input type="text" placeholder={t('biohacking.nutrition.meal.descriptionPlaceholder')} value={newMeal.description} onChange={e=>setNewMeal(m=>({...m, description: e.target.value}))} className="w-full bg-gray-700 p-2 rounded mt-1"/></div>
                        <div><label className="text-sm">{t('biohacking.nutrition.meal.portion')}</label><select value={newMeal.portion} onChange={e=>setNewMeal(m=>({...m, portion: e.target.value as any}))} className="w-full bg-gray-700 p-2 rounded mt-1"><option value="small">{t('biohacking.nutrition.meal.portions.small')}</option><option value="medium">{t('biohacking.nutrition.meal.portions.medium')}</option><option value="large">{t('biohacking.nutrition.meal.portions.large')}</option></select></div>
                        <div><label className="text-sm">{t('biohacking.nutrition.meal.satisfaction')}: {newMeal.satisfaction}</label><input type="range" min="1" max="10" value={newMeal.satisfaction} onChange={e=>setNewMeal(m=>({...m, satisfaction: +e.target.value}))} className="w-full accent-green-500"/></div>
                        <div className="flex gap-2 justify-end"><button onClick={()=>setIsAddingMeal(false)} className="bg-gray-600 px-3 py-1 text-xs rounded">Cancelar</button><button onClick={addMeal} className="bg-green-600 px-3 py-1 text-xs rounded">Adicionar</button></div>
                    </div>
                )}
                <div className="space-y-3">
                    {data.meals.length > 0 ? data.meals.map((meal, i) => (
                        <div key={i} className="p-3 bg-gray-800/50 rounded flex justify-between">
                            <div><span className="font-semibold capitalize">{t(`biohacking.nutrition.meal.types.${meal.type}`)}</span> - <span className="text-gray-300">{meal.description}</span></div>
                            <div className="text-sm text-gray-400">{meal.portion} / {meal.satisfaction}/10</div>
                        </div>
                    )) : <p className="text-gray-500 text-center">{t('biohacking.nutrition.noMeals')}</p>}
                </div>
            </div>

             <button onClick={handleSave} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg">{t('biohacking.nutrition.save')}</button>
        </div>
    );
};
export default NutritionTracker;
