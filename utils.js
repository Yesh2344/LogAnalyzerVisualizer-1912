/**
 * Utility functions for log parsing and date handling.
 */

/**
 * Expected log line format (example):
 * 2024-10-18T12:34:56.789Z [INFO] User login successful: userId=123
 *
 * @typedef {Object} LogEntry
 * @property {Date} timestamp
 * @property {string} level - e.g., INFO, WARN, ERROR
 * @property {string} message
 * @property {Object.<string,string>} meta - key/value pairs extracted from the message
 */

/**
 * Parses a single log line into a LogEntry object.
 *
 * @param {string} line - Raw log line.
 * @returns {LogEntry|null} - Returns null if the line cannot be parsed.
 */
function parseLogLine(line) {
  const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z) \[([A-Z]+)] (.*)$/;
  const match = line.match(regex);
  if (!match) return null;

  const [, iso, level, message] = match;
  const timestamp = new Date(iso);
  const meta = {};

  // Extract key=value pairs from the message (optional)
  const kvRegex = /(\w+)=([^\s,]+)/g;
  let kvMatch;
  while ((kvMatch = kvRegex.exec(message)) !== null) {
    meta[kvMatch[1]] = kvMatch[2];
  }

  return { timestamp, level, message, meta };
}

/**
 * Formats a Date to `YYYY-MM-DD HH` (hour precision) for aggregation.
 *
 * @param {Date} date
 * @returns {string}
 */
function formatHour(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )} ${pad(date.getUTCHours())}:00`;
}

module.exports = { parseLogLine, formatHour };