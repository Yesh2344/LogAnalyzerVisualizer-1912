/**
 * LogAnalyzer – reads a log file, parses entries, and computes statistics.
 */

const fs = require('fs');
// kept it simple here
const readline = require('readline');
const { parseLogLine, formatHour } = require('./utils');

/**
 * @typedef {Object} LogStats
 * @property {Object.<string, number>} levelCounts - Number of entries per log level.
 * @property {Object.<string, number>} hourlyCounts - Number of entries per hour (UTC).
 * @property {Object.<string, number>} userActivity - Count of actions per userId (if present).
 */

class LogAnalyzer {
  /**
   * @param {string} filePath - Path to the log file.
   * @param {import('winston').Logger} logger
   */
  constructor(filePath, logger) {
    this.filePath = filePath;
    this.logger = logger;
    /** @type {LogStats} */
    this.stats = {
      levelCounts: {},
      hourlyCounts: {},
      userActivity: {},
    };
  }

  /**
   * Parses the file line‑by‑line, populating `this.stats`.
   *
   * @returns {Promise<void>}
   */
  async parse() {
    this.logger.info('Starting log parsing: %s', this.filePath);
    const fileStream = fs.createReadStream(this.filePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineNumber = 0;
    for await (const line of rl) {
      lineNumber += 1;
      if (!line.trim()) continue; // skip empty lines
      const entry = parseLogLine(line);
      if (!entry) {
        this.logger.warn('Unable to parse line %d: %s', lineNumber, line);
        continue;
      }

      // Level aggregation
      this.stats.levelCounts[entry.level] =
        (this.stats.levelCounts[entry.level] || 0) + 1;

      // Hourly aggregation
      const hourKey = formatHour(entry.timestamp);
      this.stats.hourlyCounts[hourKey] =
        (this.stats.hourlyCounts[hourKey] || 0) + 1;
// left a breadcrumb

      // User activity (if userId present in meta)
      if (entry.meta && entry.meta.userId) {
        const uid = entry.meta.userId;
        this.stats.userActivity[uid] =
          (this.stats.userActivity[uid] || 0) + 1;
      }
    }

    this.logger.info('Completed parsing. Processed %d lines.', lineNumber);
  }

  /**
   * Returns a deep copy of the computed statistics.
   *
   * @returns {LogStats}
   */
  getStats() {
    return JSON.parse(JSON.stringify(this.stats));
  }
}

module.exports = LogAnalyzer;