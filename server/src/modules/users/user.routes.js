const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");
const userController = require("./user.controller");
const UserPolicy = require("./user.policy");
const { listUsersSchema, updateUserSchema, userIdSchema } = require("./user.validation");

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     description: "**Role access:** Admin only. Analyst and Viewer receive 403."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [viewer, analyst, admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Paginated user list
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  validate(listUsersSchema),
  authorize(UserPolicy, "list"),
  userController.list
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
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
 *         description: User document
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  authenticate,
  validate(userIdSchema),
  authorize(UserPolicy, "read"),
  userController.getById
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role/status
 *     description: "**Role access:** Admin only. Analyst and Viewer receive 403."
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
 *               name: { type: string }
 *               role: { type: string, enum: [viewer, analyst, admin] }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Updated user
 */
router.patch(
  "/:id",
  authenticate,
  validate(updateUserSchema),
  authorize(UserPolicy, "update"),
  userController.update
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user
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
 *         description: User deactivated
 */
router.delete(
  "/:id",
  authenticate,
  validate(userIdSchema),
  authorize(UserPolicy, "delete"),
  userController.deactivate
);

module.exports = router;
