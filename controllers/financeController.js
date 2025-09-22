const asyncHandler = require('../utils/asyncHandler');
const ResponseHelper = require('../utils/responseHelper');
const FinanceEntry = require('../models/FinanceEntry');

/**
 * Get all finance entries with filtering and pagination
 * GET /api/admin/finance/entries
 */
const getEntries = asyncHandler(async (req, res) => {
  try {
    const {
      type,           // "income" or "expense"
      startDate,      // "YYYY-MM-DD"
      endDate,        // "YYYY-MM-DD"
      page = 1,       // page number
      limit = 20,     // items per page
      category,       // filter by category
      status,         // filter by status
      search          // search in description
    } = req.query;

    // Build query object
    const query = {
      isDeleted: false
    };

    // Filter by type (income or expense)
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        // Add 23:59:59 to end date to include the entire day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.date.$lte = endDateTime;
      }
    }

    // Filter by category
    if (category) {
      query.category = new RegExp(category, 'i'); // Case-insensitive search
    }

    // Filter by status
    if (status && ['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      query.status = status;
    }

    // Search in description
    if (search) {
      query.description = new RegExp(search, 'i'); // Case-insensitive search
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 }, // Sort by date descending
      populate: [
        { 
          path: 'addedBy', 
          select: 'username email fullname' 
        },
        { 
          path: 'approvedBy', 
          select: 'username email fullname' 
        },
        { 
          path: 'company', 
          select: 'name' 
        }
      ]
    };

    // Execute query with pagination
    const result = await FinanceEntry.paginate(query, options);

    // Format response data
    const formattedEntries = result.docs.map(entry => ({
      _id: entry._id,
      type: entry.type,
      amount: entry.amount,
      currency: entry.currency,
      description: entry.description,
      category: entry.category,
      incomeSource: entry.incomeSource,
      expenseType: entry.expenseType,
      paymentMethod: entry.paymentMethod,
      paymentReference: entry.paymentReference,
      date: entry.date,
      status: entry.status,
      addedBy: entry.addedBy ? {
        _id: entry.addedBy._id,
        username: entry.addedBy.username,
        email: entry.addedBy.email,
        fullname: entry.addedBy.fullname
      } : null,
      approvedBy: entry.approvedBy ? {
        _id: entry.approvedBy._id,
        username: entry.approvedBy.username,
        email: entry.approvedBy.email,
        fullname: entry.approvedBy.fullname
      } : null,
      approvedAt: entry.approvedAt,
      rejectionReason: entry.rejectionReason,
      tags: entry.tags,
      notes: entry.notes,
      attachments: entry.attachments,
      company: entry.company ? {
        _id: entry.company._id,
        name: entry.company.name
      } : null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }));

    // Calculate summary statistics
    const summary = await calculateSummary(query);

    // Prepare response
    const response = {
      entries: formattedEntries,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalEntries: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        limit: result.limit
      },
      summary: summary,
      filters: {
        type: type || 'all',
        startDate: startDate || null,
        endDate: endDate || null,
        category: category || null,
        status: status || 'all',
        search: search || null
      }
    };

    ResponseHelper.success(res, response, 'Finance entries retrieved successfully');

  } catch (error) {
    console.error('Error fetching finance entries:', error);
    ResponseHelper.error(res, 'Failed to fetch finance entries', 500);
  }
});

/**
 * Calculate summary statistics for finance entries
 * @param {Object} query - MongoDB query object
 * @returns {Object} Summary statistics
 */
const calculateSummary = async (query) => {
  try {
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          totalEntries: { $sum: 1 },
          incomeEntries: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, 1, 0]
            }
          },
          expenseEntries: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, 1, 0]
            }
          }
        }
      }
    ];

    const result = await FinanceEntry.aggregate(pipeline);
    const summary = result[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalEntries: 0,
      incomeEntries: 0,
      expenseEntries: 0
    };

    // Calculate net profit/loss
    summary.netProfit = summary.totalIncome - summary.totalExpense;

    return summary;
  } catch (error) {
    console.error('Error calculating summary:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      totalEntries: 0,
      incomeEntries: 0,
      expenseEntries: 0,
      netProfit: 0
    };
  }
};

/**
 * Get finance entry by ID
 * GET /api/admin/finance/entries/:id
 */
const getEntryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ResponseHelper.error(res, 'Entry ID is required', 400);
    }

    const entry = await FinanceEntry.findOne({ 
      _id: id, 
      isDeleted: false 
    })
    .populate('addedBy', 'username email fullname')
    .populate('approvedBy', 'username email fullname')
    .populate('company', 'name');

    if (!entry) {
      return ResponseHelper.error(res, 'Finance entry not found', 404);
    }

    ResponseHelper.success(res, { entry }, 'Finance entry retrieved successfully');

  } catch (error) {
    console.error('Error fetching finance entry:', error);
    ResponseHelper.error(res, 'Failed to fetch finance entry', 500);
  }
});

/**
 * Create new finance entry
 * POST /api/admin/finance/entries
 */
