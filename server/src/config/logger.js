const pino = require("pino");
const { nodeEnv } = require("./environment");

const transport =
  nodeEnv === "development"
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      }
    : undefined;

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport,
});

module.exports = logger;
