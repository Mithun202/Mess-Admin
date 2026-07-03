import React, { useState } from 'react';
import { Plus, ShieldCheck, Mail, Layers, Sparkles, Check, Users, Lock } from 'lucide-react';
import { Mess, Member } from '../types';
import { LanguageStrings } from '../translations';

interface MessSelectorProps {
  messes: Mess[];
  currentMessId: string;
  members: Member[];
  onSelectMess: (id: string) => void;
  onCreateMess: (mess: Omit<Mess, 'id'>, adminName: string, adminEmail: string) => void;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onToggleMemberStatus: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: 'admin' | 'manager' | 'member') => void;
  activeSimUserId: string | null;
  onSelectSimUser: (id: string | null) => void;
  t: LanguageStrings;
}

export default function MessSelector({
  messes,
  currentMessId,
  members,
  onSelectMess,
  onCreateMess,
  onAddMember,
  onToggleMemberStatus,
  onUpdateMemberRole,
  activeSimUserId,
  onSelectSimUser,
  t,
}: MessSelectorProps) {
  // Current mess details
  const currentMess = messes.find(m => m.id === currentMessId);
  const messMembers = members.filter(m => m.messId === currentMessId);
  
  // Detect role of current simulated persona
  const activeUser = members.find(m => m.id === activeSimUserId);
  const isManager = activeUser?.role === 'manager';
  const isMember = activeUser?.role === 'member';

  // States
  const [showCreateMess, setShowCreateMess] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // New Mess fields
  const [newMessName, setNewMessName] = useState('');
  const [newMessCurrency, setNewMessCurrency] = useState('৳');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // New Member fields
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'manager' | 'member'>('member');

  const handleCreateMessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessName.trim() || !adminName.trim() || !adminEmail.trim()) return;

    onCreateMess({
      name: newMessName.trim(),
      currency: newMessCurrency,
      createdDate: new Date().toISOString().split('T')[0],
    }, adminName.trim(), adminEmail.trim());

    // Reset Form
    setNewMessName('');
    setAdminName('');
    setAdminEmail('');
    setShowCreateMess(false);
  };

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
    <div id="mess-selector" className="space-y-6 animate-fade-in">
      {/* Workspace Switcher Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          {t.workspaceSwitcher}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={currentMessId}
            onChange={(e) => {
              onSelectMess(e.target.value);
              onSelectSimUser(null); // Reset sim user
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm cursor-pointer font-medium text-slate-700"
          >
            {messes.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.currency})</option>
            ))}
          </select>

          <button
            onClick={() => {
              if (isManager || isMember) return;
              setShowCreateMess(!showCreateMess);
            }}
            disabled={isManager || isMember}
            className={`cursor-pointer px-4 py-2.5 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              isManager || isMember
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            }`}
          >
            {isManager || isMember ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />} {t.createNewWorkspace}
          </button>
        </div>
        {(isManager || isMember) && (
          <p className="text-[10px] text-rose-500 font-medium mt-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            {t.appName === 'মেসঅ্যাডমিন' 
              ? 'শুধুমাত্র মেস মাস্টার এডমিন নতুন মেস/ফ্ল্যাট তৈরি করতে পারবেন।' 
              : 'Only the Master Admin can create or provision new mess workspaces.'}
          </p>
        )}
      </div>

      {/* Create New Mess Workspace Form */}
      {showCreateMess && (
        <form onSubmit={handleCreateMessSubmit} className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900 animate-fade-in space-y-4">
          <h3 className="font-display font-bold text-base text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            {t.createNewMessTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">{t.messOrgName}</label>
              <input
                type="text"
                required
                value={newMessName}
                onChange={(e) => setNewMessName(e.target.value)}
                placeholder={t.appName === 'মেসঅ্যাডমিন' ? 'যেমন- উত্তরা গ্রিন ফ্ল্যাট ৪বি' : 'e.g. Uttara Green Flat 4B'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">{t.currencySymbol}</label>
              <select
                value={newMessCurrency}
                onChange={(e) => setNewMessCurrency(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-300 cursor-pointer"
              >
                <option value="৳">৳ BDT</option>
                <option value="$">$ USD</option>
                <option value="₹">₹ INR</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">{t.messManagerName}</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder={t.appName === 'মেসঅ্যাডমিন' ? 'যেমন- রিফাত আহমেদ' : 'e.g. Rifat Ahmed'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">{t.adminEmail}</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="rifat@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateMess(false)}
              className="px-4 py-2 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              {t.provisionMess}
            </button>
          </div>
        </form>
      )}

      {/* Simulated User Role selector */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 shadow-sm">
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
          {t.persona} Settings
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
          {t.workspaceDesc}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectSimUser(null)}
            className={`cursor-pointer px-3 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
              activeSimUserId === null
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t.masterConsole}</span>
            {activeSimUserId === null && <Check className="w-3.5 h-3.5" />}
          </button>

          {messMembers.map(m => (
            <button
              key={m.id}
              onClick={() => onSelectSimUser(m.id)}
              className={`cursor-pointer px-3 py-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all truncate ${
                activeSimUserId === m.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{m.name.split(' ')[0]} ({m.role === 'admin' ? 'Adm' : 'Mem'})</span>
              {activeSimUserId === m.id && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Members Directory Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            {t.membersDirectory} ({messMembers.length})
          </h3>

          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {t.inviteMember}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <form onSubmit={handleAddMemberSubmit} className="border border-indigo-50 bg-indigo-50/20 rounded-xl p-4 mb-4 animate-fade-in space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">{t.inviteActiveMember}</h4>
            
            <div className="space-y-2.5">
              <input
                type="text"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder={t.fullName}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
              />
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder={t.emailAddress}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
              />
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as 'admin' | 'manager' | 'member')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer text-slate-700"
              >
                <option value="member">{t.messMemberRole}</option>
                <option value="manager">{t.appName === 'মেসঅ্যাডমিন' ? 'মেস ম্যানেজার / ম্যানেজার' : 'Mess Manager / Manager'}</option>
                <option value="admin">{t.messAdminRole}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 text-xs font-semibold pt-1">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-2.5 py-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer"
              >
                {t.inviteMember}
              </button>
            </div>
          </form>
        )}

        {/* Members Directory List */}
        <div className="space-y-3">
          {messMembers.map(m => (
            <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200/60 shrink-0">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800 truncate">{m.name}</span>
                    {m.role === 'admin' && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1 rounded uppercase tracking-wider shrink-0">Adm</span>
                    )}
                    {m.role === 'manager' && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1 rounded uppercase tracking-wider shrink-0">Mng</span>
                    )}
                    {m.role === 'member' && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 rounded uppercase tracking-wider shrink-0">Mem</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">{m.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Role Switcher Dropdown */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-lg px-1.5 py-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">{t.appName === 'মেসঅ্যাডমিন' ? 'রোল:' : 'ROLE:'}</span>
                  <select
                    value={m.role}
                    onChange={(e) => onUpdateMemberRole(m.id, e.target.value as 'admin' | 'manager' | 'member')}
                    className="text-[10px] font-bold text-slate-700 bg-transparent cursor-pointer focus:outline-none focus:ring-0 py-0 px-0.5 border-0 focus:ring-offset-0 focus:shadow-none"
                  >
                    <option value="member">{t.appName === 'মেসঅ্যাডমিন' ? 'সদস্য' : 'Member'}</option>
                    <option value="manager">{t.appName === 'মেসঅ্যাডমিন' ? 'ম্যানেজার' : 'Manager'}</option>
                    <option value="admin">{t.appName === 'মেসঅ্যাডমিন' ? 'এডমিন' : 'Admin'}</option>
                  </select>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => onToggleMemberStatus(m.id)}
                  className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                    m.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                  title={t.toggleStatusTitle}
                >
                  {m.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
