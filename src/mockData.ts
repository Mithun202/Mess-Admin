import { Mess, Member, MealRecord, Expense, Deposit } from './types';

export const INITIAL_MESSES: Mess[] = [
  {
    id: 'mess-1',
    name: 'Uttara Green Flat 4B (উত্তরা মেস ৪বি)',
    currency: '৳',
    createdDate: '2026-06-01',
  },
  {
    id: 'mess-2',
    name: 'Dhanmondi Bachelor Residence',
    currency: '৳',
    createdDate: '2026-06-15',
  }
];

export const INITIAL_MEMBERS: Member[] = [
  // Mess 1
  { id: 'mem-1', messId: 'mess-1', name: 'Arif Rahman (আরিফ)', email: 'arif@messadmin.com', role: 'admin', status: 'active' },
  { id: 'mem-2', messId: 'mess-1', name: 'Tanvir Ahmed (তানভীর)', email: 'tanvir@messadmin.com', role: 'member', status: 'active' },
  { id: 'mem-3', messId: 'mess-1', name: 'Sajid Hasan (সাজিদ)', email: 'sajid@messadmin.com', role: 'member', status: 'active' },
  { id: 'mem-4', messId: 'mess-1', name: 'Rafsan Jamil (রাফসান)', email: 'rafsan@messadmin.com', role: 'member', status: 'active' },
  
  // Mess 2
  { id: 'mem-5', messId: 'mess-2', name: 'John Doe', email: 'john@messadmin.com', role: 'admin', status: 'active' },
  { id: 'mem-6', messId: 'mess-2', name: 'Emily Watson', email: 'emily@messadmin.com', role: 'member', status: 'active' },
  { id: 'mem-7', messId: 'mess-2', name: 'Liam Neeson', email: 'liam@messadmin.com', role: 'member', status: 'active' },
  { id: 'mem-8', messId: 'mess-2', name: 'Chloe Wang', email: 'chloe@messadmin.com', role: 'member', status: 'active' },
  { id: 'mem-9', messId: 'mess-2', name: 'Ryan Reynolds', email: 'ryan@messadmin.com', role: 'member', status: 'inactive' }
];

