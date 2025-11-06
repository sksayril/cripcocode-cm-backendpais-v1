const IncomeExpense = require('../models/IncomeExpense');
const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');
const ResponseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

// Income & Expense Management
const addIncome = asyncHandler(async (req, res) => {
  const {
    date,
    amount,
    category,
    subcategory,
    description,
    account,
    reference,
    paymentMethod,
    tags,
    isRecurring,
    recurringPattern,
    recurringEndDate
  } = req.body;

  // Validate required fields
  if (!date || !amount || !category || !description || !account) {
    return ResponseHelper.badRequest(res, 'Missing required fields: date, amount, category, description, account');
  }

  // Check if account exists and belongs to company
  const accountExists = await Ledger.findOne({
    _id: account,
    company: req.user.company,
    isActive: true,
    isDeleted: false
  });

  if (!accountExists) {
    return ResponseHelper.notFound(res, 'Account not found or not accessible');
  }

  const incomeData = {
    type: 'income',
    date: new Date(date),
    amount: parseFloat(amount),
    category,
    subcategory,
    description,
    account,
    reference,
    paymentMethod: paymentMethod || 'cash',
    tags: tags || [],
    isRecurring: isRecurring || false,
    recurringPattern,
    recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
    company: req.user.company,
    createdBy: req.user.id
  };

  const income = new IncomeExpense(incomeData);
  await income.save();

  // Populate related fields
  await income.populate([
    { path: 'account', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  return ResponseHelper.created(res, income, 'Income added successfully');
});

const addExpense = asyncHandler(async (req, res) => {
  const {
    date,
    amount,
    category,
    subcategory,
    description,
    account,
    reference,
    paymentMethod,
    tags,
    isRecurring,
    recurringPattern,
    recurringEndDate
  } = req.body;

  // Validate required fields
  if (!date || !amount || !category || !description || !account) {
    return ResponseHelper.badRequest(res, 'Missing required fields: date, amount, category, description, account');
  }

  // Check if account exists and belongs to company
  const accountExists = await Ledger.findOne({
    _id: account,
    company: req.user.company,
    isActive: true,
    isDeleted: false
  });

  if (!accountExists) {
    return ResponseHelper.notFound(res, 'Account not found or not accessible');
  }

  const expenseData = {
    type: 'expense',
    date: new Date(date),
    amount: parseFloat(amount),
    category,
    subcategory,
    description,
    account,
    reference,
    paymentMethod: paymentMethod || 'cash',
    tags: tags || [],
    isRecurring: isRecurring || false,
    recurringPattern,
    recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
    company: req.user.company,
    createdBy: req.user.id
  };

  const expense = new IncomeExpense(expenseData);
  await expense.save();

  // Populate related fields
  await expense.populate([
    { path: 'account', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  return ResponseHelper.created(res, expense, 'Expense added successfully');
});

const getAllEntries = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    status,
    from,
    to,
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {
    company: req.user.company,
    isDeleted: false
  };

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = new RegExp(category, 'i');
  }

  if (status) {
    query.status = status;
  }

  if (from && to) {
    query.date = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: [
      { path: 'account', select: 'name code type' },
      { path: 'createdBy', select: 'username fullname' },
      { path: 'approvedBy', select: 'username fullname' }
    ]
  };

  const result = await IncomeExpense.paginate(query, options);

  return ResponseHelper.paginated(res, result.docs, {
    currentPage: result.page,
    totalPages: result.totalPages,
    totalEntries: result.totalDocs,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    limit: result.limit
  }, 'Entries retrieved successfully');
});

const getEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await IncomeExpense.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  }).populate([
    { path: 'account', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' },
    { path: 'approvedBy', select: 'username fullname' }
  ]);

  if (!entry) {
    return ResponseHelper.notFound(res, 'Entry not found');
  }

  return ResponseHelper.success(res, entry, 'Entry retrieved successfully');
});

const updateEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const entry = await IncomeExpense.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!entry) {
    return ResponseHelper.notFound(res, 'Entry not found');
  }

  // Check if account exists and belongs to company
  if (updateData.account) {
    const accountExists = await Ledger.findOne({
      _id: updateData.account,
      company: req.user.company,
      isActive: true,
      isDeleted: false
    });

    if (!accountExists) {
      return ResponseHelper.notFound(res, 'Account not found or not accessible');
    }
  }

  // Update entry
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      entry[key] = updateData[key];
    }
  });

  entry.updatedBy = req.user.id;
  await entry.save();

  // Populate related fields
  await entry.populate([
    { path: 'account', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' },
    { path: 'updatedBy', select: 'username fullname' }
  ]);

  return ResponseHelper.updated(res, entry, 'Entry updated successfully');
});

const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await IncomeExpense.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!entry) {
    return ResponseHelper.notFound(res, 'Entry not found');
  }

  await entry.softDelete(req.user.id);

  return ResponseHelper.deleted(res, 'Entry deleted successfully');
});

const approveEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await IncomeExpense.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!entry) {
    return ResponseHelper.notFound(res, 'Entry not found');
  }

  await entry.approve(req.user.id);

  return ResponseHelper.success(res, entry, 'Entry approved successfully');
});

const rejectEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const entry = await IncomeExpense.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!entry) {
    return ResponseHelper.notFound(res, 'Entry not found');
  }

  await entry.reject(req.user.id, reason);

  return ResponseHelper.success(res, entry, 'Entry rejected successfully');
});

// Ledger Account Management
const createLedgerAccount = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    type,
    subType,
    openingBalance,
    currency,
    description,
    parentAccount
  } = req.body;

  // Validate required fields
  if (!name || !code || !type) {
    return ResponseHelper.badRequest(res, 'Missing required fields: name, code, type');
  }

  // Check if code already exists
  const existingCode = await Ledger.findOne({
    code,
    company: req.user.company,
    isDeleted: false
  });

  if (existingCode) {
    return ResponseHelper.conflict(res, 'Account code already exists');
  }

  // Check parent account if provided
  if (parentAccount) {
    const parentExists = await Ledger.findOne({
      _id: parentAccount,
      company: req.user.company,
      isActive: true,
      isDeleted: false
    });

    if (!parentExists) {
      return ResponseHelper.notFound(res, 'Parent account not found');
    }
  }

  const ledgerData = {
    name,
    code,
    type,
    subType,
    openingBalance: parseFloat(openingBalance) || 0,
    currentBalance: parseFloat(openingBalance) || 0,
    currency: currency || 'USD',
    description,
    parentAccount,
    company: req.user.company,
    createdBy: req.user.id
  };

  const ledger = new Ledger(ledgerData);
  await ledger.save();

  // Populate related fields
  await ledger.populate([
    { path: 'parentAccount', select: 'name code' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  return ResponseHelper.created(res, ledger, 'Ledger account created successfully');
});

const getAllLedgerAccounts = asyncHandler(async (req, res) => {
  const {
    type,
    isActive,
    page = 1,
    limit = 10,
    sortBy = 'code',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  const query = {
    company: req.user.company,
    isDeleted: false
  };

  if (type) {
    query.type = type;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: [
      { path: 'parentAccount', select: 'name code' },
      { path: 'createdBy', select: 'username fullname' }
    ]
  };

  const result = await Ledger.paginate(query, options);

  return ResponseHelper.paginated(res, result.docs, {
    currentPage: result.page,
    totalPages: result.totalPages,
    totalAccounts: result.totalDocs,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    limit: result.limit
  }, 'Ledger accounts retrieved successfully');
});

const getLedgerAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const account = await Ledger.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  }).populate([
    { path: 'parentAccount', select: 'name code' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  if (!account) {
    return ResponseHelper.notFound(res, 'Account not found');
  }

  return ResponseHelper.success(res, account, 'Account retrieved successfully');
});

const updateLedgerAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const account = await Ledger.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!account) {
    return ResponseHelper.notFound(res, 'Account not found');
  }

  // Check if code already exists (excluding current account)
  if (updateData.code && updateData.code !== account.code) {
    const existingCode = await Ledger.findOne({
      code: updateData.code,
      company: req.user.company,
      isDeleted: false,
      _id: { $ne: id }
    });

    if (existingCode) {
      return ResponseHelper.conflict(res, 'Account code already exists');
    }
  }

  // Update account
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      account[key] = updateData[key];
    }
  });

  account.updatedBy = req.user.id;
  await account.save();

  // Populate related fields
  await account.populate([
    { path: 'parentAccount', select: 'name code' },
    { path: 'createdBy', select: 'username fullname' },
    { path: 'updatedBy', select: 'username fullname' }
  ]);

  return ResponseHelper.updated(res, account, 'Account updated successfully');
});

const deleteLedgerAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const account = await Ledger.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!account) {
    return ResponseHelper.notFound(res, 'Account not found');
  }

  // Check if account has transactions
  const hasTransactions = await Transaction.findOne({
    $or: [
      { fromAccount: id },
      { toAccount: id }
    ],
    isDeleted: false
  });

  if (hasTransactions) {
    return ResponseHelper.badRequest(res, 'Cannot delete account with existing transactions');
  }

  await account.softDelete(req.user.id);

  return ResponseHelper.deleted(res, 'Account deleted successfully');
});

