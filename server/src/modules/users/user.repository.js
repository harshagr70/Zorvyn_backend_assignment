const User = require("./user.model");

async function findAll(filters = {}, pagination = { page: 1, limit: 20 }) {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;

  const page = Math.max(1, Number(pagination.page || 1));
  const limit = Math.max(1, Math.min(100, Number(pagination.limit || 20)));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { users, total, page, limit };
}

function findById(id) {
  return User.findById(id);
}

function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

function update(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

function countAll(filters = {}) {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  return User.countDocuments(query);
}

module.exports = { findAll, findById, findByEmail, update, countAll };
