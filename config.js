/**
 * Configuration loader.
 * Reads environment variables (via dotenv) and provides a typed config object.
 */

const path = require('path');
const dotenv = require('dotenv');
const { createLogger, format, transports } = require('winston');

// Load .env (if present) – ignore if missing to allow CI environments
dotenv.config();

/**
 * @typedef {Object} Config
 * @property {string} logFilePath - Absolute path to the log file.
 * @property {string} outputDir - Absolute path to the output directory.
 * @property {string} logLevel - Winston log level.
 */

/**
 * Resolve a path relative to the project root.
 * @param {string} p
 * @returns {string}
 */
function resolveRoot(p) {
  return path.resolve(__dirname, p);
}

/** @type {Config} */
const config = {
  logFilePath: resolveRoot(process.env.LOG_FILE_PATH || './sample.log'),
  outputDir: resolveRoot(process.env.OUTPUT_DIR || './output'),
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Ensure output directory exists (synchronously at startup)
const fs = require('fs');
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Winston logger shared across the application
const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level.toUpperCase()}] ${message} ${metaString}`;
    })
  ),
  transports: [new transports.Console()],
});

module.exports = { config, logger };