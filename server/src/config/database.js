const mongoose = require("mongoose");
const logger = require("./logger");
const { mongoUri } = require("./environment");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectDB(maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      await mongoose.connect(mongoUri);
      logger.info({ attempt }, "MongoDB connected");
      return;
    } catch (error) {
      logger.error({ attempt, error: error.message }, "MongoDB connection failed");
      if (attempt >= maxAttempts) {
        throw error;
      }
      await sleep(500 * 2 ** attempt);
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

module.exports = { connectDB, disconnectDB };
