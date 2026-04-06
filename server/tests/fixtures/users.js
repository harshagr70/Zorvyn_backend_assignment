const jwt = require("jsonwebtoken");
const User = require("../../src/modules/users/user.model");
const { ROLES, STATUS } = require("../../src/shared/constants");

async function createUser(role = ROLES.VIEWER, overrides = {}) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}-${suffix}@test.com`,
    password: "password123",
    role,
    status: STATUS.ACTIVE,
    ...overrides,
  });

  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return { user, token };
}

module.exports = { createUser };
