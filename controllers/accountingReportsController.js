const IncomeExpense = require('../models/IncomeExpense');
const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');
const ResponseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

// Profit & Loss Report
const getProfitLossReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return ResponseHelper.badRequest(res, 'From and to dates are required');
  }

  const startDate = new Date(from);
  const endDate = new Date(to);

  // Get revenue accounts
  const revenueAccounts = await Ledger.getByType(req.user.company, 'revenue');
  const revenueAccountIds = revenueAccounts.map(account => account._id);

  // Get expense accounts
  const expenseAccounts = await Ledger.getByType(req.user.company, 'expense');
  const expenseAccountIds = expenseAccounts.map(account => account._id);

  // Calculate total revenue
  const totalRevenue = await IncomeExpense.getTotalByType(
    req.user.company,
    'income',
    startDate,
    endDate
  );

  // Calculate total expenses
  const totalExpenses = await IncomeExpense.getTotalByType(
    req.user.company,
    'expense',
    startDate,
    endDate
  );

  // Calculate revenue by category
  const revenueByCategory = await IncomeExpense.getCategoryStats(
    req.user.company,
    'income',
    startDate,
    endDate
  );

  // Calculate expenses by category
  const expensesByCategory = await IncomeExpense.getCategoryStats(
    req.user.company,
    'expense',
    startDate,
    endDate
  );

  // Calculate net profit/loss
  const netProfit = totalRevenue - totalExpenses;

  // Calculate profit margin
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const report = {
    period: {
      from: startDate,
      to: endDate
    },
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2))
    },
    revenue: {
      total: totalRevenue,
      byCategory: revenueByCategory
    },
    expenses: {
      total: totalExpenses,
      byCategory: expensesByCategory
    },
    accounts: {
      revenue: revenueAccounts,
      expenses: expenseAccounts
    }
  };

  return ResponseHelper.success(res, report, 'Profit & Loss report generated successfully');
});

