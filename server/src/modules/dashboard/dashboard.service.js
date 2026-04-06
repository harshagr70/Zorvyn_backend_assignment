const Record = require("../records/record.model");

async function getSummary() {
  const pipeline = [
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        recordCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
        recordCount: 1,
      },
    },
  ];

  const [result] = await Record.aggregate(pipeline);
  return result || { totalIncome: 0, totalExpenses: 0, netBalance: 0, recordCount: 0 };
}

async function getCategoryBreakdown() {
  const pipeline = [
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.category",
        income: {
          $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
        },
        count: { $sum: "$count" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        income: 1,
        expense: 1,
        net: { $subtract: ["$income", "$expense"] },
        count: 1,
      },
    },
    { $sort: { expense: -1, income: -1 } },
  ];

  return Record.aggregate(pipeline);
}

async function getMonthlyTrend(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - Number(months) + 1, 1);

  const pipeline = [
    { $match: { isDeleted: false, date: { $gte: start, $lte: now } } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
        income: 1,
        expense: 1,
        net: { $subtract: ["$income", "$expense"] },
      },
    },
  ];

  return Record.aggregate(pipeline);
}

function getRecentActivity(limit = 10) {
  return Record.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort({ date: -1, createdAt: -1 })
    .limit(Number(limit));
}

async function getOverview() {
  const [summary, categoryBreakdown, monthlyTrend, recentActivity] = await Promise.all([
    getSummary(),
    getCategoryBreakdown(),
    getMonthlyTrend(6),
    getRecentActivity(10),
  ]);
  return { summary, categoryBreakdown, monthlyTrend, recentActivity };
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getRecentActivity,
  getOverview,
};
