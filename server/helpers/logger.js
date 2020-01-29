const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "Auth" },
  transports: [
    new transports.File({
      filename: "logs/auth-email-error.log",
      level: "email-error"
    }),
    new transports.File({ filename: "logs/auth-error.log", level: "error" }),
    new transports.File({ filename: "logs/auth-all-combined.log" })
  ]
});

if (process.env.BUILD_TYPE) {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
}

module.exports = logger;
