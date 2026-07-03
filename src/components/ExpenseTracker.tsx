import React, { useState } from 'react';
import { DollarSign, Tag, Calendar, User, Trash2, Plus, Filter, ShoppingCart, Home, ShieldAlert, Award, FileText, Eye } from 'lucide-react';
import { Member, Expense } from '../types';
import { LanguageStrings } from '../translations';

interface ExpenseTrackerProps {
  currentMessId: string;
  members: Member[];
  expenses: Expense[];
  currency: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  t: LanguageStrings;
  hasEditPermission: boolean;
  lang: 'bn' | 'en';
}

export default function ExpenseTracker({
  currentMessId,
  members,
  expenses,
  currency,
  onAddExpense,
  onDeleteExpense,
  t,
  hasEditPermission,
  lang,
}: ExpenseTrackerProps) {
  // Filter members of this mess
  const activeMembers = members.filter(m => m.messId === currentMessId && m.status === 'active');
  const messExpenses = expenses.filter(e => e.messId === currentMessId);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [category, setCategory] = useState<'groceries' | 'utilities' | 'rent' | 'cook' | 'others'>('groceries');
  const [isBazaar, setIsBazaar] = useState(true);
  const [date, setDate] = useState('2026-07-02');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtering State
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bazaarFilter, setBazaarFilter] = useState<'all' | 'bazaar' | 'fixed'>('all');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'groceries' | 'utilities' | 'rent' | 'cook' | 'others';
    setCategory(val);
    
    // Auto-toggle Bazaar cost. Usually groceries go into Bazaar (meal cost), others are Fixed overheads.
    if (val === 'groceries') {
      setIsBazaar(true);
    } else {
      setIsBazaar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !paidById) return;

    onAddExpense({
      messId: currentMessId,
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      paidById,
      category,
      isBazaar,
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setShowAddForm(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'groceries': return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'utilities': return <Award className="w-4 h-4 text-amber-500" />;
      case 'rent': return <Home className="w-4 h-4 text-indigo-500" />;
      case 'cook': return <User className="w-4 h-4 text-teal-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'groceries': return t.groceriesCat;
      case 'utilities': return t.utilitiesCat;
      case 'rent': return t.rentCat;
      case 'cook': return t.cookCat;
      default: return t.othersCat;
    }
  };

  const filteredExpenses = messExpenses.filter(e => {
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesBazaar = 
      bazaarFilter === 'all' || 
      (bazaarFilter === 'bazaar' && e.isBazaar) || 
      (bazaarFilter === 'fixed' && !e.isBazaar);
    return matchesCategory && matchesBazaar;
  }).sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  return (
    <div id="expense-tracker" className="space-y-6 animate-fade-in">
      {!hasEditPermission && (
        <div className="bg-amber-50/65 border border-amber-100 rounded-xl p-3.5 flex items-center gap-3 text-amber-800 text-xs font-semibold">
          <Eye className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {lang === 'bn' 
              ? 'ভিউয়ার মোড: আপনি এই মেসে সাধারণ সদস্য হওয়ায় ডাটা পরিবর্তন করতে পারবেন না। শুধুমাত্র এডমিন খরচ যোগ বা ডিলিট করতে পারবেন।' 
              : 'Viewer Mode: As a standard member in this mess, you are in read-only mode. Only Admin accounts can log or delete expenses.'}
          </span>
        </div>
      )}

      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">{t.communalExpenses}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.expensesSubtitle}</p>
        </div>
        
        {hasEditPermission && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!paidById && activeMembers.length > 0) {
                setPaidById(activeMembers[0].id);
              }
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/10 flex items-center gap-2 self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? t.closeInvoiceEntry : t.logNewExpense}
          </button>
        )}
      </div>

      {/* Invoice Entry Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h3 className="font-display text-base font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            {t.enterSharedBill}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.description}</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.appName === 'মেসঅ্যাডমিন' ? 'যেমন- সাপ্তাহিক বাজার, ইন্টারনেট বিল, খালার বেতন' : 'e.g. Weekly grocery bazaar, internet, cook fee'}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.amount} ({currency})</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.paidBy}</label>
              <select
                required
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm cursor-pointer"
              >
                <option value="" disabled>{t.paidBy}</option>
                {activeMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.category}</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm cursor-pointer"
              >
                <option value="groceries">{t.groceriesCat}</option>
                <option value="utilities">{t.utilitiesCat}</option>
                <option value="rent">{t.rentCat}</option>
                <option value="cook">{t.cookCat}</option>
                <option value="others">{t.othersCat}</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.billingDate}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Bazaar impact toggle */}
          <div className="mt-5 bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <input
                type="checkbox"
                id="isBazaar"
                checked={isBazaar}
                onChange={(e) => setIsBazaar(e.target.checked)}
                className="mt-1 w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isBazaar" className="cursor-pointer select-none">
                <span className="block text-sm font-semibold text-slate-700">{t.bazaarToggleTitle}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{t.bazaarToggleDesc}</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
            >
              {t.postExpense}
            </button>
          </div>
        </form>
      )}

      {/* Filtering Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-600">{t.filters}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-sm text-slate-600">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="all">{t.allCategories}</option>
              <option value="groceries">{t.groceriesCat}</option>
              <option value="utilities">{t.utilitiesCat}</option>
              <option value="rent">{t.rentCat}</option>
              <option value="cook">{t.cookCat}</option>
              <option value="others">{t.othersCat}</option>
            </select>
          </div>

          {/* Bazaar Overhead Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-sm text-slate-600">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <select
              value={bazaarFilter}
              onChange={(e) => setBazaarFilter(e.target.value as any)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="all">{t.bazaarFixedFilter}</option>
              <option value="bazaar">{t.bazaarOnlyFilter}</option>
              <option value="fixed">{t.fixedOnlyFilter}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 px-6">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t.noExpensesMatch}</p>
            <p className="text-xs text-slate-400 mt-1">{t.noExpensesSubtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">{t.expenseDetails}</th>
                  <th className="px-6 py-4">{t.category}</th>
                  <th className="px-6 py-4">{t.costDistribution}</th>
                  <th className="px-6 py-4">{t.paidBy}</th>
                  <th className="px-6 py-4">{t.billingDate}</th>
                  <th className="px-6 py-4 text-right">{t.amount}</th>
                  {hasEditPermission && <th className="px-6 py-4 text-center">{t.action}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(e => {
                  const paidByMember = members.find(m => m.id === e.paidById);
                  const isActiveMember = paidByMember && paidByMember.status === 'active';

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Description */}
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{e.description}</p>
                          {!isActiveMember && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {t.formerInactive}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(e.category)}
                          <span className="capitalize text-slate-600 text-xs font-medium">
                            {getCategoryLabel(e.category)}
                          </span>
                        </div>
                      </td>

                      {/* Distribution Type */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {e.isBazaar ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {t.bazaarOnlyFilter.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {t.fixedOnlyFilter.split(' ')[0]}
                          </span>
                        )}
                      </td>

                      {/* Paid By */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                            {paidByMember ? paidByMember.name.split(' ').map(n => n[0]).join('') : '?'}
                          </div>
                          <span className="text-slate-600 text-xs font-medium">
                            {paidByMember ? paidByMember.name : 'Unknown Member'}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {e.date}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap font-mono font-bold text-slate-700 text-sm">
                        {currency}{e.amount.toFixed(2)}
                      </td>

                      {/* Action */}
                      {hasEditPermission && (
                        <td className="px-6 py-4.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => onDeleteExpense(e.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
