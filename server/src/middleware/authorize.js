const { ForbiddenError } = require("../shared/errors");

const authorize = (policy, action) => (req, res, next) => {
  const checker = policy[action];
  if (typeof checker !== "function") {
    return next(new ForbiddenError(`Policy action '${action}' is not defined`));
  }

  const allowed = checker(req.user, req.resource || null);
  if (!allowed) {
    return next(new ForbiddenError("Insufficient permissions"));
  }
  return next();
};

module.exports = authorize;
