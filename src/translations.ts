export interface LanguageStrings {
  appName: string;
  tagline: string;
  activeTenant: string;
  persona: string;
  masterConsole: string;
  kpiAnalytics: string;
  mealsLedger: string;
  billsAndGroceries: string;
  memberDeposits: string;
  aiCopilot: string;
  tenantWorkspace: string;
  mealRate: string;
  mealsRateSubtitle: string;
  totalMeals: string;
  activeMealsSubtitle: string;
  groceryBazaar: string;
  bazaarSubtitle: string;
  overheadsSubtitle: string;
  overheadsTitle: string;
  costBreakdowns: string;
  totalSpent: string;
  memberNetBalances: string;
  surplusLegend: string;
  deficitLegend: string;
  balanceSheetTitle: string;
  activeMembersCount: string;
  member: string;
  mealsCost: string;
  fixedCostSplit: string;
  totalCharge: string;
  paidDeposited: string;
  netBalance: string;
  smartSettlements: string;
  settlementsSubtitle: string;
  allSettled: string;
  allSettledSubtitle: string;
  recommendedTransfers: string;
  debtorLabel: string;
  creditorLabel: string;
  transferLabel: string;
  dailyMealLedger: string;
  mealLedgerSubtitle: string;
  previousDay: string;
  nextDay: string;
  quickPresets: string;
  fullPreset: string;
  ldPreset: string;
  skipPreset: string;
  savedNotice: string;
  saveDailyLedger: string;
  communalExpenses: string;
  expensesSubtitle: string;
  logNewExpense: string;
  closeInvoiceEntry: string;
  enterSharedBill: string;
  description: string;
  amount: string;
  paidBy: string;
  category: string;
  billingDate: string;
  bazaarToggleTitle: string;
  bazaarToggleDesc: string;
  cancel: string;
  postExpense: string;
  filters: string;
  allCategories: string;
  groceriesCat: string;
  utilitiesCat: string;
  rentCat: string;
  cookCat: string;
  othersCat: string;
  bazaarFixedFilter: string;
  bazaarOnlyFilter: string;
  fixedOnlyFilter: string;
  noExpensesMatch: string;
  noExpensesSubtitle: string;
  expenseDetails: string;
  costDistribution: string;
  action: string;
  memberDepositsTitle: string;
  depositsSubtitle: string;
  logDeposit: string;
  closeDepositForm: string;
  totalCashDeposited: string;
  cumulativeCashInflow: string;
  activeDepositors: string;
  activeDepositorsSubtitle: string;
  averageDeposit: string;
  averageDepositSubtitle: string;
  enterDepositTransaction: string;
  notesRef: string;
  postCashDeposit: string;
  depositLedgerEntries: string;
  noDepositsLogged: string;
  formerInactive: string;
  aiHeaderSubtitle: string;
  aiTitle: string;
  aiDesc: string;
  optimizeBazaar: string;
  optimizeBazaarPrompt: string;
  costReduction: string;
  costReductionPrompt: string;
  auditCounsel: string;
  auditCounselPrompt: string;
  askAnything: string;
  aiReportGenerated: string;
  clearReport: string;
  compilingRecords: string;
  analyzingMeals: string;
  createNewWorkspace: string;
  workspaceSwitcher: string;
  workspaceDesc: string;
  createNewMessTitle: string;
  messOrgName: string;
  currencySymbol: string;
  messManagerName: string;
  adminEmail: string;
  provisionMess: string;
  membersDirectory: string;
  inviteMember: string;
  inviteActiveMember: string;
  fullName: string;
  emailAddress: string;
  messMemberRole: string;
  messManagerRole: string;
  messAdminRole: string;
  toggleStatusTitle: string;
  saveButtonText: string;
}

