export interface Mess {
  id: string;
  name: string;
  currency: string;
  createdDate: string;
}

export interface Member {
  id: string;
  messId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'inactive';
}

export interface MealRecord {
  id: string; // Unique combination of date + memberId
  memberId: string;
  messId: string;
  date: string; // YYYY-MM-DD
  breakfast: number; // e.g. 0, 0.5, 1, 1.5, 2
  lunch: number;
  dinner: number;
}

export interface Expense {
  id: string;
  messId: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paidById: string; // Member who paid
  category: 'groceries' | 'utilities' | 'rent' | 'cook' | 'others';
  isBazaar: boolean; // true = goes into Bazaar Cost (impacts meal rate), false = fixed cost (split equally)
}

export interface Deposit {
  id: string;
  messId: string;
  memberId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface Settlement {
  from: string; // debtor memberId
  fromName: string;
  to: string; // creditor memberId
  toName: string;
  amount: number;
}

export interface CalculatedSummary {
  totalMeals: number;
  totalBazaarExpense: number;
  totalFixedExpense: number;
  totalExpense: number;
  mealRate: number;
  memberSummaries: Record<string, MemberCalculation>;
  settlements: Settlement[];
}

export interface MemberCalculation {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealsCost: number; // totalMeals * mealRate
  fixedCostShare: number; // totalFixedExpense / activeMembersCount
  totalCost: number; // mealsCost + fixedCostShare
  totalDeposit: number;
  balance: number; // totalDeposit - totalCost (positive = surplus, negative = deficit)
}

export interface HistoryLog {
  id: string;
  messId: string;
  timestamp: string; // ISO string format
  userId: string | null;
  userName: string;
  userRole?: string;
  actionBn: string;
  actionEn: string;
  details?: string;
}

