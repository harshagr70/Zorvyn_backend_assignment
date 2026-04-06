const express = require("express");
const authenticate = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const authorize = require("../../middleware/authorize");
const recordController = require("./record.controller");
const RecordPolicy = require("./record.policy");
const { loadRecord } = require("./record.middleware");
const {
  createRecordSchema,
  updateRecordSchema,
  listRecordsSchema,
  recordIdSchema,
} = require("./record.validation");

const router = express.Router();

/**
 * @swagger
 * /records:
 *   post:
 *     tags: [Records]
 *     summary: Create a financial record
 *     description: "**Role access:** Admin and Analyst can create. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: number, example: 1500.5 }
 *               type: { type: string, enum: [income, expense] }
 *               category:
 *                 type: string
 *                 enum: [salary, freelance, investment, food, transport, utilities, entertainment, healthcare, shopping, other]
 *               date: { type: string, format: date-time, description: ISO 8601 datetime }
 *               description: { type: string, maxLength: 500 }
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  validate(createRecordSchema),
  authorize(RecordPolicy, "create"),
  recordController.create
);

/**
 * @swagger
 * /records:
 *   get:
 *     tags: [Records]
 *     summary: List records
 *     description: "**Role access:** Admin, Analyst, and Viewer (all may list/read)."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "-date" }
 *     responses:
 *       200:
 *         description: Paginated records
 */
router.get(
  "/",
  authenticate,
  validate(listRecordsSchema),
  authorize(RecordPolicy, "read"),
  recordController.list
);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Get a record by ID
 *     description: "**Role access:** Admin, Analyst, and Viewer (all may read by ID)."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  authenticate,
  validate(recordIdSchema),
  authorize(RecordPolicy, "read"),
  recordController.getById
);

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a record
 *     description: "**Role access:** Admin may update any record. Analyst may update only records they created. Viewer receives 403."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *               date: { type: string, format: date-time }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id",
  authenticate,
  validate(updateRecordSchema),
  loadRecord,
  authorize(RecordPolicy, "update"),
  recordController.update
);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: Soft delete a record
 *     description: "**Role access:** Admin only. Analyst and Viewer receive 403."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  validate(recordIdSchema),
  loadRecord,
  authorize(RecordPolicy, "delete"),
  recordController.remove
);

module.exports = router;