// Transaction Management
const createTransaction = asyncHandler(async (req, res) => {
  const {
    fromAccount,
    toAccount,
    amount,
    date,
    description,
    reference,
    transactionType,
    currency,
    exchangeRate,
    tags
  } = req.body;

  // Validate required fields
  if (!fromAccount || !toAccount || !amount || !description) {
    return ResponseHelper.badRequest(res, 'Missing required fields: fromAccount, toAccount, amount, description');
  }

  // Check if accounts exist and belong to company
  const [fromAccountExists, toAccountExists] = await Promise.all([
    Ledger.findOne({
      _id: fromAccount,
      company: req.user.company,
      isActive: true,
      isDeleted: false
    }),
    Ledger.findOne({
      _id: toAccount,
      company: req.user.company,
      isActive: true,
      isDeleted: false
    })
  ]);

  if (!fromAccountExists) {
    return ResponseHelper.notFound(res, 'From account not found or not accessible');
  }

  if (!toAccountExists) {
    return ResponseHelper.notFound(res, 'To account not found or not accessible');
  }

  if (fromAccount === toAccount) {
    return ResponseHelper.badRequest(res, 'From account and to account cannot be the same');
  }

  const transactionData = {
    fromAccount,
    toAccount,
    amount: parseFloat(amount),
    date: date ? new Date(date) : new Date(),
    description,
    reference,
    transactionType: transactionType || 'transfer',
    currency: currency || 'USD',
    exchangeRate: parseFloat(exchangeRate) || 1,
    tags: tags || [],
    company: req.user.company,
    createdBy: req.user.id
  };

  const transaction = new Transaction(transactionData);
  await transaction.save();

  // Populate related fields
  await transaction.populate([
    { path: 'fromAccount', select: 'name code type' },
    { path: 'toAccount', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  return ResponseHelper.created(res, transaction, 'Transaction created successfully');
});

const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    fromAccount,
    toAccount,
    status,
    transactionType,
    from,
    to,
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {
    company: req.user.company,
    isDeleted: false
  };

  if (fromAccount) {
    query.fromAccount = fromAccount;
  }

  if (toAccount) {
    query.toAccount = toAccount;
  }

  if (status) {
    query.status = status;
  }

  if (transactionType) {
    query.transactionType = transactionType;
  }

  if (from && to) {
    query.date = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: [
      { path: 'fromAccount', select: 'name code type' },
      { path: 'toAccount', select: 'name code type' },
      { path: 'createdBy', select: 'username fullname' }
    ]
  };

  const result = await Transaction.paginate(query, options);

  return ResponseHelper.paginated(res, result.docs, {
    currentPage: result.page,
    totalPages: result.totalPages,
    totalTransactions: result.totalDocs,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    limit: result.limit
  }, 'Transactions retrieved successfully');
});

const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  }).populate([
    { path: 'fromAccount', select: 'name code type' },
    { path: 'toAccount', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' }
  ]);

  if (!transaction) {
    return ResponseHelper.notFound(res, 'Transaction not found');
  }

  return ResponseHelper.success(res, transaction, 'Transaction retrieved successfully');
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const transaction = await Transaction.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!transaction) {
    return ResponseHelper.notFound(res, 'Transaction not found');
  }

  // Check if accounts exist and belong to company
  if (updateData.fromAccount || updateData.toAccount) {
    const [fromAccountExists, toAccountExists] = await Promise.all([
      updateData.fromAccount ? Ledger.findOne({
        _id: updateData.fromAccount,
        company: req.user.company,
        isActive: true,
        isDeleted: false
      }) : true,
      updateData.toAccount ? Ledger.findOne({
        _id: updateData.toAccount,
        company: req.user.company,
        isActive: true,
        isDeleted: false
      }) : true
    ]);

    if (updateData.fromAccount && !fromAccountExists) {
      return ResponseHelper.notFound(res, 'From account not found or not accessible');
    }

    if (updateData.toAccount && !toAccountExists) {
      return ResponseHelper.notFound(res, 'To account not found or not accessible');
    }
  }

  // Update transaction
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      transaction[key] = updateData[key];
    }
  });

  transaction.updatedBy = req.user.id;
  await transaction.save();

  // Populate related fields
  await transaction.populate([
    { path: 'fromAccount', select: 'name code type' },
    { path: 'toAccount', select: 'name code type' },
    { path: 'createdBy', select: 'username fullname' },
    { path: 'updatedBy', select: 'username fullname' }
  ]);

  return ResponseHelper.updated(res, transaction, 'Transaction updated successfully');
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!transaction) {
    return ResponseHelper.notFound(res, 'Transaction not found');
  }

  await transaction.softDelete(req.user.id);

  return ResponseHelper.deleted(res, 'Transaction deleted successfully');
});

const reverseTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const transaction = await Transaction.findOne({
    _id: id,
    company: req.user.company,
    isDeleted: false
  });

  if (!transaction) {
    return ResponseHelper.notFound(res, 'Transaction not found');
  }

  if (transaction.status === 'reversed') {
    return ResponseHelper.badRequest(res, 'Transaction is already reversed');
  }

  await transaction.reverse(req.user.id, reason);

  return ResponseHelper.success(res, transaction, 'Transaction reversed successfully');
});

module.exports = {
  // Income & Expense Management
  addIncome,
  addExpense,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  approveEntry,
  rejectEntry,
  
  // Ledger Account Management
  createLedgerAccount,
  getAllLedgerAccounts,
  getLedgerAccountById,
  updateLedgerAccount,
  deleteLedgerAccount,
  
  // Transaction Management
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  reverseTransaction
};
