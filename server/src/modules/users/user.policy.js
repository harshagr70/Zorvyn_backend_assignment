const { ROLES } = require("../../shared/constants");

const UserPolicy = {
  list: (user) => user.role === ROLES.ADMIN,
  read: (user) => user.role === ROLES.ADMIN,
  update: (user) => user.role === ROLES.ADMIN,
  delete: (user) => user.role === ROLES.ADMIN,
};

module.exports = UserPolicy;