// Balance Sheet Report
const getBalanceSheetReport = asyncHandler(async (req, res) => {
  const { asOf } = req.query;
  const asOfDate = asOf ? new Date(asOf) : new Date();

  // Get all account types
  const { assets, liabilities, equity } = await Ledger.getBalanceSheetAccounts(req.user.company);

  // Calculate total assets
  const totalAssets = assets.reduce((sum, account) => sum + account.currentBalance, 0);

  // Calculate total liabilities
  const totalLiabilities = liabilities.reduce((sum, account) => sum + account.currentBalance, 0);

  // Calculate total equity
  const totalEquity = equity.reduce((sum, account) => sum + account.currentBalance, 0);

  // Calculate net worth
  const netWorth = totalAssets - totalLiabilities;

  // Group assets by subType
  const assetsByType = assets.reduce((groups, account) => {
    const type = account.subType || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  // Group liabilities by subType
  const liabilitiesByType = liabilities.reduce((groups, account) => {
    const type = account.subType || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  // Group equity by subType
  const equityByType = equity.reduce((groups, account) => {
    const type = account.subType || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  const report = {
    asOf: asOfDate,
    summary: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netWorth
    },
    assets: {
      total: totalAssets,
      byType: assetsByType,
      accounts: assets
    },
    liabilities: {
      total: totalLiabilities,
      byType: liabilitiesByType,
      accounts: liabilities
    },
    equity: {
      total: totalEquity,
      byType: equityByType,
      accounts: equity
    }
  };

  return ResponseHelper.success(res, report, 'Balance Sheet report generated successfully');
});

// Cash Flow Report
const getCashFlowReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return ResponseHelper.badRequest(res, 'From and to dates are required');
  }

  const startDate = new Date(from);
  const endDate = new Date(to);

  // Get cash accounts
  const cashAccounts = await Ledger.find({
    company: req.user.company,
    type: 'asset',
    subType: 'cash',
    isActive: true,
    isDeleted: false
  });

  const cashAccountIds = cashAccounts.map(account => account._id);

  // Calculate cash inflows
  const cashInflows = await IncomeExpense.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'income',
        account: { $in: cashAccountIds },
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Calculate cash outflows
  const cashOutflows = await IncomeExpense.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'expense',
        account: { $in: cashAccountIds },
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Calculate net cash flow
  const totalInflows = cashInflows.length > 0 ? cashInflows[0].total : 0;
  const totalOutflows = cashOutflows.length > 0 ? cashOutflows[0].total : 0;
  const netCashFlow = totalInflows - totalOutflows;

  // Get opening balance
  const openingBalance = cashAccounts.reduce((sum, account) => sum + account.currentBalance, 0);

  // Calculate closing balance
  const closingBalance = openingBalance + netCashFlow;

  // Get cash flow by category
  const inflowsByCategory = await IncomeExpense.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'income',
        account: { $in: cashAccountIds },
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const outflowsByCategory = await IncomeExpense.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'expense',
        account: { $in: cashAccountIds },
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const report = {
    period: {
      from: startDate,
      to: endDate
    },
    summary: {
      openingBalance,
      totalInflows,
      totalOutflows,
      netCashFlow,
      closingBalance
    },
    inflows: {
      total: totalInflows,
      byCategory: inflowsByCategory
    },
    outflows: {
      total: totalOutflows,
      byCategory: outflowsByCategory
    },
    cashAccounts: cashAccounts
  };

  return ResponseHelper.success(res, report, 'Cash Flow report generated successfully');
});

// Trial Balance Report
const getTrialBalanceReport = asyncHandler(async (req, res) => {
  const { asOf } = req.query;
  const asOfDate = asOf ? new Date(asOf) : new Date();

  // Get all active accounts
  const accounts = await Ledger.find({
    company: req.user.company,
    isActive: true,
    isDeleted: false
  }).sort({ code: 1 });

  // Calculate trial balance
  const trialBalance = accounts.map(account => {
    let debit = 0;
    let credit = 0;

    // Determine if account has debit or credit balance
    if (account.type === 'asset' || account.type === 'expense') {
      debit = account.currentBalance;
    } else {
      credit = account.currentBalance;
    }

    return {
      account: {
        id: account._id,
        name: account.name,
        code: account.code,
        type: account.type
      },
      debit,
      credit
    };
  });

  // Calculate totals
  const totalDebits = trialBalance.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = trialBalance.reduce((sum, item) => sum + item.credit, 0);

  const report = {
    asOf: asOfDate,
    trialBalance,
    totals: {
      totalDebits,
      totalCredits,
      isBalanced: totalDebits === totalCredits
    }
  };

  return ResponseHelper.success(res, report, 'Trial Balance report generated successfully');
});

// Account Statement
const getAccountStatement = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const { from, to, page = 1, limit = 10 } = req.query;

  if (!from || !to) {
    return ResponseHelper.badRequest(res, 'From and to dates are required');
  }

  const startDate = new Date(from);
  const endDate = new Date(to);

  // Check if account exists
  const account = await Ledger.findOne({
    _id: accountId,
    company: req.user.company,
    isDeleted: false
  });

  if (!account) {
    return ResponseHelper.notFound(res, 'Account not found');
  }

  // Get transactions for this account
  const transactions = await Transaction.getByAccount(
    req.user.company,
    accountId,
    page,
    limit
  );

  // Get income/expense entries for this account
  const entries = await IncomeExpense.paginate({
    company: req.user.company,
    account: accountId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false
  }, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'createdBy', select: 'username fullname' }
    ]
  });

  // Calculate account balance
  const openingBalance = account.currentBalance;

  const report = {
    account: {
      id: account._id,
      name: account.name,
      code: account.code,
      type: account.type
    },
    period: {
      from: startDate,
      to: endDate
    },
    openingBalance,
    transactions: transactions.docs,
    entries: entries.docs,
    pagination: {
      currentPage: transactions.page,
      totalPages: transactions.totalPages,
      totalTransactions: transactions.totalDocs,
      hasNextPage: transactions.hasNextPage,
      hasPrevPage: transactions.hasPrevPage,
      limit: transactions.limit
    }
  };

  return ResponseHelper.success(res, report, 'Account statement generated successfully');
});

// Financial Summary Dashboard
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // Default to last 30 days
  const days = parseInt(period);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get total revenue for the period
  const totalRevenue = await IncomeExpense.getTotalByType(
    req.user.company,
    'income',
    startDate,
    endDate
  );

  // Get total expenses for the period
  const totalExpenses = await IncomeExpense.getTotalByType(
    req.user.company,
    'expense',
    startDate,
    endDate
  );

  // Get total assets
  const totalAssets = await Ledger.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'asset',
        isActive: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$currentBalance' }
      }
    }
  ]);

  // Get total liabilities
  const totalLiabilities = await Ledger.aggregate([
    {
      $match: {
        company: req.user.company,
        type: 'liability',
        isActive: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$currentBalance' }
      }
    }
  ]);

  // Get recent transactions
  const recentTransactions = await Transaction.find({
    company: req.user.company,
    isDeleted: false
  })
    .sort({ date: -1 })
    .limit(5)
    .populate([
      { path: 'fromAccount', select: 'name code' },
      { path: 'toAccount', select: 'name code' }
    ]);

  // Get pending approvals
  const pendingApprovals = await IncomeExpense.countDocuments({
    company: req.user.company,
    status: 'pending',
    isDeleted: false
  });

  const summary = {
    period: {
      from: startDate,
      to: endDate,
      days
    },
    financials: {
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalAssets: totalAssets.length > 0 ? totalAssets[0].total : 0,
      totalLiabilities: totalLiabilities.length > 0 ? totalLiabilities[0].total : 0
    },
    recentTransactions,
    pendingApprovals
  };

  return ResponseHelper.success(res, summary, 'Financial summary generated successfully');
});

module.exports = {
  getProfitLossReport,
  getBalanceSheetReport,
  getCashFlowReport,
  getTrialBalanceReport,
  getAccountStatement,
  getFinancialSummary
};
