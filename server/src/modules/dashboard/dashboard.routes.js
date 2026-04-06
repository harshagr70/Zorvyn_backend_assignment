const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const dashboardController = require("./dashboard.controller");
const DashboardPolicy = require("./dashboard.policy");

const router = express.Router();

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard summary totals
 *     description: "**Role access:** Admin and Analyst. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totals (income, expenses, net, count)
 *       403:
 *         description: Forbidden for viewer role
 */
router.get(
  "/summary",
  authenticate,
  authorize(DashboardPolicy, "viewSummary"),
  dashboardController.getSummary
);

/**
 * @swagger
 * /dashboard/category-breakdown:
 *   get:
 *     tags: [Dashboard]
 *     summary: Category wise income and expense totals
 *     description: "**Role access:** Admin and Analyst. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Breakdown by category
 */
router.get(
  "/category-breakdown",
  authenticate,
  authorize(DashboardPolicy, "viewSummary"),
  dashboardController.getCategoryBreakdown
);

/**
 * @swagger
 * /dashboard/monthly-trend:
 *   get:
 *     tags: [Dashboard]
 *     summary: Monthly trend of income and expenses
 *     description: "**Role access:** Admin and Analyst. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 6 }
 *         description: Number of months to include
 *     responses:
 *       200:
 *         description: Monthly buckets
 */
router.get(
  "/monthly-trend",
  authenticate,
  authorize(DashboardPolicy, "viewSummary"),
  dashboardController.getMonthlyTrend
);

/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     tags: [Dashboard]
 *     summary: Recent financial activity
 *     description: "**Role access:** Admin, Analyst, and Viewer (all may view recent activity)."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Recent records
 */
router.get(
  "/recent-activity",
  authenticate,
  authorize(DashboardPolicy, "viewActivity"),
  dashboardController.getRecentActivity
);

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: Combined dashboard overview
 *     description: "**Role access:** Admin and Analyst. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary, breakdowns, trend, recent activity
 *       403:
 *         description: Forbidden for viewer role
 */
router.get(
  "/overview",
  authenticate,
  authorize(DashboardPolicy, "viewSummary"),
  dashboardController.getOverview
);

module.exports = router;
