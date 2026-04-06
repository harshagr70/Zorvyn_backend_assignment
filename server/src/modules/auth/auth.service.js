const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const { jwtSecret, jwtExpiresIn } = require("../../config/environment");
const { STATUS, ROLES } = require("../../shared/constants");
const {
  ConflictError,
  AuthenticationError,
  ForbiddenError,
} = require("../../shared/errors");

function sanitizeUser(user) {
  const plain = user.toJSON();
  delete plain.password;
  return plain;
}

function generateToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ConflictError("Email already in use");

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.VIEWER,
    status: STATUS.ACTIVE,
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new AuthenticationError("Invalid credentials");

  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) throw new AuthenticationError("Invalid credentials");

  if (user.status !== STATUS.ACTIVE) {
    throw new ForbiddenError("Account deactivated");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

module.exports = { register, login, generateToken };
