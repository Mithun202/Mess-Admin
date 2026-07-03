import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Tooltip, XAxis, YAxis } from 'recharts';
import { 
  ArrowRight, 
  BadgePercent, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  Users, 
  Calendar, 
  TrendingUp, 
  Lock, 
  Check, 
  History, 
  Clock, 
  Filter, 
  RefreshCcw, 
  DollarSign, 
  TrendingDown, 
  User, 
  Tag,
  CalendarDays
} from 'lucide-react';
import { Member, MealRecord, Expense, Deposit, CalculatedSummary, HistoryLog } from '../types';
import { LanguageStrings } from '../translations';
import { calculateMessSummary } from '../utils';

interface AnalyticsDashboardProps {
  summary: CalculatedSummary;
  currency: string;
  t: LanguageStrings;
  members: Member[];
  meals: MealRecord[];
  expenses: Expense[];
  deposits: Deposit[];
  currentMessId: string;
  historyLogs: HistoryLog[];
  lang: 'bn' | 'en';
}

export default function AnalyticsDashboard({ 
  summary: initialSummary, 
  currency, 
  t, 
  members, 
  meals, 
  expenses, 
  deposits, 
  currentMessId,
  historyLogs,
  lang,
}: AnalyticsDashboardProps) {
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'
  const [selectedMember, setSelectedMember] = useState<string>('all'); // 'all' or memberId
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 'all', 'groceries', 'utilities', 'rent', 'cook', 'others'
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const messMembers = useMemo(() => members.filter(m => m.messId === currentMessId), [members, currentMessId]);

  // 1. Automatically scan dates to detect all active months in the system
  const availableMonths = useMemo(() => {
    const datesSet = new Set<string>();
    
    meals.filter(m => m.messId === currentMessId).forEach(m => {
      if (m.date) datesSet.add(m.date.substring(0, 7));
    });
    expenses.filter(e => e.messId === currentMessId).forEach(e => {
      if (e.date) datesSet.add(e.date.substring(0, 7));
    });
    deposits.filter(d => d.messId === currentMessId).forEach(d => {
      if (d.date) datesSet.add(d.date.substring(0, 7));
    });

    const months = Array.from(datesSet).sort().reverse();
    return months.length > 0 ? months : [new Date().toISOString().substring(0, 7)];
  }, [meals, expenses, deposits, currentMessId]);

  // Set default month filter to the latest month when available
  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedMonth === 'all') {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths]);

  // 2. Perform dynamic, multi-factor filtering of meals, expenses, and deposits
  const filteredCollections = useMemo(() => {
    let filteredMeals = meals.filter(m => m.messId === currentMessId);
    let filteredExpenses = expenses.filter(e => e.messId === currentMessId);
    let filteredDeposits = deposits.filter(d => d.messId === currentMessId);

    // Apply Month/Year filter
    if (selectedMonth !== 'all') {
      filteredMeals = filteredMeals.filter(m => m.date.startsWith(selectedMonth));
      filteredExpenses = filteredExpenses.filter(e => e.date.startsWith(selectedMonth));
      filteredDeposits = filteredDeposits.filter(d => d.date.startsWith(selectedMonth));
    }

    // Apply Custom Date Range filter
    if (startDate) {
      filteredMeals = filteredMeals.filter(m => m.date >= startDate);
      filteredExpenses = filteredExpenses.filter(e => e.date >= startDate);
      filteredDeposits = filteredDeposits.filter(d => d.date >= startDate);
    }
    if (endDate) {
      filteredMeals = filteredMeals.filter(m => m.date <= endDate);
      filteredExpenses = filteredExpenses.filter(e => e.date <= endDate);
      filteredDeposits = filteredDeposits.filter(d => d.date <= endDate);
    }

    // Apply Category Filter to expenses
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'bazaar') {
        filteredExpenses = filteredExpenses.filter(e => e.isBazaar);
      } else if (selectedCategory === 'fixed') {
        filteredExpenses = filteredExpenses.filter(e => !e.isBazaar);
      } else {
        filteredExpenses = filteredExpenses.filter(e => e.category === selectedCategory);
      }
    }

    return {
      meals: filteredMeals,
      expenses: filteredExpenses,
      deposits: filteredDeposits,
    };
  }, [meals, expenses, deposits, currentMessId, selectedMonth, selectedCategory, startDate, endDate]);

  // 3. Dynamically re-calculate summary metrics based on filtered records
  // This solves "month closing should not carry over or adjust" because filtering by month yields a completely separate accounting cycle!
  const currentSummary = useMemo(() => {
    return calculateMessSummary(
      currentMessId,
      members,
      filteredCollections.meals,
      filteredCollections.expenses,
      filteredCollections.deposits
    );
  }, [currentMessId, members, filteredCollections]);

  // Destructure computed summary
  const { totalMeals, totalBazaarExpense, totalFixedExpense, totalExpense, mealRate, memberSummaries, settlements } = currentSummary;

  // Format data for Recharts (Expense Categories)
  const categoryData = useMemo(() => [
    { name: t.groceriesCat, value: totalBazaarExpense, color: '#10b981' },
    { name: t.overheadsTitle, value: totalFixedExpense, color: '#6366f1' },
  ], [totalBazaarExpense, totalFixedExpense, t]);

  // Grab active list of members from the dynamic summary
  const activeMembersList = useMemo(() => Object.values(memberSummaries), [memberSummaries]);

  // Apply member filtering to visual displays
  const filteredMembersList = useMemo(() => {
    if (selectedMember === 'all') return activeMembersList;
    return activeMembersList.filter(m => m.memberId === selectedMember);
  }, [activeMembersList, selectedMember]);

  // Format member balances data for Recharts
  const memberBalancesChartData = useMemo(() => {
    return filteredMembersList.map(m => ({
      name: m.memberName,
      balance: parseFloat(m.balance.toFixed(2)),
      totalMeals: m.totalMeals,
      totalDeposit: m.totalDeposit,
      totalCost: m.totalCost,
    })).sort((a, b) => b.balance - a.balance); // Creditors first
  }, [filteredMembersList]);

  // Personal Member Detailed Card (shown if a specific member filter is applied)
  const selectedMemberDetails = useMemo(() => {
    if (selectedMember === 'all') return null;
    return memberSummaries[selectedMember] || null;
  }, [memberSummaries, selectedMember]);

  // Format month label
  const formatMonthLabel = (monthStr: string) => {
    if (monthStr === 'all') return t.allCategories;
    const [year, month] = monthStr.split('-');
    const monthsEng = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthsBng = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const monthIdx = parseInt(month, 10) - 1;
    
    return t.appName === 'মেসঅ্যাডমিন' 
      ? `${monthsBng[monthIdx]} ${year}` 
      : `${monthsEng[monthIdx]} ${year}`;
  };

  const handleResetFilters = () => {
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    } else {
      setSelectedMonth('all');
    }
    setSelectedMember('all');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div id="master-analytics-dashboard" className="space-y-6 animate-fade-in text-slate-700">
      
      {/* 1. COMPREHENSIVE FILTER PANEL (MASTER FILTER) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-sm font-display">
              {t.appName === 'মেসঅ্যাডমিন' ? 'মাস্টার ফিল্টার ও হিসাব অপশন' : 'Master Ledger Filters'}
            </h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>{t.appName === 'মেসঅ্যাডমিন' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Month/Year Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {t.appName === 'মেসঅ্যাডমিন' ? 'মাস নির্বাচন করুন' : 'Select Accounting Month'}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setStartDate(''); // Clear custom date picker if month preset is used
                setEndDate('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs cursor-pointer font-semibold text-slate-700"
            >
              <option value="all">{t.appName === 'মেসঅ্যাডমিন' ? 'সব মাস একসাথে (All Months)' : 'All Available Months'}</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* Member Focus Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {t.appName === 'মেসঅ্যাডমিন' ? 'সদস্য ফিল্টার' : 'Member-Specific Focus'}
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs cursor-pointer font-semibold text-slate-700"
            >
              <option value="all">{t.appName === 'মেসঅ্যাডমিন' ? 'সকল মেম্বার একসাথে' : 'All Roster Members'}</option>
              {messMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Expense Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              {t.appName === 'মেসঅ্যাডমিন' ? 'খরচ ক্যাটাগরি' : 'Expense Category'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs cursor-pointer font-semibold text-slate-700"
            >
              <option value="all">{t.appName === 'মেসঅ্যাডমিন' ? 'সকল ক্যাটাগরি' : 'All Expenses/Bills'}</option>
              <option value="bazaar">{t.appName === 'মেসঅ্যাডমিন' ? 'শুধুমাত্র বাজার খরচ (মিল রেট)' : 'Bazaar Only (Meal Rates)'}</option>
              <option value="fixed">{t.appName === 'মেসঅ্যাডমিন' ? 'শুধুমাত্র স্থির ইউটিলিটি খরচ' : 'Fixed Cost Sharing Only'}</option>
              <option value="groceries">{t.groceriesCat}</option>
              <option value="utilities">{t.utilitiesCat}</option>
              <option value="rent">{t.rentCat}</option>
              <option value="cook">{t.cookCat}</option>
              <option value="others">{t.othersCat}</option>
            </select>
          </div>

          {/* Custom Date Picker Area */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-slate-400" />
              {t.appName === 'মেসঅ্যাডমিন' ? 'কাস্টম তারিখ সীমা' : 'Custom Date Range'}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedMonth('all'); // Clear month dropdown preset
                }}
                className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] font-medium"
                placeholder="Start"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedMonth('all'); // Clear month dropdown preset
                }}
                className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] font-medium"
                placeholder="End"
              />
            </div>
          </div>
        </div>

        {/* Selected Filter Badges / Indicators Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-medium text-slate-500">
          <span>{t.appName === 'মেসঅ্যাডমিন' ? 'সক্রিয় ফিল্টারসমূহ:' : 'Active Filters:'}</span>
          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
            {selectedMonth === 'all' ? (t.appName === 'মেসঅ্যাডমিন' ? 'সকল সময়' : 'All Time') : formatMonthLabel(selectedMonth)}
          </span>
          {selectedMember !== 'all' && (
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
              {messMembers.find(m => m.id === selectedMember)?.name}
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
              {selectedCategory === 'bazaar' ? (t.appName === 'মেসঅ্যাডমিন' ? 'বাজার খরচ' : 'Bazaar') : selectedCategory === 'fixed' ? (t.appName === 'মেসঅ্যাডমিন' ? 'স্থির খরচ' : 'Fixed') : selectedCategory}
            </span>
          )}
          {(startDate || endDate) && (
            <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">
              {startDate || '*'} ➔ {endDate || '*'}
            </span>
          )}
        </div>
      </div>

      {/* 2. DYNAMICALLY RE-CALCULATED HIGH-IMPACT KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Meal Rate */}
        <div id="kpi-meal-rate" className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t.mealRate}</span>
            <div className="text-2xl font-display font-bold text-slate-800 mt-1 flex items-baseline gap-1">
              {currency}{mealRate.toFixed(3)}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg mt-3 font-medium flex items-center gap-1 self-start">
            <BadgePercent className="w-3.5 h-3.5" />
            {t.mealsRateSubtitle}
          </div>
        </div>

        {/* Total Meals */}
        <div id="kpi-total-meals" className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t.totalMeals}</span>
            <div className="text-2xl font-display font-bold text-slate-800 mt-1">
              {totalMeals.toFixed(1)}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg mt-3 font-medium flex items-center gap-1 self-start">
            <Flame className="w-3.5 h-3.5" />
            {t.activeMealsSubtitle}
          </div>
        </div>

        {/* Bazaar Expense */}
        <div id="kpi-bazaar-expense" className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t.groceryBazaar}</span>
            <div className="text-2xl font-display font-bold text-slate-800 mt-1">
              {currency}{totalBazaarExpense.toFixed(2)}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-mono">{t.bazaarSubtitle}</p>
        </div>

        {/* Fixed Expenses */}
        <div id="kpi-fixed-expense" className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t.overheadsTitle}</span>
            <div className="text-2xl font-display font-bold text-slate-800 mt-1">
              {currency}{totalFixedExpense.toFixed(2)}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-mono">{t.overheadsSubtitle}</p>
        </div>
      </div>

      {/* 3. SELECTED MEMBER'S PERSONAL ACCOUNT SUMMARY (ONLY SHOWN WHEN AN INDIVIDUAL MEMBER FILTER IS ACTIVE) */}
      {selectedMemberDetails && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {selectedMemberDetails.memberName.slice(0, 1)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm font-display">
                  {selectedMemberDetails.memberName} ({t.appName === 'মেসঅ্যাডমিন' ? 'সদস্যের হিসাব খাতা' : 'Personal Audit Dashboard'})
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {t.appName === 'মেসঅ্যাডমিন' ? 'চলমান ফিল্টারকৃত সীমার ব্যক্তিগত হিসাব বিবরণী।' : 'Individual calculated sheet for the selected period.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">{t.netBalance}:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedMemberDetails.balance >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {selectedMemberDetails.balance >= 0 ? '+' : ''}{selectedMemberDetails.balance.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Meals */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm/50">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t.totalMeals}</span>
              <span className="text-lg font-bold font-mono text-slate-800 mt-1 block">{selectedMemberDetails.totalMeals.toFixed(1)}</span>
            </div>
            {/* Meal Cost share */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm/50">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t.mealsCost}</span>
              <span className="text-lg font-bold font-mono text-slate-800 mt-1 block">{currency}{selectedMemberDetails.mealsCost.toFixed(2)}</span>
            </div>
            {/* Fixed cost share */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm/50">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t.fixedCostSplit}</span>
              <span className="text-lg font-bold font-mono text-slate-800 mt-1 block">{currency}{selectedMemberDetails.fixedCostShare.toFixed(2)}</span>
            </div>
            {/* Total Cost Charge */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm/50">
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">{t.totalCharge}</span>
              <span className="text-lg font-bold font-mono text-indigo-600 mt-1 block">{currency}{selectedMemberDetails.totalCost.toFixed(2)}</span>
            </div>
            {/* Deposits Made */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm/50 col-span-2 md:col-span-1">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">{t.paidDeposited}</span>
              <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">{currency}{selectedMemberDetails.totalDeposit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. BALANCES AND PIE CHART BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Member Balances chart */}
        <div id="member-balance-chart" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-display font-semibold text-slate-800 text-base mb-4">
            {selectedMember === 'all' 
              ? t.memberNetBalances 
              : (t.appName === 'মেসঅ্যাডমিন' ? `${messMembers.find(m => m.id === selectedMember)?.name}-এর ব্যালেন্স তুলনামূলক` : 'Individual Balance Share')}
          </h3>
          
          <div className="h-64">
            {memberBalancesChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t.appName === 'মেসঅ্যাডমিন' ? 'কোনো ডাটা পাওয়া যায়নি।' : 'No data available to plot.'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberBalancesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`${currency}${value}`, t.netBalance]}
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}
                  />
                  <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                    {memberBalancesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              <span className="text-slate-600">{t.surplusLegend}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded"></span>
              <span className="text-slate-600">{t.deficitLegend}</span>
            </div>
          </div>
        </div>

        {/* Expense Category Share */}
        <div id="expense-share-pie" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base mb-2">{t.costBreakdowns}</h3>
            <p className="text-xs text-slate-400">{t.appName === 'মেসঅ্যাডমিন' ? 'বাজার খরচ ও স্থির খরচের তুলনা।' : 'Distribution between Grocery and Shared Bills.'}</p>
          </div>

          <div className="h-44 relative flex items-center justify-center my-4">
            {totalExpense === 0 ? (
              <div className="text-xs text-slate-400 text-center">
                {t.appName === 'মেসঅ্যাডমিন' ? 'এই ফিল্টারে কোনো খরচ নেই' : 'No expenses logged for this filter.'}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${currency}${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t.totalSpent}</p>
                  <p className="text-lg font-bold text-slate-800 font-display">{currency}{totalExpense.toFixed(1)}</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            {categoryData.map((item, idx) => {
              const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. DYNAMICALLY RE-CALCULATED MEMBER BALANCE SHEET TABLE */}
      <div id="member-balance-sheet" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">
              {t.appName === 'মেসঅ্যাডমিন' ? 'মেস বিবরণী ও ব্যালেন্স শিট (ফিল্টারকৃত)' : 'Personal Member Balance Sheet (Filtered Range)'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {t.appName === 'মেসঅ্যাডমিন' ? 'সদস্যদের মিল খরচ, স্থির ভাগ এবং ব্যালেন্সের নিখুঁত ছক।' : 'Individual charges break-up and calculated dues.'}
            </p>
          </div>
          <span className="text-xs text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {filteredMembersList.length} {t.activeMembersCount}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">{t.member}</th>
                <th className="px-6 py-4 text-center">{t.totalMeals}</th>
                <th className="px-6 py-4 text-right">{t.mealsCost}</th>
                <th className="px-6 py-4 text-right">{t.fixedCostSplit}</th>
                <th className="px-6 py-4 text-right">{t.totalCharge}</th>
                <th className="px-6 py-4 text-right">{t.paidDeposited}</th>
                <th className="px-6 py-4 text-right">{t.netBalance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembersList.map(m => {
                const balanceColor = m.balance >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
                const isFocused = selectedMember === m.memberId;
                
                return (
                  <tr 
                    key={m.memberId} 
                    className={`transition-colors ${
                      isFocused ? 'bg-indigo-50/60 font-semibold hover:bg-indigo-50' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4.5 font-semibold text-slate-700 text-sm flex items-center gap-2">
                      {m.memberName}
                      {isFocused && <span className="text-[8px] bg-indigo-600 text-white px-1 py-0.2 rounded font-sans uppercase">Focused</span>}
                    </td>
                    <td className="px-6 py-4.5 text-center font-mono text-slate-600 text-sm">
                      {m.totalMeals.toFixed(1)}
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-slate-600 text-sm">
                      {currency}{m.mealsCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-slate-600 text-sm">
                      {currency}{m.fixedCostShare.toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-slate-700 text-sm font-semibold">
                      {currency}{m.totalCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-slate-600 text-sm">
                      {currency}{m.totalDeposit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-full ${balanceColor}`}>
                        {m.balance >= 0 ? '+' : ''}{m.balance.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. DEBT SETTLEMENTS SECTION (DYNAMIC PEER-TO-PEER CLEARINGS) */}
      <div id="smart-settlements" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 bg-indigo-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              {t.smartSettlements}
            </h3>
            <p className="text-[10px] text-indigo-200 mt-0.5">
              {t.appName === 'মেসঅ্যাডমিন' 
                ? 'নির্বাচিত ফিল্টার বা মাসের জন্য প্রস্তুতকৃত স্মার্ট আদান-প্রদান তালিকা।' 
                : t.settlementsSubtitle}
            </p>
          </div>
        </div>

        <div className="p-6">
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold">{t.allSettled}</p>
              <p className="text-xs text-slate-400 mt-1">{t.allSettledSubtitle}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.recommendedTransfers}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settlements.map((s, idx) => {
                  const isDebtorFocused = selectedMember === s.from;
                  const isCreditorFocused = selectedMember === s.to;
                  const isRowHighlighted = selectedMember !== 'all' && (isDebtorFocused || isCreditorFocused);

                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-xl p-4 flex items-center justify-between shadow-sm/50 transition-all ${
                        isRowHighlighted 
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/10' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="truncate">
                          <span className="block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider mb-1">
                            {t.debtorLabel}
                          </span>
                          <p className={`text-xs font-semibold truncate ${isDebtorFocused ? 'text-indigo-700 font-bold' : 'text-slate-800'}`}>
                            {s.fromName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-4" />
                        <div className="truncate">
                          <span className="block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider mb-1">
                            {t.creditorLabel}
                          </span>
                          <p className={`text-xs font-semibold truncate ${isCreditorFocused ? 'text-indigo-700 font-bold' : 'text-slate-800'}`}>
                            {s.toName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">{t.transferLabel}</span>
                        <span className="text-sm font-mono font-bold text-indigo-600">{currency}{s.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. ACTIVITY LOG HISTORY SECTION (AUDIT TRAIL OF ACTIONS) */}
      <div id="activity-history" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 py-4.5 bg-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-300" />
              {lang === 'bn' ? 'কার্যক্রমের ইতিহাস ও অডিট ট্রেইল' : 'Activity History & Audit Trail'}
            </h3>
            <p className="text-[10px] text-slate-300 mt-0.5">
              {lang === 'bn' 
                ? 'এই মেসে কে কি পরিবর্তন করেছেন তার বিস্তারিত রেকর্ড।' 
                : 'A transparent record of who performed what changes in this mess.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700/50 p-1 rounded-xl border border-slate-600/30">
            <Clock className="w-3.5 h-3.5 text-indigo-300 ml-2" />
            <span className="text-[10px] font-mono font-medium text-slate-200 uppercase pr-2">
              {lang === 'bn' ? 'অডিট লগ' : 'Audit Logs'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* List of Logs */}
          {(() => {
            const messLogs = historyLogs
              .filter(log => log.messId === currentMessId)
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

            if (messLogs.length === 0) {
              return (
                <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium text-xs">
                    {lang === 'bn' ? 'কোনো কার্যক্রম লগ এখনও পাওয়া যায়নি।' : 'No activity logged yet.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {messLogs.map((log, logIdx) => {
                    const roleColor = 
                      log.userRole === 'admin' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : log.userRole === 'manager'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : log.userRole === 'master'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200';

                    const roleLabel = 
                      log.userRole === 'admin' 
                        ? (lang === 'bn' ? 'এডমিন' : 'Admin') 
                        : log.userRole === 'manager'
                        ? (lang === 'bn' ? 'ম্যানেজার' : 'Manager')
                        : log.userRole === 'master'
                        ? (lang === 'bn' ? 'প্রধান কনসোল' : 'Master Console')
                        : (lang === 'bn' ? 'সদস্য' : 'Member');

                    const formattedTime = (() => {
                      try {
                        const dateObj = new Date(log.timestamp);
                        return dateObj.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }) + ' - ' + dateObj.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });
                      } catch (e) {
                        return log.timestamp;
                      }
                    })();

                    return (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {logIdx !== messLogs.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3 items-start">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white font-bold text-xs uppercase ${
                                log.userRole === 'admin' 
                                  ? 'bg-rose-500 text-white' 
                                  : log.userRole === 'manager'
                                  ? 'bg-indigo-500 text-white'
                                  : log.userRole === 'master'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-400 text-white'
                              }`}>
                                {log.userName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-800 text-sm">
                                  {log.userName}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColor}`}>
                                  {roleLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {formattedTime}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mt-1 font-medium bg-slate-50 border border-slate-100/50 p-2.5 rounded-xl">
                                {lang === 'bn' ? log.actionBn : log.actionEn}
                                {log.details && (
                                  <span className="block text-xs font-mono text-slate-400 mt-1 italic border-t border-slate-100 pt-1">
                                    {log.details}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
