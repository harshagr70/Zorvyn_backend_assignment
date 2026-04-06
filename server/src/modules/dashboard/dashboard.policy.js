const { ROLES } = require("../../shared/constants");

const DashboardPolicy = {
  viewSummary: (user) => [ROLES.ADMIN, ROLES.ANALYST].includes(user.role),
  viewActivity: (user) => [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER].includes(user.role),
};

module.exports = DashboardPolicy;
