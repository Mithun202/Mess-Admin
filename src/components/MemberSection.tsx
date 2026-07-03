import React, { useState } from 'react';
import { Plus, ShieldCheck, Mail, Check, Users, Lock, UserCheck, UserX, UserMinus, ShieldAlert } from 'lucide-react';
import { Member } from '../types';
import { LanguageStrings } from '../translations';

interface MemberSectionProps {
  currentMessId: string;
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onToggleMemberStatus: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: 'admin' | 'manager' | 'member') => void;
  activeSimUserId: string | null;
  t: LanguageStrings;
  lang: 'en' | 'bn';
}

export default function MemberSection({
  currentMessId,
  members,
  onAddMember,
  onToggleMemberStatus,
  onUpdateMemberRole,
  activeSimUserId,
  t,
  lang,
}: MemberSectionProps) {
  const messMembers = members.filter(m => m.messId === currentMessId);
  
  // Detect role of current simulated persona
  const activeUser = members.find(m => m.id === activeSimUserId);
  const isManager = activeUser?.role === 'manager';
  const isMember = activeUser?.role === 'member';
  const hasEditPermission = activeSimUserId === null || activeUser?.role === 'admin' || activeUser?.role === 'manager';

  // States
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'manager' | 'member'>('member');

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    onAddMember({
      messId: currentMessId,
      name: memberName.trim(),
      email: memberEmail.trim(),
      role: memberRole,
      status: 'active',
    });

    // Reset Form
    setMemberName('');
    setMemberEmail('');
    setMemberRole('member');
    setShowAddMember(false);
  };

  return (
    <div id="member-section-panel" className="space-y-6 animate-fade-in text-slate-700">
      {/* Informative Header Banner */}
      <div className="bg-indigo-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-300" />
            <h2 className="text-xl md:text-2xl font-bold font-display">
              {lang === 'bn' ? 'মেম্বার রোল ও অ্যাক্সেস পোর্টাল' : 'Member Directory & Role Manager'}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-indigo-200 max-w-2xl leading-relaxed">
            {lang === 'bn' 
              ? 'এখানে মেসের সকল সদস্যদের ভূমিকা (Role) ও সক্রিয়তা নিয়ন্ত্রণ করা যায়। এডমিন এবং ম্যানেজারগণ মিল ও খরচের হিসাব তদারকি করতে পারেন।' 
              : 'Configure roles, status, and permissions for all members in this mess workspace. Admins and Managers have authorization to manage transactions and logs.'}
          </p>
        </div>
      </div>

      {/* Permission warning for standard members */}
      {!hasEditPermission && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">{lang === 'bn' ? 'সীমিত অ্যাক্সেস' : 'Read-Only Mode'}</p>
            <p className="mt-0.5">
              {lang === 'bn' 
                ? 'আপনি একজন সাধারণ সদস্য হিসেবে লগইন করে আছেন। সদস্য যুক্ত করা অথবা ভূমিকা পরিবর্তন করার ক্ষমতা কেবল এডমিন ও ম্যানেজারদের রয়েছে।' 
                : 'You are currently logged in as a standard member. Actions to add members or modify roles are restricted to Admins and Managers only.'}
            </p>
          </div>
        </div>
      )}

      {/* Members Stats Roster */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lang === 'bn' ? 'মোট সদস্য' : 'Total Members'}</span>
          <span className="text-2xl font-bold font-display text-slate-800 mt-1 block">{messMembers.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lang === 'bn' ? 'সক্রিয় সদস্য' : 'Active'}</span>
          <span className="text-2xl font-bold font-display text-emerald-600 mt-1 block">
            {messMembers.filter(m => m.status === 'active').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lang === 'bn' ? 'এডমিন / ম্যানেজার' : 'Admins/Managers'}</span>
          <span className="text-2xl font-bold font-display text-indigo-600 mt-1 block">
            {messMembers.filter(m => m.role === 'admin' || m.role === 'manager').length}
          </span>
        </div>
      </div>

      {/* Primary Action & Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base font-display">
              {lang === 'bn' ? 'সদস্যদের তালিকা ও রোল অ্যাসাইন' : 'Members Management Roster'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn' ? 'মেসের সদস্যদের রোল (Admin, Manager, Member) ও একটিভ স্ট্যাটাস আপডেট করুন।' : 'Update roles and status of individual members directly from this dashboard.'}
            </p>
          </div>

          {hasEditPermission && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/10"
              id="invite-member-btn"
            >
              <Plus className="w-4 h-4" />
              <span>{t.inviteMember}</span>
            </button>
          )}
        </div>

        {/* Add Member Form Inside Member Section */}
        {showAddMember && hasEditPermission && (
          <form onSubmit={handleAddMemberSubmit} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 animate-fade-in space-y-4 max-w-xl">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-500" />
              {t.inviteActiveMember}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.fullName}</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Asif Chowdhury"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.emailAddress}</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="asif@example.com"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'ভূমিকা (Role)' : 'Default Role / Position'}</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as 'admin' | 'manager' | 'member')}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer text-slate-700 font-medium"
                >
                  <option value="member">{t.messMemberRole}</option>
                  <option value="manager">{lang === 'bn' ? 'মেস ম্যানেজার / ব্যবস্থাপক' : 'Mess Manager / Manager'}</option>
                  <option value="admin">{t.messAdminRole}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {t.inviteMember}
              </button>
            </div>
          </form>
        )}

        {/* Members Directory Table Grid (Desktop Only) */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">{lang === 'bn' ? 'সদস্য' : 'Member'}</th>
                <th className="px-5 py-3.5">{lang === 'bn' ? 'ইমেল ঠিকানা' : 'Email Address'}</th>
                <th className="px-5 py-3.5">{lang === 'bn' ? 'ভূমিকা (Role)' : 'Role / Authorization'}</th>
                <th className="px-5 py-3.5 text-center">{lang === 'bn' ? 'অবস্থা (Status)' : 'Active Status'}</th>
                {hasEditPermission && <th className="px-5 py-3.5 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messMembers.map(m => {
                const isUserCurrentLive = activeSimUserId === m.id;
                
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Member Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200/50 shrink-0">
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                            {isUserCurrentLive && (
                              <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded font-mono uppercase tracking-wider">LIVE</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">ID: {m.id.split('-').slice(-1)[0]}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{m.email}</span>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-5 py-4">
                      {hasEditPermission ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 max-w-[150px]">
                          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                          <select
                            id={`role-select-${m.id}`}
                            value={m.role}
                            onChange={(e) => onUpdateMemberRole(m.id, e.target.value as 'admin' | 'manager' | 'member')}
                            className="text-xs font-bold text-slate-700 bg-transparent cursor-pointer focus:outline-none focus:ring-0 py-0 px-0.5 border-0 focus:ring-offset-0 focus:shadow-none w-full"
                          >
                            <option value="member">{t.messMemberRole}</option>
                            <option value="manager">{lang === 'bn' ? 'ম্যানেজার' : 'Manager'}</option>
                            <option value="admin">{t.messAdminRole}</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs">
                          {m.role === 'admin' ? (
                            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg uppercase tracking-wider text-[10px] border border-indigo-100 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'এডমিন' : 'Admin'}
                            </span>
                          ) : m.role === 'manager' ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg uppercase tracking-wider text-[10px] border border-emerald-100 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'ম্যানেজার' : 'Manager'}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {lang === 'bn' ? 'সদস্য' : 'Member'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-100/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{m.status}</span>
                      </span>
                    </td>

                    {/* Actions Column */}
                    {hasEditPermission && (
                      <td className="px-5 py-4 text-right">
                        <button
                          id={`toggle-status-btn-${m.id}`}
                          onClick={() => onToggleMemberStatus(m.id)}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 ${
                            m.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                          }`}
                          title={t.toggleStatusTitle}
                        >
                          {m.status === 'active' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{lang === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{lang === 'bn' ? 'সক্রিয় করুন' : 'Activate'}</span>
                            </>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile-Friendly Stacking Cards (No Horizontal Scroll Needed) */}
        <div className="block md:hidden space-y-4">
          {messMembers.map(m => {
            const isUserCurrentLive = activeSimUserId === m.id;
            
            return (
              <div key={m.id} className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200/50 shrink-0">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate">{m.name}</span>
                        {isUserCurrentLive && (
                          <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded font-mono uppercase tracking-wider">LIVE</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 block">ID: {m.id.split('-').slice(-1)[0]}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                    m.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-100/60'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span>{m.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-white px-2.5 py-1.5 rounded-xl border border-slate-100/60">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{m.email}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/40">
                  {/* Role Selector/Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'bn' ? 'ভূমিকা:' : 'Role:'}</span>
                    {hasEditPermission ? (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <select
                          id={`role-select-mobile-${m.id}`}
                          value={m.role}
                          onChange={(e) => onUpdateMemberRole(m.id, e.target.value as 'admin' | 'manager' | 'member')}
                          className="text-[11px] font-bold text-slate-700 bg-transparent cursor-pointer focus:outline-none focus:ring-0 py-0.5 border-0 focus:ring-offset-0 focus:shadow-none min-w-[80px]"
                        >
                          <option value="member">{t.messMemberRole}</option>
                          <option value="manager">{lang === 'bn' ? 'ম্যানেজার' : 'Manager'}</option>
                          <option value="admin">{t.messAdminRole}</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {m.role === 'admin' ? (lang === 'bn' ? 'এডমিন' : 'Admin') : m.role === 'manager' ? (lang === 'bn' ? 'ম্যানেজার' : 'Manager') : (lang === 'bn' ? 'সদস্য' : 'Member')}
                      </span>
                    )}
                  </div>

                  {/* Toggle status button */}
                  {hasEditPermission && (
                    <button
                      id={`toggle-status-btn-mobile-${m.id}`}
                      onClick={() => onToggleMemberStatus(m.id)}
                      className={`cursor-pointer px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all inline-flex items-center gap-1 self-end sm:self-auto ${
                        m.status === 'active'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                      }`}
                    >
                      {m.status === 'active' ? (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'সক্রিয় করুন' : 'Activate'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Description panel explaining the role-based security in detail */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {lang === 'bn' ? 'এডমিন (Admin)' : 'Admin Role'}
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {lang === 'bn' 
                ? 'এডমিন সম্পূর্ণ মেস পরিচালনা, মেম্বারদের রোল আপডেট, মেস তৈরি করা এবং সকল রেকর্ড সেভ ও ডিলিট করতে পারবেন।' 
                : 'Full write access. Can provision new messes, invite/delete members, modify roles, and clear all ledger transactions.'}
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {lang === 'bn' ? 'ম্যানেজার (Manager)' : 'Manager Role'}
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {lang === 'bn' 
                ? 'ম্যানেজার বাজার খরচ, মিল সংখ্যা এবং জমা খাতা ট্র্যাকিং ও এন্ট্রি করতে পারবেন। তবে তারা মেস মেম্বারদের ডিলিট বা রোল চেঞ্জ করতে পারবেন না।' 
                : 'Operational manager. Can update daily meals, add bazaar/fixed expenses, and post advances but restricted from deleting workspaces.'}
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              {lang === 'bn' ? 'মেম্বার (Member)' : 'Standard Member'}
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {lang === 'bn' 
                ? 'সাধারণ মেম্বার নিজের মিল, মেসের ব্যালেন্স শিট, বাজার খরচ এবং এআই রিপোর্ট দেখতে পারবেন। কোনো ডাটা এডিট করার পারমিশন নেই।' 
                : 'Read-only access. Can view real-time personal cost sheets, ledger statements, and chat with the server AI assistant.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
