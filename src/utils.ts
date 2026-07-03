import { Member, MealRecord, Expense, Deposit, CalculatedSummary, MemberCalculation, Settlement } from './types';

export function calculateMessSummary(
  messId: string,
  allMembers: Member[],
  allMeals: MealRecord[],
  allExpenses: Expense[],
  allDeposits: Deposit[]
): CalculatedSummary {
  // 1. Filter entities for this specific mess
  const activeMembers = allMembers.filter(m => m.messId === messId && m.status === 'active');
  const activeMemberIds = new Set(activeMembers.map(m => m.id));

  const meals = allMeals.filter(m => m.messId === messId && activeMemberIds.has(m.memberId));
  const expenses = allExpenses.filter(e => e.messId === messId);
  const deposits = allDeposits.filter(d => d.messId === messId && activeMemberIds.has(d.memberId));

  // 2. Sum meals per member
  const memberMealsMap: Record<string, number> = {};
  activeMembers.forEach(m => {
    memberMealsMap[m.id] = 0;
  });

  meals.forEach(m => {
    const totalDayMeals = (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0);
    if (memberMealsMap[m.memberId] !== undefined) {
      memberMealsMap[m.memberId] += totalDayMeals;
    }
  });

  const totalMeals = Object.values(memberMealsMap).reduce((sum, val) => sum + val, 0);

  // 3. Sum expenses (Bazaar vs Fixed)
  let totalBazaarExpense = 0;
  let totalFixedExpense = 0;
  const memberPaidExpensesMap: Record<string, number> = {};
  activeMembers.forEach(m => {
    memberPaidExpensesMap[m.id] = 0;
  });

  expenses.forEach(e => {
    if (e.isBazaar) {
      totalBazaarExpense += e.amount;
    } else {
      totalFixedExpense += e.amount;
    }
    
    // Track who paid for it (if they are an active member)
    if (memberPaidExpensesMap[e.paidById] !== undefined) {
      memberPaidExpensesMap[e.paidById] += e.amount;
    }
  });

  const totalExpense = totalBazaarExpense + totalFixedExpense;

  // 4. Calculate meal rate
  const mealRate = totalMeals > 0 ? totalBazaarExpense / totalMeals : 0;

  // 5. Sum deposits per member
  const memberDepositsMap: Record<string, number> = {};
  activeMembers.forEach(m => {
    memberDepositsMap[m.id] = 0;
  });

  deposits.forEach(d => {
    if (memberDepositsMap[d.memberId] !== undefined) {
      memberDepositsMap[d.memberId] += d.amount;
    }
  });

  // 6. Build individual member summaries
  const memberSummaries: Record<string, MemberCalculation> = {};
  const activeCount = activeMembers.length;
  const fixedCostShare = activeCount > 0 ? totalFixedExpense / activeCount : 0;

  activeMembers.forEach(m => {
    const memberTotalMeals = memberMealsMap[m.id] || 0;
    const mealsCost = memberTotalMeals * mealRate;
    const totalCost = mealsCost + fixedCostShare;

    // Total financial contribution of member = Money they deposited + Expenses they paid directly
    const directDeposited = memberDepositsMap[m.id] || 0;
    const expensesPaid = memberPaidExpensesMap[m.id] || 0;
    const totalDeposit = directDeposited + expensesPaid;

    const balance = totalDeposit - totalCost;

    memberSummaries[m.id] = {
      memberId: m.id,
      memberName: m.name,
      totalMeals: memberTotalMeals,
      mealsCost,
      fixedCostShare,
      totalCost,
      totalDeposit,
      balance,
    };
  });

  // 7. Settlement calculation (Debt clearing)
  const settlements: Settlement[] = [];
  
  // Create arrays of debtors (balance < 0) and creditors (balance > 0)
  const debtors = Object.values(memberSummaries)
    .filter(m => m.balance < -0.01)
    .map(m => ({ id: m.memberId, name: m.memberName, balance: m.balance }))
    .sort((a, b) => a.balance - b.balance); // Most negative first

  const creditors = Object.values(memberSummaries)
    .filter(m => m.balance > 0.01)
    .map(m => ({ id: m.memberId, name: m.memberName, balance: m.balance }))
    .sort((a, b) => b.balance - a.balance); // Most positive first

  let debtorIndex = 0;
  let creditorIndex = 0;

  // Make deep copies so we can mutate balances as we settle
  const dList = debtors.map(d => ({ ...d }));
  const cList = creditors.map(c => ({ ...c }));

  while (debtorIndex < dList.length && creditorIndex < cList.length) {
    const debtor = dList[debtorIndex];
    const creditor = cList[creditorIndex];

    const oweAmount = Math.abs(debtor.balance);
    const receiveAmount = creditor.balance;

    const settleAmount = Math.min(oweAmount, receiveAmount);

    if (settleAmount > 0.01) {
      settlements.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount: Number(settleAmount.toFixed(2)),
      });
    }

    // Update balances
    debtor.balance += settleAmount;
    creditor.balance -= settleAmount;

    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
  }

  return {
    totalMeals,
    totalBazaarExpense,
    totalFixedExpense,
    totalExpense,
    mealRate,
    memberSummaries,
    settlements,
  };
}
