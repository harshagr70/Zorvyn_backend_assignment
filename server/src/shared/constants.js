const ROLES = Object.freeze({
  VIEWER: "viewer",
  ANALYST: "analyst",
  ADMIN: "admin",
});

const STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

const RECORD_TYPES = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

const CATEGORIES = Object.freeze([
  "salary",
  "freelance",
  "investment",
  "food",
  "transport",
  "utilities",
  "entertainment",
  "healthcare",
  "shopping",
  "other",
]);

module.exports = { ROLES, STATUS, RECORD_TYPES, CATEGORIES };
