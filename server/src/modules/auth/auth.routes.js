const express = require("express");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const { authLimiter } = require("../../middleware/rateLimiter");
const authController = require("./auth.controller");
const { registerSchema, loginSchema } = require("./auth.validation");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: "**Role access:** Public — no JWT. Same for Admin, Analyst, and Viewer candidates before login."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, format: email, example: "jane@example.com" }
 *               password: { type: string, minLength: 6, example: "secret12" }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post("/register", authLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT token
 *     description: "**Role access:** Public — no JWT. Returns a token for Admin, Analyst, or Viewer accounts."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK — returns token and user
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: "**Role access:** Authenticated — Admin, Analyst, and Viewer (each sees their own profile)."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, authController.me);

module.exports = router;
