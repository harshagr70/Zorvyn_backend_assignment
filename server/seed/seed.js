const { connectDB, disconnectDB } = require("../src/config/database");
const logger = require("../src/config/logger");
const User = require("../src/modules/users/user.model");
const Record = require("../src/modules/records/record.model");
const { ROLES, STATUS, CATEGORIES, RECORD_TYPES } = require("../src/shared/constants");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(type) {
  if (type === RECORD_TYPES.INCOME) {
    return Number((Math.random() * 8000 + 1000).toFixed(2));
  }
  return Number((Math.random() * 2500 + 50).toFixed(2));
}

function randomDateWithinMonths(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const ts = start.getTime() + Math.random() * (now.getTime() - start.getTime());
  return new Date(ts);
}

async function seed() {
  await connectDB();

  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeder should not run in production");
  }

  await Promise.all([Record.deleteMany({}), User.deleteMany({})]);

  const users = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: ROLES.ADMIN,
      status: STATUS.ACTIVE,
    },
    {
      name: "Analyst User",
      email: "analyst@example.com",
      password: "analyst123",
      role: ROLES.ANALYST,
      status: STATUS.ACTIVE,
    },
    {
      name: "Viewer User",
      email: "viewer@example.com",
      password: "viewer123",
      role: ROLES.VIEWER,
      status: STATUS.ACTIVE,
    },
  ]);

  const [admin, analyst] = users;
  const creators = [admin._id, analyst._id];

  const seedRecords = [];
  for (let i = 0; i < 60; i += 1) {
    const type = Math.random() < 0.4 ? RECORD_TYPES.INCOME : RECORD_TYPES.EXPENSE;
    const category =
      type === RECORD_TYPES.INCOME
        ? pick(["salary", "freelance", "investment"])
        : pick(CATEGORIES);
    seedRecords.push({
      amount: randomAmount(type),
      type,
      category,
      date: randomDateWithinMonths(6),
      description: `${type} for ${category}`,
      createdBy: pick(creators),
      updatedBy: pick(creators),
      isDeleted: false,
    });
  }

  await Record.insertMany(seedRecords);

  logger.info("Seeding completed");
  logger.info("Demo credentials:");
  logger.info("admin@example.com / admin123");
  logger.info("analyst@example.com / analyst123");
  logger.info("viewer@example.com / viewer123");
  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch(async (error) => {
    logger.error({ error: error.stack }, "Seeding failed");
    await disconnectDB();
    process.exit(1);
  });