const createEntry = asyncHandler(async (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      date = new Date()
    } = req.body;

    // Basic validation for required fields
    if (!type || !['income', 'expense'].includes(type)) {
      return ResponseHelper.error(res, 'Type must be either "income" or "expense"', 400);
    }

    if (!amount || amount <= 0) {
      return ResponseHelper.error(res, 'Amount must be greater than 0', 400);
    }

    if (!description || description.trim() === '') {
      return ResponseHelper.error(res, 'Description is required', 400);
    }

    // Create entry with minimal required fields
    const entry = new FinanceEntry({
      type,
      amount,
      currency: 'INR', // Default currency
      description: description.trim(),
      category: type === 'income' ? 'General Income' : 'General Expense', // Default category
      date: new Date(date),
      addedBy: req.user.id,
      status: 'approved' // Auto-approve for SuperAdmin
    });

    await entry.save();

    // Populate the entry
    await entry.populate([
      { path: 'addedBy', select: 'username email fullname' }
    ]);

    // Format response to match documentation
    const responseData = {
      entry: {
        _id: entry._id,
        type: entry.type,
        amount: entry.amount,
        currency: entry.currency,
        description: entry.description,
        category: entry.category,
        incomeSource: entry.incomeSource,
        expenseType: entry.expenseType,
        paymentMethod: entry.paymentMethod,
        paymentReference: entry.paymentReference,
        date: entry.date,
        status: entry.status,
        addedBy: entry.addedBy ? {
          _id: entry.addedBy._id,
          username: entry.addedBy.username,
          email: entry.addedBy.email,
          fullname: entry.addedBy.fullname
        } : null,
        approvedBy: entry.approvedBy ? {
          _id: entry.approvedBy._id,
          username: entry.approvedBy.username,
          email: entry.approvedBy.email,
          fullname: entry.approvedBy.fullname
        } : null,
        approvedAt: entry.approvedAt,
        rejectionReason: entry.rejectionReason,
        tags: entry.tags,
        notes: entry.notes,
        attachments: entry.attachments,
        company: entry.company ? {
          _id: entry.company._id,
          name: entry.company.name
        } : null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    };

    ResponseHelper.success(res, responseData, 'Finance entry created successfully', 201);

  } catch (error) {
    console.error('Error creating finance entry:', error);
    ResponseHelper.error(res, 'Failed to create finance entry', 500);
  }
});

/**
 * Update finance entry
 * PUT /api/admin/finance/entries/:id
 */
const updateEntry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    if (!id) {
      return ResponseHelper.error(res, 'Entry ID is required', 400);
    }

    // Check if entry exists
    const existingEntry = await FinanceEntry.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!existingEntry) {
      return ResponseHelper.error(res, 'Finance entry not found', 404);
    }

    // Prepare update data with only allowed fields
    const updateData = {};

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return ResponseHelper.error(res, 'Type must be either "income" or "expense"', 400);
      }
      updateData.type = type;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return ResponseHelper.error(res, 'Amount must be greater than 0', 400);
      }
      updateData.amount = amount;
    }

    if (description !== undefined) {
      if (description.trim() === '') {
        return ResponseHelper.error(res, 'Description cannot be empty', 400);
      }
      updateData.description = description.trim();
    }

    if (date !== undefined) {
      updateData.date = new Date(date);
    }

    // Update the entry
    const entry = await FinanceEntry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('addedBy', 'username email fullname');

    if (!entry) {
      return ResponseHelper.error(res, 'Finance entry not found', 404);
    }

    // Format response to match requirements
    const responseData = {
      _id: entry._id,
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      date: entry.date,
      addedBy: entry.addedBy ? entry.addedBy.username : 'superadmin'
    };

    ResponseHelper.success(res, responseData, 'Entry updated successfully');

  } catch (error) {
    console.error('Error updating finance entry:', error);
    ResponseHelper.error(res, 'Failed to update finance entry', 500);
  }
});

/**
 * Delete finance entry (soft delete)
 * DELETE /api/admin/finance/entries/:id
 */
const deleteEntry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ResponseHelper.error(res, 'Entry ID is required', 400);
    }

    // Check if entry exists and is not already deleted
    const entry = await FinanceEntry.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!entry) {
      return ResponseHelper.error(res, 'Finance entry not found', 404);
    }

    // Soft delete - mark as deleted but keep in database
    entry.isDeleted = true;
    entry.deletedAt = new Date();
    entry.deletedBy = req.user.id;
    await entry.save();

    // Return success response as per requirements
    ResponseHelper.success(res, null, 'Entry deleted successfully');

  } catch (error) {
    console.error('Error deleting finance entry:', error);
    ResponseHelper.error(res, 'Failed to delete finance entry', 500);
  }
});

/**
 * Get finance statistics
 * GET /api/admin/finance/statistics
 */
const getStatistics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query = { isDeleted: false };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.date.$lte = endDateTime;
      }
    }

    const summary = await calculateSummary(query);

    // Get monthly breakdown
    const monthlyBreakdown = await FinanceEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Get category breakdown
    const categoryBreakdown = await FinanceEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const statistics = {
      summary,
      monthlyBreakdown,
      categoryBreakdown
    };

    ResponseHelper.success(res, statistics, 'Finance statistics retrieved successfully');

  } catch (error) {
    console.error('Error fetching finance statistics:', error);
    ResponseHelper.error(res, 'Failed to fetch finance statistics', 500);
  }
});

module.exports = {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getStatistics
};