export const translations: Record<'en' | 'bn', LanguageStrings> = {
  en: {
    appName: "MessAdmin",
    tagline: "SaaS accounting for messes",
    activeTenant: "Active Tenant",
    persona: "Persona",
    masterConsole: "Master Console (All)",
    kpiAnalytics: "KPI Analytics",
    mealsLedger: "Meals Ledger",
    billsAndGroceries: "Bills & Groceries",
    memberDeposits: "Member Deposits",
    aiCopilot: "AI Co-pilot",
    tenantWorkspace: "Tenant Workspace",
    mealRate: "Meal Rate",
    mealsRateSubtitle: "/meal (Bazaar / Meals)",
    totalMeals: "Total Meals",
    activeMealsSubtitle: "Logged active meals",
    groceryBazaar: "Grocery Bazar",
    bazaarSubtitle: "Contributes to the meal rate",
    overheadsSubtitle: "Split equally among members",
    overheadsTitle: "Overheads & Utilities",
    costBreakdowns: "Cost Breakdowns",
    totalSpent: "Total Spent",
    memberNetBalances: "Member Net Balances",
    surplusLegend: "Surplus / Creditor (Receives Money)",
    deficitLegend: "Deficit / Debtor (Owes Money)",
    balanceSheetTitle: "Personal Member Balance Sheet",
    activeMembersCount: "Active Members",
    member: "Member",
    mealsCost: "Meals Cost",
    fixedCostSplit: "Fixed Cost Split",
    totalCharge: "Total Charge",
    paidDeposited: "Paid / Deposited",
    netBalance: "Net Balance",
    smartSettlements: "Smart Debt Settlement Paths",
    settlementsSubtitle: "Optimized peer-to-peer transfers to clear all dues in minimum transactions",
    allSettled: "All Accounts Settled!",
    allSettledSubtitle: "Balances perfectly align. No transactions needed.",
    recommendedTransfers: "Recommended Transfers:",
    debtorLabel: "Debtor (Gives)",
    creditorLabel: "Creditor (Gets)",
    transferLabel: "Transfer",
    dailyMealLedger: "Daily Meal Ledger",
    mealLedgerSubtitle: "Toggle and log breakfast, lunch, and dinner counts",
    previousDay: "Previous Day",
    nextDay: "Next Day",
    quickPresets: "Quick Presets",
    fullPreset: "Full (3)",
    ldPreset: "L+D (2)",
    skipPreset: "Skip (0)",
    savedNotice: "Ledger Saved Locally!",
    saveDailyLedger: "Save Daily Ledger",
    communalExpenses: "Communal Shared Expenses",
    expensesSubtitle: "Bazaar expenses impact the dynamic Meal Rate. Utilities, rent, and cook costs are shared equally as fixed splits.",
    logNewExpense: "Log New Expense",
    closeInvoiceEntry: "Close Invoice Entry",
    enterSharedBill: "Enter Shared Bill details",
    description: "Description",
    amount: "Amount",
    paidBy: "Paid By",
    category: "Category",
    billingDate: "Billing Date",
    bazaarToggleTitle: "Treat as Bazaar/Grocery expense",
    bazaarToggleDesc: "If selected, this directly contributes to the dynamic Meal Rate calculation. If unchecked, it splits equally among members.",
    cancel: "Cancel",
    postExpense: "Post Expense Record",
    filters: "Filters:",
    allCategories: "All Categories",
    groceriesCat: "Groceries / Bazaar",
    utilitiesCat: "Utilities & Bills",
    rentCat: "Flat Rent",
    cookCat: "Cook Salary",
    othersCat: "Others",
    bazaarFixedFilter: "Bazaar & Fixed Split",
    bazaarOnlyFilter: "Bazaar Only (Meal Rates)",
    fixedOnlyFilter: "Fixed Splits Only (Utilities/Rent)",
    noExpensesMatch: "No expenses match your filtering criteria.",
    noExpensesSubtitle: "Try changing categories or adding a new expense bill record.",
    expenseDetails: "Expense/Bill Details",
    costDistribution: "Cost Distribution",
    action: "Action",
    memberDepositsTitle: "Member Deposits Ledger",
    depositsSubtitle: "Track advanced payments made by members to fund daily operations and groceries.",
    logDeposit: "Log Member Deposit",
    closeDepositForm: "Close Deposit Form",
    totalCashDeposited: "Total Cash Deposited",
    cumulativeCashInflow: "Cumulative cash-inflow from direct deposits",
    activeDepositors: "Active Depositors",
    activeDepositorsSubtitle: "Members with logged active balances",
    averageDeposit: "Average Deposit",
    averageDepositSubtitle: "Per cash injection event",
    enterDepositTransaction: "Enter Deposit Transaction",
    notesRef: "Notes / Reference",
    postCashDeposit: "Post Cash Deposit",
    depositLedgerEntries: "Deposit Ledger Entries",
    noDepositsLogged: "No deposits logged for this mess yet.",
    formerInactive: "Former / Inactive",
    aiHeaderSubtitle: "Server-Side AI Co-pilot",
    aiTitle: "MessAdmin Intelligent Assistant",
    aiDesc: "Harnessing gemini-3.5-flash directly from the server. Ask about budget optimizations, check-in checklists, shopping lists, or debt audit reports.",
    optimizeBazaar: "Optimize Bazaar Shopping",
    optimizeBazaarPrompt: "Based on our total meal count and member roster, generate a weekly optimized shopping/grocery list and budget recommendation.",
    costReduction: "Cost-Reduction Strategies",
    costReductionPrompt: "Analyze our current expense categories and meal rates. Recommend 5 actionable cost-reduction strategies specifically for our mess setup.",
    auditCounsel: "Audit & Settling Counsel",
    auditCounselPrompt: "Review our settlements and member balance sheets. Is anyone contributing disproportionately? Give a smart financial overview and explain our settlement path simply.",
    askAnything: "Ask anything about your current mess statistics or custom budget planners...",
    aiReportGenerated: "AI REPORT GENERATED",
    clearReport: "Clear Report",
    compilingRecords: "Compiling Mess Records...",
    analyzingMeals: "Analyzing meals and bills for",
    createNewWorkspace: "Create New Mess",
    workspaceSwitcher: "Mess/Tenant Workspace",
    workspaceDesc: "MessAdmin supports dynamic multi-tenant credentials. Toggle members to experience personal cost metrics or post expenses as different personas.",
    createNewMessTitle: "Provision New Collaborative Mess",
    messOrgName: "Mess / Organization Name",
    currencySymbol: "Currency Symbol",
    messManagerName: "Mess Manager Name (Admin)",
    adminEmail: "Admin Email",
    provisionMess: "Provision Mess",
    membersDirectory: "Members Directory",
    inviteMember: "Invite Member",
    inviteActiveMember: "Invite Active Member",
    fullName: "Full Name",
    emailAddress: "Email Address",
    messMemberRole: "Mess Member",
    messManagerRole: "Mess Manager",
    messAdminRole: "Mess Admin",
    toggleStatusTitle: "Toggle Active Status (determines rent/cook division)",
    saveButtonText: "Save"
  },
  bn: {
    appName: "মেসঅ্যাডমিন",
    tagline: "মেসের হিসাব-নিকাশের আধুনিক প্ল্যাটফর্ম",
    activeTenant: "সক্রিয় মেস",
    persona: "ব্যবহারকারী",
    masterConsole: "মাস্টার এডমিন (সবাই)",
    kpiAnalytics: "ড্যাশবোর্ড ও বিশ্লেষণ",
    mealsLedger: "মিল খাতা",
    billsAndGroceries: "খরচ ও বাজার খাতা",
    memberDeposits: "টাকা জমা খাতা",
    aiCopilot: "এআই অ্যাসিস্ট্যান্ট",
    tenantWorkspace: "মেস সেটিংস",
    mealRate: "মিল রেট",
    mealsRateSubtitle: "/মিল (মোট বাজার / মোট মিল)",
    totalMeals: "মোট মিল",
    activeMealsSubtitle: "মেসের মোট মিলের সংখ্যা",
    groceryBazaar: "মোট বাজার খরচ",
    bazaarSubtitle: "এটি মিল রেটের অন্তর্ভুক্ত হয়",
    overheadsSubtitle: "সবার মাঝে সমান ভাগে ভাগ হয়",
    overheadsTitle: "অন্যান্য ও ইউটিলিটি খরচ",
    costBreakdowns: "খরচের অনুপাত",
    totalSpent: "মোট খরচ",
    memberNetBalances: "মেম্বারদের নিট ব্যালেন্স",
    surplusLegend: "পাওনাদার / ফেরত পাবে (+)",
    deficitLegend: "দেনাদার / দিতে হবে (-)",
    balanceSheetTitle: "মেম্বারদের ব্যক্তিগত হিসাব খাতা",
    activeMembersCount: "সক্রিয় মেম্বার",
    member: "মেম্বার",
    mealsCost: "মিল খরচ",
    fixedCostSplit: "স্থির খরচ ভাগ",
    totalCharge: "মোট খরচ দাবি",
    paidDeposited: "জমা / পরিশোধ",
    netBalance: "নিট হিসাব",
    smartSettlements: "সহজ ও স্মার্ট হিসাব নিকাশ",
    settlementsSubtitle: "কে কাকে কত টাকা দিবে তা সর্বনিম্ন লেনদেনের মাধ্যমে সমাধান করার স্মার্ট তালিকা",
    allSettled: "সব হিসাব একদম পরিষ্কার!",
    allSettledSubtitle: "সবার ব্যালেন্স সমান আছে। কোনো আদান-প্রদান করতে হবে না।",
    recommendedTransfers: "প্রস্তাবিত আদান-প্রদান:",
    debtorLabel: "দেনাদার (টাকা দেবে)",
    creditorLabel: "পাওনাদার (টাকা পাবে)",
    transferLabel: "লেনদেন পরিমাণ",
    dailyMealLedger: "দৈনিক মিল খাতা",
    mealLedgerSubtitle: "মেম্বারদের সকাল, দুপুর ও রাতের মিলের হিসাব রাখুন",
    previousDay: "আগের দিন",
    nextDay: "পরের দিন",
    quickPresets: "দ্রুত মিল সেট করুন",
    fullPreset: "সব (৩)",
    ldPreset: "দুপুর+রাত (২)",
    skipPreset: "বাদ (০)",
    savedNotice: "মিল খাতা সফলভাবে সেভ হয়েছে!",
    saveDailyLedger: "মিল খাতা সংরক্ষণ করুন",
    communalExpenses: "মেস খরচ ও বাজার হিসাব",
    expensesSubtitle: "বাজার খরচ মিল রেটের সাথে যোগ হবে। বাড়ি ভাড়া, ময়লা বিল, বুয়া ও গ্যাস বিল সবার মাঝে সমান ভাগে ভাগ হবে।",
    logNewExpense: "নতুন খরচ যোগ করুন",
    closeInvoiceEntry: "ফর্ম বন্ধ করুন",
    enterSharedBill: "খরচের বিস্তারিত বিবরণ লিখুন",
    description: "খরচের বিবরণ",
    amount: "টাকার পরিমাণ",
    paidBy: "কে পরিশোধ করেছেন",
    category: "ক্যাটাগরি",
    billingDate: "খরচের তারিখ",
    bazaarToggleTitle: "এটি মেস বাজার (গ্রোসারি) খরচ হিসেবে ধরুন",
    bazaarToggleDesc: "টিক চিহ্ন দিলে এই খরচটি মিল রেট বাড়াবে। টিক চিহ্ন না দিলে এটি স্থির খরচ হিসেবে সবার মাঝে সমান ভাগে ভাগ হবে।",
    cancel: "বাতিল করুন",
    postExpense: "খরচ জমা দিন",
    filters: "ফিল্টার করুন:",
    allCategories: "সব ক্যাটাগরি",
    groceriesCat: "বাজার / গ্রোসারি",
    utilitiesCat: "কারেন্ট/পানি/গ্যাস বিল",
    rentCat: "ফ্ল্যাট / রুম ভাড়া",
    cookCat: "বুয়া / খালার বেতন",
    othersCat: "অন্যান্য",
    bazaarFixedFilter: "বাজার ও স্থির খরচ একসাথে",
    bazaarOnlyFilter: "শুধুমাত্র বাজার খরচ (মিল রেট)",
    fixedOnlyFilter: "শুধুমাত্র স্থির খরচ (ভাড়া/বিল)",
    noExpensesMatch: "এই ক্যাটাগরিতে কোনো খরচ পাওয়া যায়নি।",
    noExpensesSubtitle: "অনুগ্রহ করে ক্যাটাগরি পরিবর্তন করে দেখুন অথবা নতুন খরচ এন্ট্রি করুন।",
    expenseDetails: "খরচ ও বিলের বিবরণ",
    costDistribution: "খরচের বন্টন",
    action: "অ্যাকশন",
    memberDepositsTitle: "মেম্বারদের টাকা জমার হিসাব",
    depositsSubtitle: "বাজার করা বা দৈনন্দিন মেস পরিচালনার জন্য মেম্বারদের অগ্রিম টাকা জমার খাতা।",
    logDeposit: "টাকা জমা রাখুন",
    closeDepositForm: "ফর্ম বন্ধ করুন",
    totalCashDeposited: "সর্বমোট জমা ফান্ড",
    cumulativeCashInflow: "মেম্বারদের কাছ থেকে সংগৃহীত মোট অগ্রিম টাকা",
    activeDepositors: "সক্রিয় জমাদানকারী",
    activeDepositorsSubtitle: "যেসব মেম্বার মেসের ফান্ডে টাকা দিয়েছেন",
    averageDeposit: "গড় জমা পরিমাণ",
    averageDepositSubtitle: "প্রতিটি ট্রানজেকশনে গড় জমার পরিমাণ",
    enterDepositTransaction: "মেম্বারদের টাকা জমার বিবরণ লিখুন",
    notesRef: "নোট / রেফারেন্স (যেমন- জুনের অগ্রিম, খালার বিল বাবদ)",
    postCashDeposit: "টাকা জমা নিশ্চিত করুন",
    depositLedgerEntries: "টাকা জমার বিস্তারিত তালিকা",
    noDepositsLogged: "এখনো কোনো টাকা জমার রেকর্ড নেই।",
    formerInactive: "সাবেক / নিষ্ক্রিয়",
    aiHeaderSubtitle: "এআই সহকারী কো-পাইলট",
    aiTitle: "মেসঅ্যাডমিন ইন্টেলিজেন্ট এআই",
    aiDesc: "সরাসরি সার্ভার থেকে gemini-3.5-flash ব্যবহার করে আপনার মেসের বাজার অপ্টিমাইজেশন, খাবার তালিকা, খরচ কমানোর উপায় এবং হিসাবের নিখুঁত বিশ্লেষণ করুন।",
    optimizeBazaar: "বাজার অপ্টিমাইজ করুন",
    optimizeBazaarPrompt: "আমাদের মোট মিল এবং মেম্বার সংখ্যা বিবেচনা করে সাপ্তাহিক বাজারের অপ্টিমাইজড তালিকা ও আনুমানিক বাজেট রেকমেন্ডেশন তৈরি করো।",
    costReduction: "খরচ কমানোর কৌশল",
    costReductionPrompt: "আমাদের বর্তমান খরচের ক্যাটাগরি এবং মিল রেট বিশ্লেষণ করে খরচ কমানোর জন্য ৫টি বাস্তবসম্মত উপায় সাজেস্ট করো।",
    auditCounsel: "মেস অডিট ও লেনদেন সমাধান",
    auditCounselPrompt: "আমাদের মেম্বারদের ব্যালেন্স শীট এবং লেনদেনের স্মার্ট পথটি সহজ বাংলায় বুঝিয়ে দাও। কার কন্ট্রিবিউশন কেমন তা বিশ্লেষণ করো।",
    askAnything: "আপনার মেসের মিল রেট, বাজার বা বাজেট নিয়ে যেকোনো প্রশ্ন বাংলায় অথবা ইংরেজিতে জিজ্ঞেস করুন...",
    aiReportGenerated: "এআই রিপোর্ট জেনারেট হয়েছে",
    clearReport: "রিপোর্ট মুছুন",
    compilingRecords: "মেসের হিসাব বিশ্লেষণ করা হচ্ছে...",
    analyzingMeals: "মিল ও খরচের হিসাব এআই দিয়ে মেলানো হচ্ছে",
    createNewWorkspace: "নতুন মেস তৈরি করুন",
    workspaceSwitcher: "মেস / ভাড়াটিয়া ফ্ল্যাট সেটিংস",
    workspaceDesc: "মেসঅ্যাডমিন মাল্টি-ট্যানেন্ট প্ল্যাটফর্ম সমর্থন করে। মেম্বারদের টগল করে তাদের ব্যক্তিগত খরচ বা মেম্বার হিসেবে ট্রানজেকশন করতে পারেন।",
    createNewMessTitle: "নতুন কোলাবোরেটিভ মেস হিসাব চালু করুন",
    messOrgName: "মেস / ফ্ল্যাটের নাম",
    currencySymbol: "কারেন্সি প্রতীক",
    messManagerName: "মেস ম্যানেজার / এডমিনের নাম",
    adminEmail: "এডমিন ইমেইল",
    provisionMess: "মেস হিসাব চালু করুন",
    membersDirectory: "মেম্বার ডিরেক্টরি (তালিকা)",
    inviteMember: "নতুন মেম্বার যুক্ত করুন",
    inviteActiveMember: "মেম্বার ইনভাইট করুন",
    fullName: "পুরো নাম",
    emailAddress: "ইমেইল অ্যাড্রেস",
    messMemberRole: "সাধারণ মেম্বার",
    messManagerRole: "মেস ম্যানেজার (ব্যবস্থাপক)",
    messAdminRole: "মেস এডমিন",
    toggleStatusTitle: "সক্রিয়/নিষ্ক্রিয় টগল করুন (এটি ঘরভাড়া ও অন্যান্য স্থির খরচের ভাগ নির্ধারণ করে)",
    saveButtonText: "সংরক্ষণ করুন"
  }
};
