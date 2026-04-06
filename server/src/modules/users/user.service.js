const userRepository = require("./user.repository");
const { NotFoundError } = require("../../shared/errors");
const { STATUS } = require("../../shared/constants");

async function listUsers(filters, pagination) {
  const result = await userRepository.findAll(filters, pagination);
  return {
    users: result.users,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
  };
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
}

async function updateUser(id, data) {
  const user = await userRepository.update(id, data);
  if (!user) throw new NotFoundError("User not found");
  return user;
}

async function deactivateUser(id) {
  return updateUser(id, { status: STATUS.INACTIVE });
}

module.exports = { listUsers, getUserById, updateUser, deactivateUser };
