import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  TrendingUp, 
  BadgeDollarSign, 
  Users, 
  Calendar, 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  Layers, 
  Home, 
  DollarSign, 
  User, 
  Plus, 
  Trash2, 
  RefreshCw,
  Clock,
  Languages,
  Menu,
  X,
  LogOut,
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Mess, Member, MealRecord, Expense, Deposit, HistoryLog } from './types';
import { 
  INITIAL_MESSES, 
  INITIAL_MEMBERS, 
  INITIAL_MEALS, 
  INITIAL_EXPENSES, 
  INITIAL_DEPOSITS,
  INITIAL_LOGS
} from './mockData';
import { calculateMessSummary } from './utils';
import { translations } from './translations';

// Firebase Integrations
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

// Components
import MealManager from './components/MealManager';
import ExpenseTracker from './components/ExpenseTracker';
import DepositLedger from './components/DepositLedger';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIAssistant from './components/AIAssistant';
import MessSelector from './components/MessSelector';
import MemberSection from './components/MemberSection';

export default function App() {
  // --- Language State ---
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('messadmin_lang');
    return (saved as 'en' | 'bn') || 'bn'; // Default to Bangla for Bangladeshi mess flavor
  });

  // --- State Initialization with LocalStorage Persistence ---
  const [messes, setMesses] = useState<Mess[]>(() => {
    const saved = localStorage.getItem('messadmin_messes');
    return saved ? JSON.parse(saved) : INITIAL_MESSES;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('messadmin_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [meals, setMeals] = useState<MealRecord[]>(() => {
    const saved = localStorage.getItem('messadmin_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('messadmin_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem('messadmin_deposits');
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem('messadmin_history_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentMessId, setCurrentMessId] = useState<string>(() => {
    const saved = localStorage.getItem('messadmin_current_mess_id');
    return saved || 'mess-1';
  });

  const [activeSimUserId, setActiveSimUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('messadmin_sim_user_id');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'meals' | 'expenses' | 'deposits' | 'ai-co-pilot' | 'tenant-setup' | 'members'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpMessName, setSignUpMessName] = useState('');
  const [signUpAdminName, setSignUpAdminName] = useState('');
  const [signUpAdminEmail, setSignUpAdminEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- Firebase Google Auth and Sync States ---
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [googleSignUpMode, setGoogleSignUpMode] = useState<boolean>(false);
  const [googleSignUpMessName, setGoogleSignUpMessName] = useState<string>('');
  const [isSyncingWithFirestore, setIsSyncingWithFirestore] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    countdown: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    countdown: 5,
  });

  useEffect(() => {
    let timer: any;
    if (confirmModal.isOpen) {
      if (confirmModal.countdown > 0) {
        timer = setTimeout(() => {
          setConfirmModal(prev => ({
            ...prev,
            countdown: prev.countdown - 1
          }));
        }, 1000);
      } else {
        // Auto-cancel on timeout!
        setConfirmModal(prev => ({
          ...prev,
          isOpen: false
        }));
      }
    }
    return () => clearTimeout(timer);
  }, [confirmModal.isOpen, confirmModal.countdown]);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      countdown: 5
    });
  };

  // --- Synchronization Effects ---
  useEffect(() => {
    localStorage.setItem('messadmin_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('messadmin_messes', JSON.stringify(messes));
  }, [messes]);

  useEffect(() => {
    localStorage.setItem('messadmin_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('messadmin_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('messadmin_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('messadmin_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('messadmin_history_logs', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('messadmin_current_mess_id', currentMessId);
  }, [currentMessId]);

  useEffect(() => {
    localStorage.setItem('messadmin_sim_user_id', JSON.stringify(activeSimUserId));
  }, [activeSimUserId]);

  // --- Firestore Sync Engine ---
  const syncStateFromFirestore = async (email: string) => {
    setIsSyncingWithFirestore(true);
    try {
      const membersRef = collection(db, 'members');
      const q = query(membersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const memberDoc = querySnapshot.docs[0];
        const memberData = memberDoc.data() as Member;
        const userMessId = memberData.messId;
        
        // 1. Fetch Mess
        const messDocRef = doc(db, 'messes', userMessId);
        const messDocSnap = await getDoc(messDocRef);
        let loadedMess: Mess;
        if (messDocSnap.exists()) {
          loadedMess = messDocSnap.data() as Mess;
        } else {
          loadedMess = {
            id: userMessId,
            name: 'My Cloud Mess',
            currency: '৳',
            createdDate: new Date().toISOString().split('T')[0]
          };
        }

        // 2. Fetch Members
        const allMembersQuery = query(collection(db, 'members'), where('messId', '==', userMessId));
        const allMembersSnap = await getDocs(allMembersQuery);
        const loadedMembers = allMembersSnap.docs.map(d => d.data() as Member);

        // 3. Fetch Meals
        const allMealsQuery = query(collection(db, 'meals'), where('messId', '==', userMessId));
        const allMealsSnap = await getDocs(allMealsQuery);
        const loadedMeals = allMealsSnap.docs.map(d => d.data() as MealRecord);

        // 4. Fetch Expenses
        const allExpensesQuery = query(collection(db, 'expenses'), where('messId', '==', userMessId));
        const allExpensesSnap = await getDocs(allExpensesQuery);
        const loadedExpenses = allExpensesSnap.docs.map(d => d.data() as Expense);

        // 5. Fetch Deposits
        const allDepositsQuery = query(collection(db, 'deposits'), where('messId', '==', userMessId));
        const allDepositsSnap = await getDocs(allDepositsQuery);
        const loadedDeposits = allDepositsSnap.docs.map(d => d.data() as Deposit);

        // 6. Fetch History Logs
        const allLogsQuery = query(collection(db, 'history_logs'), where('messId', '==', userMessId));
        const allLogsSnap = await getDocs(allLogsQuery);
        const loadedLogs = allLogsSnap.docs.map(d => d.data() as HistoryLog);

        // Merge back into local states
        setMesses(prev => {
          const filtered = prev.filter(m => m.id !== userMessId);
          return [...filtered, loadedMess];
        });
        setMembers(prev => {
          const filtered = prev.filter(m => m.messId !== userMessId);
          return [...filtered, ...loadedMembers];
        });
        setMeals(prev => {
          const filtered = prev.filter(m => m.messId !== userMessId);
          return [...filtered, ...loadedMeals];
        });
        setExpenses(prev => {
          const filtered = prev.filter(e => e.messId !== userMessId);
          return [...filtered, ...loadedExpenses];
        });
        setDeposits(prev => {
          const filtered = prev.filter(d => d.messId !== userMessId);
          return [...filtered, ...loadedDeposits];
        });
        setHistoryLogs(prev => {
          const filtered = prev.filter(l => l.messId !== userMessId);
          return [...filtered, ...loadedLogs];
        });

        setCurrentMessId(userMessId);
        setActiveSimUserId(memberData.id);
        setIsLocked(false);
        setGoogleSignUpMode(false);
        return true;
      }
    } catch (err) {
      console.error("Firestore sync state error:", err);
    } finally {
      setIsSyncingWithFirestore(false);
    }
    return false;
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFbUser(user);
        const exists = await syncStateFromFirestore(user.email!);
        if (!exists) {
          // If logged in via Google but no mess, prompt them to register a new mess
          setGoogleSignUpMode(true);
        }
      } else {
        setFbUser(null);
        setGoogleSignUpMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Login & Signup Handler
  const handleGoogleAuth = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError(
          lang === 'bn'
            ? 'পপ-আপ উইন্ডোটি ব্লক করা হয়েছে। দয়া করে ব্রাউজার সেটিংসে পপ-আপ চালু করুন এবং পুনরায় চেষ্টা করুন।'
            : 'Popup blocked by browser. Please enable popups and try again.'
        );
      } else {
        setAuthError(err.message || "Google Sign-In failed.");
      }
    }
  };

  // Google Registration handler (mess creation)
  const handleGoogleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbUser || !googleSignUpMessName.trim()) {
      setAuthError(lang === 'bn' ? 'অনুগ্রহ করে মেসের নাম লিখুন।' : 'Please enter your mess name.');
      return;
    }

    try {
      const newMessId = `mess-${Date.now()}`;
      const newMemberId = `mem-${Date.now()}-adm`;

      const newMess: Mess = {
        id: newMessId,
        name: googleSignUpMessName.trim(),
        currency: '৳',
        createdDate: new Date().toISOString().split('T')[0]
      };

      const newAdmin: Member = {
        id: newMemberId,
        messId: newMessId,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin',
        email: fbUser.email!.trim().toLowerCase(),
        role: 'admin',
        status: 'active'
      };

      // 1. Write Mess
      await setDoc(doc(db, 'messes', newMessId), newMess);
      // 2. Write Admin Member
      await setDoc(doc(db, 'members', newMemberId), newAdmin);

      // 3. Write default companion members
      const defaultMembers: Member[] = [
        {
          id: `mem-${Date.now()}-m1`,
          messId: newMessId,
          name: lang === 'bn' ? 'আসিফ আহমেদ' : 'Asif Ahmed',
          email: 'asif@example.com',
          role: 'manager',
          status: 'active'
        },
        {
          id: `mem-${Date.now()}-m2`,
          messId: newMessId,
          name: lang === 'bn' ? 'রিফাত চৌধুরী' : 'Rifat Chowdhury',
          email: 'rifat@example.com',
          role: 'member',
          status: 'active'
        }
      ];

      for (const dm of defaultMembers) {
        await setDoc(doc(db, 'members', dm.id), dm);
      }

      // Update local state
      setMesses(prev => [...prev, newMess]);
      setMembers(prev => [...prev, newAdmin, ...defaultMembers]);
      setCurrentMessId(newMessId);
      setActiveSimUserId(newAdmin.id);
      setGoogleSignUpMode(false);
      setIsLocked(false);
      setAuthError('');
      setGoogleSignUpMessName('');
    } catch (err: any) {
      console.error("Google Mess Signup error:", err);
      setAuthError(
        lang === 'bn' 
          ? 'মেস তৈরি করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।' 
          : 'Failed to create mess workspace. Please try again.'
      );
    }
  };

  // --- Active Context Derivations ---
  const currentMess = messes.find(m => m.id === currentMessId) || messes[0];
  const currency = currentMess?.currency || '৳';
  const t = translations[lang];

  // Calculate dynamic metrics using the utility engine
  const summary = calculateMessSummary(
    currentMessId,
    members,
    meals,
    expenses,
    deposits
  );

  const activeSimUser = members.find(m => m.id === activeSimUserId);
  const hasEditPermission = activeSimUserId === null || activeSimUser?.role === 'admin';

  const logActivity = (actionBn: string, actionEn: string, details?: string) => {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const logObj: HistoryLog = {
      id: logId,
      messId: currentMessId,
      timestamp: new Date().toISOString(),
      userId: activeSimUserId,
      userName: activeSimUser ? activeSimUser.name : (lang === 'bn' ? 'মাস্টার এডমিন' : 'Master Admin'),
      userRole: activeSimUser ? activeSimUser.role : 'master',
      actionBn,
      actionEn,
      details
    };

    setHistoryLogs(prev => [logObj, ...prev]);

    if (fbUser) {
      setDoc(doc(db, 'history_logs', logId), logObj).catch(err => console.error("Firestore save activity log error:", err));
    }
  };

  // --- State Action Handlers ---
  const handleUpdateMeals = (updatedMeals: Omit<MealRecord, 'id'>[]) => {
    triggerConfirm(
      lang === 'bn' ? 'মিল হিসাব সংরক্ষণ করুন' : 'Save Meal Record',
      lang === 'bn' ? 'আপনি কি আজকের মিল খাতা নিশ্চিতভাবে সংরক্ষণ করতে চান?' : 'Are you sure you want to save the meal records for this day?',
      () => {
        const newlyCreated: MealRecord[] = updatedMeals.map((um, idx) => ({
          id: `meal-${um.date}-${um.memberId}-${idx}`,
          ...um
        }));

        if (fbUser) {
          for (const m of newlyCreated) {
            setDoc(doc(db, 'meals', m.id), m).catch(err => console.error("Firestore save meal error:", err));
          }
        }

        const logDate = updatedMeals[0]?.date || '';
        logActivity(
          `${logDate} তারিখের মিলের হিসাব সংরক্ষণ বা আপডেট করেছেন`,
          `Saved/Updated meal records for date ${logDate}`,
          `Updated meals for ${updatedMeals.length} members.`
        );

        setMeals(prev => {
          const datesToUpdate = new Set(updatedMeals.map(um => um.date));
          const filtered = prev.filter(
            m => !(m.messId === currentMessId && datesToUpdate.has(m.date))
          );
          return [...filtered, ...newlyCreated];
        });
      }
    );
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    triggerConfirm(
      lang === 'bn' ? 'নতুন খরচ যোগ করুন' : 'Add New Expense',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে ${newExp.amount} টাকার "${newExp.description}" খরচটি যুক্ত করতে চান?` : `Are you sure you want to add the expense "${newExp.description}" of amount ${currency}${newExp.amount}?`,
      () => {
        const expId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const expObj = {
          id: expId,
          ...newExp
        };

        if (fbUser) {
          setDoc(doc(db, 'expenses', expId), expObj).catch(err => console.error("Firestore save expense error:", err));
        }

        const paidByMember = members.find(m => m.id === newExp.paidById)?.name || 'Unknown';
        logActivity(
          `${newExp.amount} টাকার খরচ যোগ করেছেন: "${newExp.description}"`,
          `Added expense of ${currency}${newExp.amount}: "${newExp.description}"`,
          `Paid by ${paidByMember}`
        );

        setExpenses(prev => [...prev, expObj]);
      }
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    triggerConfirm(
      lang === 'bn' ? 'খরচ মুছে ফেলুন' : 'Delete Expense',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${exp?.description || 'এই খরচটি'}" মুছে ফেলতে চান?` : `Are you sure you want to delete the expense "${exp?.description || 'this expense'}"?`,
      () => {
        if (fbUser) {
          deleteDoc(doc(db, 'expenses', expenseId)).catch(err => console.error("Firestore delete expense error:", err));
        }

        if (exp) {
          const originalPaidBy = members.find(m => m.id === exp.paidById)?.name || 'Unknown';
          logActivity(
            `খরচ মুছে ফেলেছেন: "${exp.description}" (${exp.amount} টাকা)`,
            `Deleted expense: "${exp.description}" (${currency}${exp.amount})`,
            `Originally paid by ${originalPaidBy}`
          );
        }

        setExpenses(prev => prev.filter(e => e.id !== expenseId));
      }
    );
  };

  const handleAddDeposit = (newDep: Omit<Deposit, 'id'>) => {
    const memberName = members.find(m => m.id === newDep.memberId)?.name || 'সদস্য';
    triggerConfirm(
      lang === 'bn' ? 'টাকা জমা যোগ করুন' : 'Record Deposit',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে ${memberName}-এর ${newDep.amount} টাকা জমা যুক্ত করতে চান?` : `Are you sure you want to record a deposit of ${currency}${newDep.amount} for ${memberName}?`,
      () => {
        const depId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const depObj = {
          id: depId,
          ...newDep
        };

        if (fbUser) {
          setDoc(doc(db, 'deposits', depId), depObj).catch(err => console.error("Firestore save deposit error:", err));
        }

        logActivity(
          `${memberName}-এর ৳${newDep.amount} টাকা জমা রেকর্ড যুক্ত করেছেন`,
          `Recorded deposit of ${currency}${newDep.amount} for ${memberName}`,
          `Notes: ${newDep.notes || 'None'}`
        );

        setDeposits(prev => [...prev, depObj]);
      }
    );
  };

  const handleDeleteDeposit = (depositId: string) => {
    const dep = deposits.find(d => d.id === depositId);
    const memberName = members.find(m => m.id === dep?.memberId)?.name || 'সদস্য';
    triggerConfirm(
      lang === 'bn' ? 'জমা রেকর্ড মুছে ফেলুন' : 'Delete Deposit Record',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে ${memberName}-এর ${dep?.amount || 0} টাকার জমা রেকর্ডটি মুছে ফেলতে চান?` : `Are you sure you want to delete the deposit of ${currency}${dep?.amount || 0} for ${memberName}?`,
      () => {
        if (fbUser) {
          deleteDoc(doc(db, 'deposits', depositId)).catch(err => console.error("Firestore delete deposit error:", err));
        }

        if (dep) {
          logActivity(
            `${memberName}-এর ৳${dep.amount} টাকার জমা রেকর্ড মুছে ফেলেছেন`,
            `Deleted deposit record of ${currency}${dep.amount} for ${memberName}`,
            `Notes was: ${dep.notes || 'None'}`
          );
        }

        setDeposits(prev => prev.filter(d => d.id !== depositId));
      }
    );
  };

  const handleCreateMess = (newMess: Omit<Mess, 'id'>, adminName: string, adminEmail: string) => {
    triggerConfirm(
      lang === 'bn' ? 'নতুন মেস তৈরি করুন' : 'Create New Mess',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${newMess.name}" নামে নতুন মেস ও অ্যাকাউন্ট তৈরি করতে চান?` : `Are you sure you want to provision the new mess "${newMess.name}"?`,
      () => {
        const newMessId = `mess-${Date.now()}`;
        const newlyCreatedMess: Mess = {
          id: newMessId,
          ...newMess
        };

        const newlyCreatedAdmin: Member = {
          id: `mem-${Date.now()}-adm`,
          messId: newMessId,
          name: adminName,
          email: adminEmail.trim().toLowerCase(),
          role: 'admin',
          status: 'active'
        };

        if (fbUser) {
          setDoc(doc(db, 'messes', newMessId), newlyCreatedMess).catch(err => console.error("Firestore create mess error:", err));
          setDoc(doc(db, 'members', newlyCreatedAdmin.id), newlyCreatedAdmin).catch(err => console.error("Firestore create member error:", err));
        }

        setMesses(prev => [...prev, newlyCreatedMess]);
        setMembers(prev => [...prev, newlyCreatedAdmin]);
        setCurrentMessId(newMessId);
        setActiveSimUserId(newlyCreatedAdmin.id); // Logs in as master console
        setActiveTab('dashboard');
      }
    );
  };

  const handleAddMember = (newMem: Omit<Member, 'id'>) => {
    triggerConfirm(
      lang === 'bn' ? 'সদস্য যুক্ত করুন' : 'Add Member',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${newMem.name}" কে নতুন সদস্য হিসেবে যুক্ত করতে চান?` : `Are you sure you want to add "${newMem.name}" to the mess?`,
      () => {
        const memId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const memObj = {
          id: memId,
          ...newMem
        };

        if (fbUser) {
          setDoc(doc(db, 'members', memId), memObj).catch(err => console.error("Firestore add member error:", err));
        }

        logActivity(
          `নতুন সদস্য হিসেবে "${newMem.name}"-কে যুক্ত করেছেন`,
          `Added "${newMem.name}" as a new member`,
          `Role: ${newMem.role}`
        );

        setMembers(prev => [...prev, memObj]);
      }
    );
  };

  const handleToggleMemberStatus = (memberId: string) => {
    const originalMem = members.find(m => m.id === memberId);
    const memName = originalMem?.name || '';
    const originalStatus = originalMem?.status || 'active';
    const newStatus = originalStatus === 'active' ? 'inactive' : 'active';
    triggerConfirm(
      lang === 'bn' ? 'সদস্যের সক্রিয়তা টগল করুন' : 'Toggle Member Status',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${memName}"-এর সক্রিয়তা স্ট্যাটাস পরিবর্তন করতে চান?` : `Are you sure you want to toggle the active status for "${memName}"?`,
      () => {
        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            const updated = {
              ...m,
              status: (m.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive'
            };
            if (fbUser) {
              setDoc(doc(db, 'members', memberId), updated).catch(err => console.error("Firestore toggle status error:", err));
            }

            logActivity(
              `"${memName}"-এর সক্রিয়তা পরিবর্তন করেছেন`,
              `Changed active status for "${memName}"`,
              `Status: ${newStatus}`
            );

            return updated;
          }
          return m;
        }));
      }
    );
  };

  const handleUpdateMemberRole = (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    const memName = members.find(m => m.id === memberId)?.name || '';
    const roleLabel = newRole === 'admin' ? (lang === 'bn' ? 'এডমিন' : 'Admin') : newRole === 'manager' ? (lang === 'bn' ? 'ম্যানেজার' : 'Manager') : (lang === 'bn' ? 'সদস্য' : 'Member');
    triggerConfirm(
      lang === 'bn' ? 'সদস্যের ভূমিকা পরিবর্তন করুন' : 'Change Member Role',
      lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${memName}"-এর ভূমিকা "${roleLabel}"-এ পরিবর্তন করতে চান?` : `Are you sure you want to change "${memName}"'s role to "${roleLabel}"?`,
      () => {
        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            const updated = {
              ...m,
              role: newRole
            };
            if (fbUser) {
              setDoc(doc(db, 'members', memberId), updated).catch(err => console.error("Firestore update role error:", err));
            }

            logActivity(
              `"${memName}"-কে "${roleLabel}" ভূমিকা হিসেবে নিযুক্ত করেছেন`,
              `Promoted/Changed role of "${memName}" to ${roleLabel}`,
              `Role updated to ${newRole}`
            );

            return updated;
          }
          return m;
        }));
      }
    );
  };

  const handleSignOut = async () => {
    if (fbUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase signOut error:", err);
      }
    }
    setIsLocked(true);
    setActiveSimUserId(null);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError(lang === 'bn' ? 'অনুগ্রহ করে ইমেল ঠিকানা দিন।' : 'Please enter your email address.');
      return;
    }
    
    // Check if email matches any member's email in members (case-insensitive)
    const matchedMember = members.find(m => m.email.toLowerCase() === loginEmail.trim().toLowerCase());
    
    if (matchedMember) {
      setCurrentMessId(matchedMember.messId);
      setActiveSimUserId(matchedMember.id);
      setIsLocked(false);
      setAuthError('');
      setLoginEmail('');
      setLoginPassword('');
    } else if (loginEmail.trim().toLowerCase() === 'admin@example.com' || loginEmail.trim().toLowerCase() === 'admin') {
      // Allow logging into the master admin console directly
      setActiveSimUserId(null);
      setIsLocked(false);
      setAuthError('');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setAuthError(
        lang === 'bn' 
          ? 'এই ইমেলটি কোনো মেম্বার ডিরেক্টরিতে পাওয়া যায়নি! অনুগ্রহ করে সঠিক ইমেল দিন বা সাইন আপ করুন।' 
          : 'Email not found in any mess directory! Try again or register a new mess.'
      );
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpMessName.trim() || !signUpAdminName.trim() || !signUpAdminEmail.trim()) {
      setAuthError(lang === 'bn' ? 'অনুগ্রহ করে সবগুলো তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    // Check if email already exists
    const emailExists = members.some(m => m.email.toLowerCase() === signUpAdminEmail.trim().toLowerCase());
    if (emailExists) {
      setAuthError(
        lang === 'bn' 
          ? 'এই ইমেলটি ইতোমধ্যে ব্যবহার করা হয়েছে! দয়া করে অন্য ইমেল ব্যবহার করুন।' 
          : 'This email is already registered! Please use a different email.'
      );
      return;
    }

    // Provision the mess with confirmation!
    triggerConfirm(
      lang === 'bn' ? 'নতুন মেস চালু করুন' : 'Provision New Mess',
      lang === 'bn' ? `আপনি কি "${signUpMessName}" নামে নতুন মেস ও অ্যাকাউন্ট তৈরি করতে নিশ্চিত?` : `Are you sure you want to provision "${signUpMessName}" and create this master admin account?`,
      () => {
        const newMessId = `mess-${Date.now()}`;
        const newlyCreatedMess: Mess = {
          id: newMessId,
          name: signUpMessName.trim(),
          currency: '৳',
          createdDate: new Date().toISOString().split('T')[0],
        };

        const newlyCreatedAdmin: Member = {
          id: `mem-${Date.now()}-adm`,
          messId: newMessId,
          name: signUpAdminName.trim(),
          email: signUpAdminEmail.trim(),
          role: 'admin', // This role is admin, which represents master admin!
          status: 'active'
        };

        setMesses(prev => [...prev, newlyCreatedMess]);
        setMembers(prev => [...prev, newlyCreatedAdmin]);
        setCurrentMessId(newMessId);
        setActiveSimUserId(null); // Logs in as master console
        setIsLocked(false);
        setAuthError('');
        
        // Reset form
        setSignUpMessName('');
        setSignUpAdminName('');
        setSignUpAdminEmail('');
        setSignUpPassword('');
        setAuthTab('signin');
      }
    );
  };

  if (isLocked) {
    const activeMembers = members.filter(m => m.messId === currentMessId && m.status === 'active');

    if (googleSignUpMode) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans text-slate-100">
          {/* Ambient Cosmic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 z-0"></div>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center font-display font-black text-white text-2xl shadow-lg shadow-indigo-600/30 mx-auto">
              M
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-100">{lang === 'bn' ? 'মেস সেটআপ করুন' : 'Setup Your Mess Workspace'}</h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? `স্বাগতম ${fbUser?.displayName || fbUser?.email}! আপনার নতুন ক্লাউড মেসের একটি সুন্দর নাম দিন।`
                  : `Welcome ${fbUser?.displayName || fbUser?.email}! Please enter a name to create your cloud mess workspace.`}
              </p>
            </div>

            {authError && (
              <div className="bg-rose-950/20 border border-rose-900/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs text-left">
                {authError}
              </div>
            )}

            <form onSubmit={handleGoogleSignUpSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'মেসের নাম' : 'Mess Name'}</label>
                <input
                  type="text"
                  required
                  value={googleSignUpMessName}
                  onChange={(e) => setGoogleSignUpMessName(e.target.value)}
                  placeholder="e.g. Dream Haven Flat A1"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                <span>{lang === 'bn' ? 'নতুন মেস চালু করুন' : 'Launch Workspace'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={handleSignOut}
              className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              {lang === 'bn' ? 'অন্য একাউন্টে সাইন ইন করুন' : 'Sign Out / Switch Account'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
        {/* Ambient Cosmic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

        <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Column: Premium SaaS Intro Column */}
          <div className="lg:col-span-5 bg-indigo-950/30 border-r border-slate-800/40 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-[80px] pointer-events-none"></div>
            
            <div className="space-y-6 relative z-10 text-slate-100">
              {/* Logo / Brand */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center font-display font-black text-white text-lg shadow-lg shadow-indigo-600/30">
                  M
                </div>
                <div>
                  <h1 className="font-display font-black text-lg text-slate-50 tracking-tight">{lang === 'bn' ? 'মেসঅ্যাডমিন' : 'MessAdmin'}</h1>
                  <p className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider">{lang === 'bn' ? 'মেসের হিসাব-নিকাশের আধুনিক প্ল্যাটফর্ম' : 'SaaS ACCOUNTING PORTAL'}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <h2 className="font-display font-bold text-xl md:text-2xl text-slate-100 leading-tight">
                  {lang === 'bn' 
                    ? 'মেসের মিল, বাজার ও জমা খরচের হিসাব রাখুন এক ক্লিকে!' 
                    : 'Track communal meals, bills, and deposits effortlessly.'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'মেসঅ্যাডমিন হলো মেসের সব ধরনের হিসাব-নিকাশ পরিচালনা করার জন্য একটি সম্পূর্ণ স্বয়ংক্রিয় ক্লাউড পোর্টাল। মিল রেট হিসাব করা থেকে শুরু করে বাজার অপ্টিমাইজেশন ও স্মার্ট পেমেন্ট সলিউশন—সব পাবেন এখানে।'
                    : 'Experience precise real-time cost-splitting metrics, automated bazaar calculations, settlement suggestions, and advanced server-side Gemini AI analysis.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-800/60 relative z-10 text-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{lang === 'bn' ? '৩০০০ পোর্ট সিকিউরড মেস নেটওয়ার্ক' : 'Port 3000 Secure Workspace'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{lang === 'bn' ? 'জেসমিন এআই চালিত স্মার্ট কুয়েরি সিস্টেম' : 'Gemini Intelligent Core Active'}</span>
              </div>
              
              {/* Language switcher right inside the login block */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 max-w-[140px]">
                <button
                  onClick={() => setLang('bn')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                    lang === 'bn' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                    lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Space */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between text-slate-100">
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-800 p-0.5 max-w-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
                <button
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                    authTab === 'signin'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'লগইন (Sign In)' : 'Sign In'}
                </button>
                <button
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                    authTab === 'signup'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'সাইন আপ (Sign Up)' : 'Register Mess'}
                </button>
              </div>

              {/* Error messages */}
              {authError && (
                <div className="bg-rose-950/20 border border-rose-900/30 text-rose-300 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                  <span>{authError}</span>
                </div>
              )}

              {authTab === 'signin' ? (
                /* Login Form */
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-100">{lang === 'bn' ? 'পোর্টালে প্রবেশ করুন' : 'Welcome Back'}</h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn'
                        ? 'গুগল দিয়ে সরাসরি প্রবেশ করুন অথবা মেম্বার ডিরেক্টরির ইমেইল ব্যবহার করুন।'
                        : 'Sign in directly with your Google Account or enter a simulation email below.'}
                    </p>
                  </div>

                  {/* Primary Google Auth Action Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full cursor-pointer flex items-center justify-center gap-3 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] border border-slate-200"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c1.02-3.05 3.87-5.51 6.76-5.51z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.24 14.55c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 6.74C.5 8.52 0 10.5 0 12.5s.5 3.98 1.39 5.76l3.85-2.91z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-2.89 0-5.34-1.96-6.21-4.61l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
                      />
                    </svg>
                    <span>{lang === 'bn' ? 'গুগল একাউন্ট দিয়ে লগইন করুন' : 'Continue with Google'}</span>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {lang === 'bn' ? 'অথবা ইমেইল দিয়ে সিমুলেশন' : 'Or with simulated email'}
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. rifat@example.com"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড (সিমুলেটেড)' : 'Password (any simulated)'}</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
                    >
                      <span>{lang === 'bn' ? 'পোর্টালে প্রবেশ করুন' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Registration / Signup Form */
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-100">{lang === 'bn' ? 'নতুন মেস রেজিস্টার করুন' : 'Provision Dynamic Mess'}</h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' 
                        ? 'মেস তৈরি করার সাথে সাথে আপনি এই মেসের মূল নিয়ন্ত্রক (মাস্টার এডমিন) হিসেবে নিযুক্ত হবেন।' 
                        : 'Creating a new mess automatically registers you as the Master Admin of this workspace.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'মেস বা ফ্ল্যাটের নাম' : 'Mess / Flat Name'}</label>
                      <input
                        type="text"
                        required
                        value={signUpMessName}
                        onChange={(e) => setSignUpMessName(e.target.value)}
                        placeholder="e.g. Green Flat B4"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'মাস্টার এডমিনের নাম' : 'Master Admin Name'}</label>
                      <input
                        type="text"
                        required
                        value={signUpAdminName}
                        onChange={(e) => setSignUpAdminName(e.target.value)}
                        placeholder="e.g. Asif Ahmed"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                      <input
                        type="email"
                        required
                        value={signUpAdminEmail}
                        onChange={(e) => setSignUpAdminEmail(e.target.value)}
                        placeholder="asif@example.com"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                      <input
                        type="password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>{lang === 'bn' ? 'নতুন মেস চালু করুন' : 'Launch New Mess Workspace'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Simulation Helper Panel */}
              <div className="pt-6 border-t border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'bn' ? 'সদস্য তালিকা (সিমুলেশন):' : 'MEMBERS DIRECTORY (SIMULATION LOGIN):'}</h4>
                  <span className="text-[9px] text-indigo-400 font-mono font-bold bg-indigo-950/50 px-1.5 py-0.5 rounded uppercase">{currentMess?.name}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {/* Master console log in */}
                  <button
                    onClick={() => {
                      setActiveSimUserId(null);
                      setIsLocked(false);
                    }}
                    className="cursor-pointer text-left p-2.5 bg-slate-950/55 hover:bg-indigo-950/20 border border-slate-800 hover:border-indigo-900/30 rounded-xl transition-all flex items-center justify-between text-[11px] group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-200 group-hover:text-white truncate">{lang === 'bn' ? 'মাস্টার এডমিন' : 'Master Admin'}</span>
                    </div>
                    <span className="text-[8px] bg-indigo-950 text-indigo-300 font-mono font-extrabold px-1.5 py-0.5 rounded-sm uppercase scale-90 shrink-0">ALL ACCESS</span>
                  </button>

                  {/* Registered members log in */}
                  {activeMembers.map(m => {
                    const roleLabel = m.role === 'admin' ? 'ADMIN' : m.role === 'manager' ? 'MANAGER' : 'MEMBER';
                    const roleColor = m.role === 'admin' ? 'bg-indigo-900/40 text-indigo-300 border-indigo-800/40' : m.role === 'manager' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40' : 'bg-slate-800/40 text-slate-400 border-slate-800/40';
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveSimUserId(m.id);
                          setIsLocked(false);
                        }}
                        className="cursor-pointer text-left p-2.5 bg-slate-950/55 hover:bg-slate-900/80 border border-slate-800 rounded-xl transition-all flex items-center justify-between text-[11px] truncate group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-4.5 h-4.5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[8px] font-bold shrink-0">
                            {m.name.slice(0, 1)}
                          </div>
                          <span className="font-medium text-slate-300 group-hover:text-white truncate">{m.name}</span>
                        </div>
                        <span className={`text-[8px] font-mono font-extrabold px-1 rounded-sm uppercase tracking-wider scale-90 shrink-0 border ${roleColor}`}>
                          {roleLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 font-mono tracking-wide text-center pt-4 border-t border-slate-800/20">
              Uttara SaaS Cluster Node #3000 • SSL SECURED • v1.2.0
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row text-slate-700">
      {/* 1. Left Sidebar - Desktop Navigation */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-100 flex-col border-r border-slate-800 shrink-0">
        {/* Brand/SaaS Header */}
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-display font-black text-white text-base shadow-md shadow-indigo-600/30">
              M
            </div>
            <div>
              <h1 className="font-display font-bold text-md leading-none text-slate-50">{t.appName}</h1>
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider font-semibold uppercase mt-1 inline-block">{t.tagline}</span>
            </div>
          </div>
        </div>

        {/* Selected Workspace Indicator */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.activeTenant}</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{currentMess?.name || "No Mess Selected"}</p>
        </div>

        {/* Navigation Tabs and Members List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <nav className="px-4 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t.kpiAnalytics}</span>
            </button>

            <button
              onClick={() => setActiveTab('meals')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'meals'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t.mealsLedger}</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t.billsAndGroceries}</span>
            </button>

            <button
              onClick={() => setActiveTab('deposits')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'deposits'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <BadgeDollarSign className="w-4 h-4" />
              <span>{t.memberDeposits}</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সদস্য ও রোল সেটিং' : 'Members & Roles'}</span>
            </button>

            <div className="h-px bg-slate-800 my-4"></div>

            <button
              onClick={() => setActiveTab('ai-co-pilot')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'ai-co-pilot'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-indigo-400 hover:bg-indigo-900/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.aiCopilot}</span>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[8px] font-bold bg-indigo-500 text-white rounded-full uppercase tracking-wider">
                Gemini
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tenant-setup')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'tenant-setup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.tenantWorkspace}</span>
            </button>
          </nav>

          {/* Members list block in Drawer/Sidebar */}
          <div className="px-5 py-4 border-t border-slate-800/60 bg-slate-950/20">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {lang === 'bn' ? 'মেস সদস্যবৃন্দ' : 'Member List'}
              </span>
              <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.2 rounded-full font-bold">
                {members.filter(m => m.messId === currentMessId && m.status === 'active').length}
              </span>
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {members.filter(m => m.messId === currentMessId).map(member => {
                const isSelected = activeSimUserId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setActiveSimUserId(member.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                      <span className="truncate">{member.name}</span>
                    </div>
                    {isSelected ? (
                      <span className="text-[8px] bg-emerald-500 text-emerald-950 px-1 rounded-sm uppercase font-extrabold font-mono shrink-0 scale-90">LIVE</span>
                    ) : (
                      <span className="text-[8px] text-slate-600 uppercase font-mono tracking-wider shrink-0">
                        {member.role === 'admin' ? (lang === 'bn' ? 'এডমিন' : 'Admin') : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Secure Logout Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 border border-rose-900/20 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{lang === 'bn' ? 'লগআউট (লক পোর্টাল)' : 'Sign Out / Lock'}</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Navigation Top Header & Drawer */}
      <header className="md:hidden bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle menu"
            id="mobile-hamburger-btn"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-black text-white text-xs shadow-md">
              M
            </div>
            <span className="font-display font-bold text-sm tracking-tight">{t.appName}</span>
          </div>
        </div>

        {/* Highly accessible language switcher right on the sticky top header */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700" id="mobile-lang-switcher">
          <button
            onClick={() => setLang('bn')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              lang === 'bn'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              id="mobile-drawer-backdrop"
            />

            {/* Sidebar Sliding Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-100 flex flex-col z-50 border-r border-slate-800 shadow-2xl md:hidden overflow-y-auto"
              id="mobile-drawer-panel"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-black text-white text-xs shadow-md">
                    M
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-sm leading-none text-slate-50">{t.appName}</h1>
                    <span className="text-[9px] text-indigo-400 font-mono tracking-wider font-semibold uppercase mt-0.5 inline-block">{t.tagline}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Workspace Indicator inside Mobile Drawer */}
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/10">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>{t.activeTenant}</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{currentMess?.name || "No Mess Selected"}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex-1 px-3 py-4 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{t.kpiAnalytics}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('meals');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'meals'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.mealsLedger}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('expenses');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'expenses'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t.billsAndGroceries}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('deposits');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'deposits'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <BadgeDollarSign className="w-4 h-4" />
                  <span>{t.memberDeposits}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('members');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সদস্য ও রোল সেটিং' : 'Members & Roles'}</span>
                </button>

                <div className="h-px bg-slate-800 my-3"></div>

                <button
                  onClick={() => {
                    setActiveTab('ai-co-pilot');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer relative ${
                    activeTab === 'ai-co-pilot'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-indigo-400 hover:bg-indigo-900/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.aiCopilot}</span>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[7px] font-bold bg-indigo-500 text-white rounded-full uppercase tracking-wider">
                    Gemini
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tenant-setup');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === 'tenant-setup'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>{t.tenantWorkspace}</span>
                </button>
              </nav>

              {/* Compact Mobile Members simulation list */}
              <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/20">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" />
                    {lang === 'bn' ? 'সদস্য তালিকা (সিমুলেশন)' : 'Members (Simulation)'}
                  </span>
                  <span className="text-[9px] bg-slate-800 text-indigo-300 px-1.5 py-0.2 rounded-full font-bold">
                    {members.filter(m => m.messId === currentMessId && m.status === 'active').length}
                  </span>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {members.filter(m => m.messId === currentMessId).map(member => {
                    const isSelected = activeSimUserId === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => {
                          setActiveSimUserId(member.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 text-[11px] rounded-lg transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                          <span className="truncate">{member.name}</span>
                        </div>
                        {isSelected && <span className="text-[8px] bg-emerald-500 text-emerald-950 px-1 rounded-sm uppercase font-extrabold font-mono shrink-0">LIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Indicator in Drawer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/25">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Change Language / ভাষা পরিবর্তন</div>
                <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setLang('bn');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                      lang === 'bn'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    বাংলা
                  </button>
                  <button
                    onClick={() => {
                      setLang('en');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                      lang === 'en'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Secure Mobile Logout Button */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 border border-rose-900/20 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'bn' ? 'নিরাপদ প্রস্থান (লগআউট)' : 'Sign Out / Lock'}</span>
                </button>
              </div>

              {/* Drawer Footer Credit */}
              <div className="px-5 py-3 border-t border-slate-800 text-[9px] text-slate-500 font-mono tracking-wider text-center">
                {t.appName.toUpperCase()} v1.2.0
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Right Main Layout */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              {lang === 'bn' ? 'মেস:' : 'Mess:'}
            </span>
            <span className="text-xs md:text-sm font-semibold text-slate-800 bg-slate-100 px-2 md:px-2.5 py-1 rounded-xl truncate max-w-[120px] sm:max-w-none">
              {currentMess?.name}
            </span>
          </div>

          {/* Language Switcher, Date and Persona Selector */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Selection Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setLang('bn')}
                className={`px-2 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-mono">Jul 2, 2026</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-600 animate-pulse" />
              <span className="text-slate-500 uppercase tracking-wider hidden md:inline">{t.persona}:</span>
              <span className="text-slate-800 bg-emerald-50 text-emerald-800 px-2 md:px-2.5 py-1 rounded-xl truncate max-w-[100px] sm:max-w-none">
                {activeSimUser ? activeSimUser.name : t.masterConsole}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Main Content Router */}
          {activeTab === 'dashboard' && (
            <AnalyticsDashboard 
              summary={summary} 
              currency={currency} 
              t={t} 
              members={members}
              meals={meals}
              expenses={expenses}
              deposits={deposits}
              currentMessId={currentMessId}
              historyLogs={historyLogs}
              lang={lang}
            />
          )}

          {activeTab === 'members' && (
            <MemberSection 
              currentMessId={currentMessId}
              members={members}
              onAddMember={handleAddMember}
              onToggleMemberStatus={handleToggleMemberStatus}
              onUpdateMemberRole={handleUpdateMemberRole}
              activeSimUserId={activeSimUserId}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'meals' && (
            <MealManager 
              currentMessId={currentMessId}
              members={members}
              meals={meals}
              currency={currency}
              onUpdateMeals={handleUpdateMeals}
              t={t}
              hasEditPermission={hasEditPermission}
              lang={lang}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTracker 
              currentMessId={currentMessId}
              members={members}
              expenses={expenses}
              currency={currency}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              t={t}
              hasEditPermission={hasEditPermission}
              lang={lang}
            />
          )}

          {activeTab === 'deposits' && (
            <DepositLedger 
              currentMessId={currentMessId}
              members={members}
              deposits={deposits}
              currency={currency}
              onAddDeposit={handleAddDeposit}
              onDeleteDeposit={handleDeleteDeposit}
              t={t}
              hasEditPermission={hasEditPermission}
              lang={lang}
            />
          )}

          {activeTab === 'ai-co-pilot' && (
            <AIAssistant 
              currentMessName={currentMess?.name || ''}
              summary={summary}
              members={members.filter(m => m.messId === currentMessId)}
              expenses={expenses.filter(e => e.messId === currentMessId)}
              deposits={deposits.filter(d => d.messId === currentMessId)}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'tenant-setup' && (
            <MessSelector 
              messes={messes}
              currentMessId={currentMessId}
              members={members}
              onSelectMess={setCurrentMessId}
              onCreateMess={handleCreateMess}
              onAddMember={handleAddMember}
              onToggleMemberStatus={handleToggleMemberStatus}
              onUpdateMemberRole={handleUpdateMemberRole}
              activeSimUserId={activeSimUserId}
              onSelectSimUser={setActiveSimUserId}
              t={t}
            />
          )}
        </div>
      </main>

      {/* 5-Second Confirmation Countdown Overlay Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              id="confirm-modal-backdrop"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10"
              id="confirm-modal-box"
            >
              {/* Header Indicator */}
              <div className="bg-indigo-950/40 p-4 border-b border-slate-800/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{lang === 'bn' ? 'নিরাপত্তা কনফার্মেশন' : 'SECURITY CONFIRMATION'}</h3>
                  <h2 className="text-xs font-bold text-slate-100">{confirmModal.title}</h2>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{confirmModal.message}</p>
                
                {/* 5s Countdown Visual Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                    <span>{lang === 'bn' ? 'অটো-বাতিল কাউন্টডাউন' : 'Auto-Dismiss Timer'}</span>
                    <span className="text-indigo-400 font-bold">{confirmModal.countdown}s</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      style={{ width: `${(confirmModal.countdown / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  id="confirm-btn-no"
                >
                  {lang === 'bn' ? 'না, বাতিল (No)' : 'No, Cancel'}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="cursor-pointer px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]"
                  id="confirm-btn-yes"
                >
                  {lang === 'bn' ? 'হ্যাঁ, নিশ্চিত (Yes)' : 'Yes, Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
