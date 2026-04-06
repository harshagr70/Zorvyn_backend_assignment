const asyncHandler = require("../../shared/utils/asyncHandler");
const dashboardService = require("./dashboard.service");

const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.status(200).json({ success: true, data });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryBreakdown();
  res.status(200).json({ success: true, data });
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyTrend(req.query.months || 6);
  res.status(200).json({ success: true, data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentActivity(req.query.limit || 10);
  res.status(200).json({ success: true, data });
});

const getOverview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview();
  res.status(200).json({ success: true, data });
});

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getRecentActivity,
  getOverview,
};
