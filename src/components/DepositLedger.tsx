import React, { useState } from 'react';
import { Plus, CreditCard, User, Calendar, Trash2, ShieldAlert, BadgeDollarSign, FileText, Eye } from 'lucide-react';
import { Member, Deposit } from '../types';
import { LanguageStrings } from '../translations';

interface DepositLedgerProps {
  currentMessId: string;
  members: Member[];
  deposits: Deposit[];
  currency: string;
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onDeleteDeposit: (expenseId: string) => void;
  t: LanguageStrings;
  hasEditPermission: boolean;
  lang: 'bn' | 'en';
}

export default function DepositLedger({
  currentMessId,
  members,
  deposits,
  currency,
  onAddDeposit,
  onDeleteDeposit,
  t,
  hasEditPermission,
  lang,
}: DepositLedgerProps) {
  // Filter active members and deposits of this mess
  const activeMembers = members.filter(m => m.messId === currentMessId && m.status === 'active');
  const messDeposits = deposits.filter(d => d.messId === currentMessId);

  // Form State
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-07-02');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount) return;

    onAddDeposit({
      messId: currentMessId,
      memberId,
      amount: parseFloat(amount),
      date,
      notes: notes.trim() || (t.appName === 'মেসঅ্যাডমিন' ? 'অগ্রিম জমা টাকা' : 'Advance contribution'),
    });

    // Reset Form
    setAmount('');
    setNotes('');
    setShowAddForm(false);
  };

  const getMemberName = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? m.name : 'Unknown Member';
  };

  const sortedDeposits = [...messDeposits].sort((a, b) => b.date.localeCompare(a.date));
  const totalDirectDeposits = messDeposits.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div id="deposit-ledger" className="space-y-6 animate-fade-in">
      {!hasEditPermission && (
        <div className="bg-amber-50/65 border border-amber-100 rounded-xl p-3.5 flex items-center gap-3 text-amber-800 text-xs font-semibold">
          <Eye className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {lang === 'bn' 
              ? 'ভিউয়ার মোড: আপনি এই মেসে সাধারণ সদস্য হওয়ায় ডাটা পরিবর্তন করতে পারবেন না। শুধুমাত্র এডমিন জমা যোগ বা ডিলিট করতে পারবেন।' 
              : 'Viewer Mode: As a standard member in this mess, you are in read-only mode. Only Admin accounts can write or delete deposits.'}
          </span>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">{t.memberDepositsTitle}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {t.depositsSubtitle}
          </p>
        </div>

        {hasEditPermission && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!memberId && activeMembers.length > 0) setMemberId(activeMembers[0].id);
            }}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/10 self-start sm:self-auto hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? t.closeDepositForm : t.logDeposit}
          </button>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div id="stat-total-deposited" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-sm">
          <BadgeDollarSign className="w-8 h-8 opacity-80 mb-2" />
          <p className="text-sm opacity-90 font-medium">{t.totalCashDeposited}</p>
          <p className="text-3xl font-display font-bold mt-1">
            {currency}{totalDirectDeposits.toFixed(2)}
          </p>
          <p className="text-[10px] opacity-75 mt-1 font-mono">{t.cumulativeCashInflow}</p>
        </div>

        <div id="stat-active-depositors" className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between border-slate-200/50 shadow-sm">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.activeDepositors}</span>
            <span className="block text-2xl font-display font-bold text-slate-700 mt-1">
              {new Set(messDeposits.map(d => d.memberId)).size} / {activeMembers.length}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">{t.activeDepositorsSubtitle}</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div id="stat-average-deposit" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between border-slate-200/50">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.averageDeposit}</span>
            <p className="text-2xl font-display font-bold text-slate-700 mt-1">
              {currency}{(messDeposits.length > 0 ? totalDirectDeposits / messDeposits.length : 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{t.averageDepositSubtitle}</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Add Deposit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h3 className="font-display text-base font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
            {t.enterDepositTransaction}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Member */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.member}</label>
              <select
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer"
              >
                <option value="" disabled>{t.member}</option>
                {activeMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
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
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Billing Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.billingDate}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.notesRef}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.appName === 'মেসঅ্যাডমিন' ? 'যেমন- জুনের এডভান্স, বুয়া খালার বিল' : 'e.g. Adv payment, June cook fee'}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-600/10 cursor-pointer"
            >
              {t.postCashDeposit}
            </button>
          </div>
        </form>
      )}

      {/* Deposits List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-50">
          <h3 className="font-display font-semibold text-slate-700 text-sm">{t.depositLedgerEntries}</h3>
        </div>

        {sortedDeposits.length === 0 ? (
          <div className="text-center py-16 px-6">
            <ShieldAlert className="w-11 h-11 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">{t.noDepositsLogged}</p>
            <p className="text-xs text-slate-400 mt-1">{t.closeDepositForm}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">{t.fullName}</th>
                  <th className="px-6 py-4">{t.notesRef}</th>
                  <th className="px-6 py-4">{t.billingDate}</th>
                  <th className="px-6 py-4 text-right">{t.amount}</th>
                  {hasEditPermission && <th className="px-6 py-4 text-center">{t.action}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDeposits.map(d => {
                  const m = members.find(mem => mem.id === d.memberId);
                  const isCurrentActive = m && m.status === 'active';

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Member */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                            {getMemberName(d.memberId).split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-slate-700 text-xs font-semibold block">
                              {getMemberName(d.memberId)}
                            </span>
                            {!isCurrentActive && (
                              <span className="text-[9px] text-slate-400 font-mono">{t.formerInactive}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{d.notes}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {d.date}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold text-slate-700 text-sm">
                        {currency}{d.amount.toFixed(2)}
                      </td>

                      {/* Action */}
                      {hasEditPermission && (
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => onDeleteDeposit(d.id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete deposit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
