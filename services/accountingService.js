const IncomeExpense = require('../models/IncomeExpense');
const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');

class AccountingService {
  // Income & Expense Management
  static async createIncomeExpense(data, companyId, userId) {
    try {
      // Validate account exists and belongs to company
      const account = await Ledger.findOne({
        _id: data.account,
        company: companyId,
        isActive: true,
        isDeleted: false
      });

      if (!account) {
        throw new Error('Account not found or not accessible');
      }

      const entryData = {
        ...data,
        company: companyId,
        createdBy: userId
      };

      const entry = new IncomeExpense(entryData);
      await entry.save();

      // Update account balance
      if (data.type === 'income') {
        await account.updateBalance(data.amount, 'add');
      } else {
        await account.updateBalance(data.amount, 'subtract');
      }

      return entry;
    } catch (error) {
      throw error;
    }
  }

  static async updateIncomeExpense(entryId, updateData, companyId, userId) {
    try {
      const entry = await IncomeExpense.findOne({
        _id: entryId,
        company: companyId,
        isDeleted: false
      });

      if (!entry) {
        throw new Error('Entry not found');
      }

      // Store old values for balance adjustment
      const oldAmount = entry.amount;
      const oldType = entry.type;

      // Update entry
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          entry[key] = updateData[key];
        }
      });

      entry.updatedBy = userId;
      await entry.save();

      // Adjust account balances if amount or type changed
      if (updateData.amount !== undefined || updateData.type !== undefined) {
        const account = await Ledger.findById(entry.account);
        if (account) {
          // Reverse old balance
          if (oldType === 'income') {
            await account.updateBalance(oldAmount, 'subtract');
          } else {
            await account.updateBalance(oldAmount, 'add');
          }

          // Apply new balance
          if (entry.type === 'income') {
            await account.updateBalance(entry.amount, 'add');
          } else {
            await account.updateBalance(entry.amount, 'subtract');
          }
        }
      }

      return entry;
    } catch (error) {
      throw error;
    }
  }

  static async deleteIncomeExpense(entryId, companyId, userId) {
    try {
      const entry = await IncomeExpense.findOne({
        _id: entryId,
        company: companyId,
        isDeleted: false
      });

      if (!entry) {
        throw new Error('Entry not found');
      }

      // Reverse account balance
      const account = await Ledger.findById(entry.account);
      if (account) {
        if (entry.type === 'income') {
          await account.updateBalance(entry.amount, 'subtract');
        } else {
          await account.updateBalance(entry.amount, 'add');
        }
      }

      await entry.softDelete(userId);
      return entry;
    } catch (error) {
      throw error;
    }
  }

  // Ledger Account Management
  static async createLedgerAccount(data, companyId, userId) {
    try {
      // Check if code already exists
      const existingCode = await Ledger.findOne({
        code: data.code,
        company: companyId,
        isDeleted: false
      });

      if (existingCode) {
        throw new Error('Account code already exists');
      }

      // Check parent account if provided
      if (data.parentAccount) {
        const parentExists = await Ledger.findOne({
          _id: data.parentAccount,
          company: companyId,
          isActive: true,
          isDeleted: false
        });

        if (!parentExists) {
          throw new Error('Parent account not found');
        }
      }

      const accountData = {
        ...data,
        company: companyId,
        createdBy: userId
      };

      const account = new Ledger(accountData);
      await account.save();

      return account;
    } catch (error) {
      throw error;
    }
  }

  static async updateLedgerAccount(accountId, updateData, companyId, userId) {
    try {
      const account = await Ledger.findOne({
        _id: accountId,
        company: companyId,
        isDeleted: false
      });

      if (!account) {
        throw new Error('Account not found');
      }

      // Check if code already exists (excluding current account)
      if (updateData.code && updateData.code !== account.code) {
        const existingCode = await Ledger.findOne({
          code: updateData.code,
          company: companyId,
          isDeleted: false,
          _id: { $ne: accountId }
        });

        if (existingCode) {
          throw new Error('Account code already exists');
        }
      }

      // Update account
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          account[key] = updateData[key];
        }
      });

      account.updatedBy = userId;
      await account.save();

      return account;
    } catch (error) {
      throw error;
    }
  }

  static async deleteLedgerAccount(accountId, companyId, userId) {
    try {
      const account = await Ledger.findOne({
        _id: accountId,
        company: companyId,
        isDeleted: false
      });

      if (!account) {
        throw new Error('Account not found');
      }

      // Check if account has transactions
      const hasTransactions = await Transaction.findOne({
        $or: [
          { fromAccount: accountId },
          { toAccount: accountId }
        ],
        isDeleted: false
      });

      if (hasTransactions) {
        throw new Error('Cannot delete account with existing transactions');
      }

      await account.softDelete(userId);
      return account;
    } catch (error) {
      throw error;
    }
  }

  // Transaction Management
  static async createTransaction(data, companyId, userId) {
    try {
      // Check if accounts exist and belong to company
      const [fromAccount, toAccount] = await Promise.all([
        Ledger.findOne({
          _id: data.fromAccount,
          company: companyId,
          isActive: true,
          isDeleted: false
        }),
        Ledger.findOne({
          _id: data.toAccount,
          company: companyId,
          isActive: true,
          isDeleted: false
        })
      ]);

      if (!fromAccount) {
        throw new Error('From account not found or not accessible');
      }

      if (!toAccount) {
        throw new Error('To account not found or not accessible');
      }

      if (data.fromAccount === data.toAccount) {
        throw new Error('From account and to account cannot be the same');
      }

      const transactionData = {
        ...data,
        company: companyId,
        createdBy: userId
      };

      const transaction = new Transaction(transactionData);
      await transaction.save();

      // Update account balances (handled by post-save middleware)
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async updateTransaction(transactionId, updateData, companyId, userId) {
    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        company: companyId,
        isDeleted: false
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Check if accounts exist and belong to company
      if (updateData.fromAccount || updateData.toAccount) {
        const [fromAccount, toAccount] = await Promise.all([
          updateData.fromAccount ? Ledger.findOne({
            _id: updateData.fromAccount,
            company: companyId,
            isActive: true,
            isDeleted: false
          }) : true,
          updateData.toAccount ? Ledger.findOne({
            _id: updateData.toAccount,
            company: companyId,
            isActive: true,
            isDeleted: false
          }) : true
        ]);

        if (updateData.fromAccount && !fromAccount) {
          throw new Error('From account not found or not accessible');
        }

        if (updateData.toAccount && !toAccount) {
          throw new Error('To account not found or not accessible');
        }
      }

      // Update transaction
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          transaction[key] = updateData[key];
        }
      });

      transaction.updatedBy = userId;
      await transaction.save();

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async deleteTransaction(transactionId, companyId, userId) {
    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        company: companyId,
        isDeleted: false
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await transaction.softDelete(userId);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  // Financial Reports
  static async generateProfitLossReport(companyId, startDate, endDate) {
    try {
      // Get revenue and expense accounts
      const { revenue, expenses } = await Ledger.getProfitLossAccounts(companyId);

      // Calculate totals
      const totalRevenue = await IncomeExpense.getTotalByType(companyId, 'income', startDate, endDate);
      const totalExpenses = await IncomeExpense.getTotalByType(companyId, 'expense', startDate, endDate);

      // Get category breakdowns
      const revenueByCategory = await IncomeExpense.getCategoryStats(companyId, 'income', startDate, endDate);
      const expensesByCategory = await IncomeExpense.getCategoryStats(companyId, 'expense', startDate, endDate);

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        period: { from: startDate, to: endDate },
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: parseFloat(profitMargin.toFixed(2))
        },
        revenue: {
          total: totalRevenue,
          byCategory: revenueByCategory,
          accounts: revenue
        },
        expenses: {
          total: totalExpenses,
          byCategory: expensesByCategory,
          accounts: expenses
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async generateBalanceSheetReport(companyId, asOfDate) {
    try {
      const { assets, liabilities, equity } = await Ledger.getBalanceSheetAccounts(companyId);

      const totalAssets = assets.reduce((sum, account) => sum + account.currentBalance, 0);
      const totalLiabilities = liabilities.reduce((sum, account) => sum + account.currentBalance, 0);
      const totalEquity = equity.reduce((sum, account) => sum + account.currentBalance, 0);
      const netWorth = totalAssets - totalLiabilities;

      return {
        asOf: asOfDate,
        summary: {
          totalAssets,
          totalLiabilities,
          totalEquity,
          netWorth
        },
        assets: {
          total: totalAssets,
          accounts: assets
        },
        liabilities: {
          total: totalLiabilities,
          accounts: liabilities
        },
        equity: {
          total: totalEquity,
          accounts: equity
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async generateCashFlowReport(companyId, startDate, endDate) {
    try {
      // Get cash accounts
      const cashAccounts = await Ledger.find({
        company: companyId,
        type: 'asset',
        subType: 'cash',
        isActive: true,
        isDeleted: false
      });

      const cashAccountIds = cashAccounts.map(account => account._id);

      // Calculate cash flows
      const [inflows, outflows] = await Promise.all([
        IncomeExpense.aggregate([
          {
            $match: {
              company: companyId,
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
        ]),
        IncomeExpense.aggregate([
          {
            $match: {
              company: companyId,
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
        ])
      ]);

      const totalInflows = inflows.length > 0 ? inflows[0].total : 0;
      const totalOutflows = outflows.length > 0 ? outflows[0].total : 0;
      const netCashFlow = totalInflows - totalOutflows;

      const openingBalance = cashAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
      const closingBalance = openingBalance + netCashFlow;

      return {
        period: { from: startDate, to: endDate },
        summary: {
          openingBalance,
          totalInflows,
          totalOutflows,
          netCashFlow,
          closingBalance
        },
        cashAccounts
      };
    } catch (error) {
      throw error;
    }
  }

  // Utility Methods
  static async getAccountBalance(accountId, companyId) {
    try {
      const account = await Ledger.findOne({
        _id: accountId,
        company: companyId,
        isActive: true,
        isDeleted: false
      });

      if (!account) {
        throw new Error('Account not found');
      }

      return account.currentBalance;
    } catch (error) {
      throw error;
    }
  }

  static async getAccountTransactions(accountId, companyId, page = 1, limit = 10) {
    try {
      return await Transaction.getByAccount(companyId, accountId, page, limit);
    } catch (error) {
      throw error;
    }
  }

  static async getAccountEntries(accountId, companyId, page = 1, limit = 10) {
    try {
      const query = {
        company: companyId,
        account: accountId,
        isDeleted: false
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { date: -1 },
        populate: [
          { path: 'createdBy', select: 'username fullname' }
        ]
      };

      return await IncomeExpense.paginate(query, options);
    } catch (error) {
      throw error;
    }
  }

  static async getFinancialSummary(companyId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [totalRevenue, totalExpenses, totalAssets, totalLiabilities, recentTransactions, pendingApprovals] = await Promise.all([
        IncomeExpense.getTotalByType(companyId, 'income', startDate, endDate),
        IncomeExpense.getTotalByType(companyId, 'expense', startDate, endDate),
        Ledger.aggregate([
          {
            $match: {
              company: companyId,
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
        ]),
        Ledger.aggregate([
          {
            $match: {
              company: companyId,
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
        ]),
        Transaction.find({
          company: companyId,
          isDeleted: false
        })
          .sort({ date: -1 })
          .limit(5)
          .populate([
            { path: 'fromAccount', select: 'name code' },
            { path: 'toAccount', select: 'name code' }
          ]),
        IncomeExpense.countDocuments({
          company: companyId,
          status: 'pending',
          isDeleted: false
        })
      ]);

      return {
        period: { from: startDate, to: endDate, days },
        financials: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          totalAssets: totalAssets.length > 0 ? totalAssets[0].total : 0,
          totalLiabilities: totalLiabilities.length > 0 ? totalLiabilities[0].total : 0
        },
        recentTransactions,
        pendingApprovals
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AccountingService;
