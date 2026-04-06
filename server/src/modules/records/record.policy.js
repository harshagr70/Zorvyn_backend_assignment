const { ROLES } = require("../../shared/constants");

/** Works when createdBy is an ObjectId or a populated User document */
function ownerId(record) {
  const cb = record?.createdBy;
  if (!cb) return null;
  return cb._id ? cb._id.toString() : cb.toString();
}

const RecordPolicy = {
  create: (user) => [ROLES.ADMIN, ROLES.ANALYST].includes(user.role),
  read: (user) => [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER].includes(user.role),
  update: (user, record) => {
    if (user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.ANALYST) {
      return ownerId(record) === user._id.toString();
    }
    return false;
  },
  delete: (user) => user.role === ROLES.ADMIN,
};

module.exports = RecordPolicy;
