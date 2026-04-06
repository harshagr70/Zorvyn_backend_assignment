const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.model");
const { jwtSecret } = require("../config/environment");
const { STATUS } = require("../shared/constants");
const { AuthenticationError, ForbiddenError } = require("../shared/errors");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AuthenticationError("Missing or invalid authorization header"));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId);
    if (!user) return next(new AuthenticationError("User not found"));
    if (user.status !== STATUS.ACTIVE) return next(new ForbiddenError("User is inactive"));
    req.user = user;
    return next();
  } catch (error) {
    if (error.isOperational) return next(error);
    return next(new AuthenticationError("Invalid or expired token"));
  }
}

module.exports = authenticate;
