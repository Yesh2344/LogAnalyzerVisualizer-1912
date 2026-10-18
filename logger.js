/**
 * Simple wrapper around Winston to expose a singleton logger.
 * Allows future extension (e.g., file transports) without touching the rest of the code.
 */

const { logger } = require('./config');

module.exports = logger;