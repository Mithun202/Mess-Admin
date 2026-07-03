import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, User, RefreshCw, Eye } from 'lucide-react';
import { Member, MealRecord } from '../types';
import { LanguageStrings } from '../translations';

interface MealManagerProps {
  currentMessId: string;
  members: Member[];
  meals: MealRecord[];
  currency: string;
  onUpdateMeals: (updatedMeals: Omit<MealRecord, 'id'>[]) => void;
  t: LanguageStrings;
  hasEditPermission: boolean;
  lang: 'bn' | 'en';
}

export default function MealManager({
  currentMessId,
  members,
  meals,
  currency,
  onUpdateMeals,
  t,
  hasEditPermission,
  lang,
}: MealManagerProps) {
  // Filter only active members of this mess
  const activeMembers = members.filter(m => m.messId === currentMessId && m.status === 'active');
  
  // Set current selected date (default to today: 2026-07-02)
  const [selectedDate, setSelectedDate] = useState('2026-07-02');
  const [editingMeals, setEditingMeals] = useState<Record<string, { breakfast: number; lunch: number; dinner: number }>>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Initialize/Load meals for this selected date
  const getMealForMember = (memberId: string) => {
    const meal = meals.find(m => m.messId === currentMessId && m.memberId === memberId && m.date === selectedDate);
    return meal || { breakfast: 0, lunch: 0, dinner: 0 };
  };

  // Sync state when selectedDate changes or component renders
  React.useEffect(() => {
    const stateInit: Record<string, { breakfast: number; lunch: number; dinner: number }> = {};
    activeMembers.forEach(m => {
      const meal = getMealForMember(m.id);
      stateInit[m.id] = {
        breakfast: meal.breakfast,
        lunch: meal.lunch,
        dinner: meal.dinner
      };
    });
    setEditingMeals(stateInit);
  }, [selectedDate, meals, currentMessId]);

  const handleValueChange = (memberId: string, mealType: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    const parsed = parseFloat(value);
    const num = isNaN(parsed) ? 0 : Math.max(0, Math.min(5, parsed));
    setEditingMeals(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [mealType]: num
      }
    }));
  };

  const applyPreset = (memberId: string, type: 'full' | 'half' | 'none' | 'lunch_dinner') => {
    let preset = { breakfast: 0, lunch: 0, dinner: 0 };
    if (type === 'full') preset = { breakfast: 1, lunch: 1, dinner: 1 };
    if (type === 'half') preset = { breakfast: 0.5, lunch: 0.5, dinner: 0.5 };
    if (type === 'lunch_dinner') preset = { breakfast: 0, lunch: 1, dinner: 1 };
    
    setEditingMeals(prev => ({
      ...prev,
      [memberId]: preset
    }));
  };

  const handleSave = () => {
    const updates: Omit<MealRecord, 'id'>[] = activeMembers.map(m => {
      const edit = editingMeals[m.id] || { breakfast: 0, lunch: 0, dinner: 0 };
      return {
        memberId: m.id,
        messId: currentMessId,
        date: selectedDate,
        breakfast: edit.breakfast,
        lunch: edit.lunch,
        dinner: edit.dinner,
      };
    });
    
    onUpdateMeals(updates);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Navigating selected date
  const adjustDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div id="meal-manager" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      {/* Date Header Control */}
      <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            {t.dailyMealLedger}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.mealLedgerSubtitle}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
          <button
            onClick={() => adjustDate(-1)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title={t.previousDay}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-mono text-sm px-2 py-1 text-slate-700 bg-transparent border-none focus:outline-none text-center cursor-pointer"
          />
          
          <button
            onClick={() => adjustDate(1)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title={t.nextDay}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meals Grid/List */}
      <div className="p-6">
        {!hasEditPermission && (
          <div className="mb-4 bg-amber-50/65 border border-amber-100 rounded-xl p-3.5 flex items-center gap-3 text-amber-800 text-xs font-semibold">
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lang === 'bn' 
                ? 'ভিউয়ার মোড: আপনি এই মেসে সাধারণ সদস্য হওয়ায় ডাটা পরিবর্তন করতে পারবেন না। শুধুমাত্র এডমিন মিল খাতা পরিবর্তন করতে পারবেন।' 
                : 'Viewer Mode: As a standard member in this mess, you are in read-only mode. Only Admin accounts can write to the ledger.'}
            </span>
          </div>
        )}

        {activeMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No active members found in this mess.</p>
            <p className="text-xs text-slate-400 mt-1">Please add active members first to start tracking meals.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 w-1/4">{t.member}</th>
                    <th className="pb-3 text-center">{t.dailyMealLedger.split(' ')[0] === 'Daily' ? 'Breakfast' : 'সকাল'} (B)</th>
                    <th className="pb-3 text-center">{t.dailyMealLedger.split(' ')[0] === 'Daily' ? 'Lunch' : 'দুপুর'} (L)</th>
                    <th className="pb-3 text-center">{t.dailyMealLedger.split(' ')[0] === 'Daily' ? 'Dinner' : 'রাত'} (D)</th>
                    <th className="pb-3 text-center">{t.totalMeals}</th>
                    <th className="pb-3 text-right">{t.quickPresets}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeMembers.map(m => {
                    const edit = editingMeals[m.id] || { breakfast: 0, lunch: 0, dinner: 0 };
                    const totalDayMeals = edit.breakfast + edit.lunch + edit.dinner;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Member Profile */}
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm border border-slate-200">
                              {m.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-slate-700 text-sm">{m.name}</p>
                              <span className="inline-block text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded uppercase mt-0.5">
                                {m.role === 'admin' ? t.messAdminRole : m.role === 'manager' ? (lang === 'bn' ? 'ম্যানেজার' : 'Manager') : t.messMemberRole}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Breakfast */}
                        <td className="py-4 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="5"
                            disabled={!hasEditPermission}
                            value={edit.breakfast === 0 ? '' : edit.breakfast}
                            placeholder="0"
                            onChange={(e) => handleValueChange(m.id, 'breakfast', e.target.value)}
                            className={`w-16 px-2 py-1 text-center font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                              !hasEditPermission ? 'bg-slate-50 text-slate-400 border-slate-150 cursor-not-allowed' : 'border-slate-200'
                            }`}
                          />
                        </td>

                        {/* Lunch */}
                        <td className="py-4 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="5"
                            disabled={!hasEditPermission}
                            value={edit.lunch === 0 ? '' : edit.lunch}
                            placeholder="0"
                            onChange={(e) => handleValueChange(m.id, 'lunch', e.target.value)}
                            className={`w-16 px-2 py-1 text-center font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                              !hasEditPermission ? 'bg-slate-50 text-slate-400 border-slate-150 cursor-not-allowed' : 'border-slate-200'
                            }`}
                          />
                        </td>

                        {/* Dinner */}
                        <td className="py-4 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="5"
                            disabled={!hasEditPermission}
                            value={edit.dinner === 0 ? '' : edit.dinner}
                            placeholder="0"
                            onChange={(e) => handleValueChange(m.id, 'dinner', e.target.value)}
                            className={`w-16 px-2 py-1 text-center font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                              !hasEditPermission ? 'bg-slate-50 text-slate-400 border-slate-150 cursor-not-allowed' : 'border-slate-200'
                            }`}
                          />
                        </td>

                        {/* Member Total */}
                        <td className="py-4 text-center font-mono font-semibold text-slate-700 text-sm">
                          {totalDayMeals.toFixed(1)}
                        </td>

                        {/* Quick Presets */}
                        <td className="py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={!hasEditPermission}
                              onClick={() => applyPreset(m.id, 'full')}
                              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                                !hasEditPermission 
                                  ? 'text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed opacity-60' 
                                  : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                              }`}
                              title="1 + 1 + 1 meals"
                            >
                              {t.fullPreset}
                            </button>
                            <button
                              type="button"
                              disabled={!hasEditPermission}
                              onClick={() => applyPreset(m.id, 'lunch_dinner')}
                              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                                !hasEditPermission 
                                  ? 'text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed opacity-60' 
                                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                              }`}
                              title="0 + 1 + 1 meals"
                            >
                              {t.ldPreset}
                            </button>
                            <button
                              type="button"
                              disabled={!hasEditPermission}
                              onClick={() => applyPreset(m.id, 'none')}
                              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                                !hasEditPermission 
                                  ? 'text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed opacity-60' 
                                  : 'text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer'
                              }`}
                              title="Reset to 0"
                            >
                              {t.skipPreset}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 gap-3">
              <span className="text-xs text-slate-400">
                {t.bazaarToggleDesc}
              </span>
              
              <div className="flex items-center gap-3">
                {isSavedNotice && (
                  <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
                    <Check className="w-4 h-4" />
                    {t.savedNotice}
                  </span>
                )}
                
                {hasEditPermission ? (
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/10 flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t.saveDailyLedger}
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200/50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'শুধুমাত্র এডমিন এডিট করতে পারবেন' : 'Read-Only: Admin view only'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