// Seed meals for Mess 1 (Uttara Flat) from June 28 to July 2, 2026
export const INITIAL_MEALS: MealRecord[] = [
  // June 28
  { id: 'meal-1-1', memberId: 'mem-1', messId: 'mess-1', date: '2026-06-28', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-1-2', memberId: 'mem-2', messId: 'mess-1', date: '2026-06-28', breakfast: 0.5, lunch: 1, dinner: 1 },
  { id: 'meal-1-3', memberId: 'mem-3', messId: 'mess-1', date: '2026-06-28', breakfast: 1, lunch: 0, dinner: 1.5 },
  { id: 'meal-1-4', memberId: 'mem-4', messId: 'mess-1', date: '2026-06-28', breakfast: 1, lunch: 1, dinner: 1 },

  // June 29
  { id: 'meal-2-1', memberId: 'mem-1', messId: 'mess-1', date: '2026-06-29', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-2-2', memberId: 'mem-2', messId: 'mess-1', date: '2026-06-29', breakfast: 1, lunch: 1, dinner: 0 },
  { id: 'meal-2-3', memberId: 'mem-3', messId: 'mess-1', date: '2026-06-29', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-2-4', memberId: 'mem-4', messId: 'mess-1', date: '2026-06-29', breakfast: 0, lunch: 1.5, dinner: 1 },

  // June 30
  { id: 'meal-3-1', memberId: 'mem-1', messId: 'mess-1', date: '2026-06-30', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-3-2', memberId: 'mem-2', messId: 'mess-1', date: '2026-06-30', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-3-3', memberId: 'mem-3', messId: 'mess-1', date: '2026-06-30', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-3-4', memberId: 'mem-4', messId: 'mess-1', date: '2026-06-30', breakfast: 1, lunch: 1, dinner: 1 },

  // July 1
  { id: 'meal-4-1', memberId: 'mem-1', messId: 'mess-1', date: '2026-07-01', breakfast: 1, lunch: 0, dinner: 1 },
  { id: 'meal-4-2', memberId: 'mem-2', messId: 'mess-1', date: '2026-07-01', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-4-3', memberId: 'mem-3', messId: 'mess-1', date: '2026-07-01', breakfast: 1, lunch: 1.5, dinner: 1 },
  { id: 'meal-4-4', memberId: 'mem-4', messId: 'mess-1', date: '2026-07-01', breakfast: 1, lunch: 1, dinner: 1 },

  // July 2 (Current day, partial logs)
  { id: 'meal-5-1', memberId: 'mem-1', messId: 'mess-1', date: '2026-07-02', breakfast: 1, lunch: 1, dinner: 0 },
  { id: 'meal-5-2', memberId: 'mem-2', messId: 'mess-1', date: '2026-07-02', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-5-3', memberId: 'mem-3', messId: 'mess-1', date: '2026-07-02', breakfast: 0.5, lunch: 1, dinner: 1 },
  { id: 'meal-5-4', memberId: 'mem-4', messId: 'mess-1', date: '2026-07-02', breakfast: 1, lunch: 1, dinner: 1 },

  // Seed meals for Dhanmondi Mess
  { id: 'meal-s2-1', memberId: 'mem-5', messId: 'mess-2', date: '2026-07-01', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-s2-2', memberId: 'mem-6', messId: 'mess-2', date: '2026-07-01', breakfast: 1, lunch: 1, dinner: 1 },
  { id: 'meal-s2-3', memberId: 'mem-7', messId: 'mess-2', date: '2026-07-01', breakfast: 1, lunch: 1, dinner: 0 },
  { id: 'meal-s2-4', memberId: 'mem-8', messId: 'mess-2', date: '2026-07-01', breakfast: 1, lunch: 0, dinner: 1 },
];

export const INITIAL_EXPENSES: Expense[] = [
  // Mess 1
  {
    id: 'exp-1',
    messId: 'mess-1',
    description: 'সাপ্তাহিক বড় বাজার (মুরগি, ডিম, চাল, তেল, আলু ও ডাল)',
    amount: 2850.00,
    date: '2026-06-28',
    paidById: 'mem-4', // Rafsan
    category: 'groceries',
    isBazaar: true,
  },
  {
    id: 'exp-2',
    messId: 'mess-1',
    description: 'ওয়াইফাই ও ইন্টারনেট বিল (Wifi Bill)',
    amount: 600.00,
    date: '2026-06-29',
    paidById: 'mem-3', // Sajid
    category: 'utilities',
    isBazaar: false,
  },
  {
    id: 'exp-3',
    messId: 'mess-1',
    description: 'সকালের নাস্তার ডিম ও তাজা ফলমূল',
    amount: 540.00,
    date: '2026-06-30',
    paidById: 'mem-1', // Arif
    category: 'groceries',
    isBazaar: true,
  },
  {
    id: 'exp-4',
    messId: 'mess-1',
    description: '৪বি ফ্ল্যাটের জুন মাসের অগ্রিম ভাড়া',
    amount: 14000.00,
    date: '2026-06-01',
    paidById: 'mem-1', // Arif
    category: 'rent',
    isBazaar: false,
  },
  {
    id: 'exp-5',
    messId: 'mess-1',
    description: 'বুয়া / রাঁধুনী খালার ১ সপ্তাহের বেতন',
    amount: 1200.00,
    date: '2026-07-01',
    paidById: 'mem-2', // Tanvir
    category: 'cook',
    isBazaar: false,
  },

  // Mess 2
  {
    id: 'exp-6',
    messId: 'mess-2',
    description: 'Daily morning vegetables & milk',
    amount: 850.00,
    date: '2026-07-01',
    paidById: 'mem-5',
    category: 'groceries',
    isBazaar: true,
  },
  {
    id: 'exp-7',
    messId: 'mess-2',
    description: 'Gas cylinder refilling',
    amount: 1100.00,
    date: '2026-07-02',
    paidById: 'mem-6',
    category: 'utilities',
    isBazaar: false,
  }
];

export const INITIAL_DEPOSITS: Deposit[] = [
  // Mess 1
  { id: 'dep-1', messId: 'mess-1', memberId: 'mem-1', amount: 5000, date: '2026-06-25', notes: 'Arif advance contribution' },
  { id: 'dep-2', messId: 'mess-1', memberId: 'mem-2', amount: 4500, date: '2026-06-26', notes: 'Tanvir June deposit' },
  { id: 'dep-3', messId: 'mess-1', memberId: 'mem-3', amount: 4200, date: '2026-06-27', notes: 'Sajid initial fund' },
  { id: 'dep-4', messId: 'mess-1', memberId: 'mem-4', amount: 4800, date: '2026-06-27', notes: 'Rafsan advance bazar' },
  { id: 'dep-5', messId: 'mess-1', memberId: 'mem-2', amount: 1500, date: '2026-07-01', notes: 'Tanvir additional rent deposit' },

  // Mess 2
  { id: 'dep-6', messId: 'mess-2', memberId: 'mem-5', amount: 5000, date: '2026-06-25', notes: 'Initial fund' },
  { id: 'dep-7', messId: 'mess-2', memberId: 'mem-6', amount: 3000, date: '2026-06-26', notes: 'Advance' },
  { id: 'dep-8', messId: 'mess-2', memberId: 'mem-7', amount: 4000, date: '2026-06-27', notes: 'Rent split advance' },
  { id: 'dep-9', messId: 'mess-2', memberId: 'mem-8', amount: 2000, date: '2026-06-28', notes: 'Advance' },
];

export const INITIAL_LOGS = [
  {
    id: 'log-1',
    messId: 'mess-1',
    timestamp: '2026-06-28T09:00:00.000Z',
    userId: 'mem-1',
    userName: 'Arif Rahman (আরিফ)',
    actionBn: 'নতুন সদস্য হিসেবে সাজিদ হাসান (সাজিদ)-কে যুক্ত করেছেন',
    actionEn: 'Added Sajid Hasan (সাজিদ) as a new member',
    details: 'Role: member'
  },
  {
    id: 'log-2',
    messId: 'mess-1',
    timestamp: '2026-06-28T10:30:00.000Z',
    userId: 'mem-1',
    userName: 'Arif Rahman (আরিফ)',
    actionBn: '৳২৮৫০.০০ টাকার খরচ যোগ করেছেন: "সাপ্তাহিক বড় বাজার (মুরগি, ডিম, চাল, তেল, আলু ও ডাল)"',
    actionEn: 'Added expense of ৳2850.00: "সাপ্তাহিক বড় বাজার (মুরগি, ডিম, চাল, তেল, আলু ও ডাল)"',
    details: 'Paid by Rafsan Jamil (রাফসান)'
  },
  {
    id: 'log-3',
    messId: 'mess-1',
    timestamp: '2026-06-29T18:00:00.000Z',
    userId: 'mem-1',
    userName: 'Arif Rahman (আরিফ)',
    actionBn: '৳৬০০.০০ টাকার ইউটিলিটি খরচ যোগ করেছেন: "ওয়াইফাই ও ইন্টারনেট বিল (Wifi Bill)"',
    actionEn: 'Added utility expense of ৳600.00: "ওয়াইফাই ও ইন্টারনেট বিল (Wifi Bill)"',
    details: 'Paid by Sajid Hasan (সাজিদ)'
  },
  {
    id: 'log-4',
    messId: 'mess-1',
    timestamp: '2026-06-30T11:15:00.000Z',
    userId: 'mem-1',
    userName: 'Arif Rahman (আরিফ)',
    actionBn: 'তানভীর আহমেদ (তানভীর)-কে "ম্যানেজার" ভূমিকা হিসেবে নিযুক্ত করেছেন',
    actionEn: 'Promoted Tanvir Ahmed (তানভীর) to Manager role',
    details: 'Role updated to manager'
  },
  {
    id: 'log-5',
    messId: 'mess-2',
    timestamp: '2026-07-01T15:20:00.000Z',
    userId: 'mem-5',
    userName: 'John Doe',
    actionBn: 'Emily Watson-এর $3000.00 জমা রেকর্ড যুক্ত করেছেন',
    actionEn: 'Recorded $3000.00 deposit for Emily Watson',
    details: 'Notes: Advance'
  }
];

