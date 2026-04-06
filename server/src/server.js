const http = require("http");
const app = require("./app");
const logger = require("./config/logger");
const { connectDB, disconnectDB } = require("./config/database");
const { port } = require("./config/environment");

let server;

async function startServer() {
  await connectDB();
  server = http.createServer(app);
  server.listen(port, () => {
    logger.info({ port }, "Server started");
  });
}

async function shutdown(signal) {
  logger.info({ signal }, "Graceful shutdown started");
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  await disconnectDB();
  logger.info("Graceful shutdown completed");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.error({ error: error.stack }, "Uncaught exception");
  process.exit(1);
});

startServer().catch((error) => {
  logger.error({ error: error.stack }, "Failed to start server");
  process.exit(1);
});
