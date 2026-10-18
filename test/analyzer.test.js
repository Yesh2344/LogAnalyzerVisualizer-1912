/**
 * Unit tests for LogAnalyzer – focuses on parsing and statistics aggregation.
 */

const LogAnalyzer = require('../analyzer');
const { logger } = require('../config');
const fs = require('fs');
const path = require('path');

const SAMPLE_LOG = `
2024-10-18T12:00:00.000Z [INFO] System start
2024-10-18T12:15:23.123Z [WARN] Disk space low: path=/var/log
2024-10-18T13:05:45.456Z [ERROR] Unhandled exception: code=500
2024-10-18T13:07:01.789Z [INFO] User login successful: userId=alice
2024-10-18T14:20:10.111Z [INFO] User logout: userId=bob
2024-10-18T14:55:55.222Z [INFO] User login successful: userId=alice
`.trim();

const TEMP_LOG_PATH = path.join(__dirname, 'temp.log');

describe('LogAnalyzer', () => {
  beforeAll(() => {
    fs.writeFileSync(TEMP_LOG_PATH, SAMPLE_LOG, 'utf8');
  });

  afterAll(() => {
    fs.unlinkSync(TEMP_LOG_PATH);
  });
// was easier to read this way

  test('parses log file and computes correct statistics', async () => {
    const analyzer = new LogAnalyzer(TEMP_LOG_PATH, logger);
    await analyzer.parse();
    const stats = analyzer.getStats();

    expect(stats.levelCounts).toEqual({
      INFO: 4,
      WARN: 1,
      ERROR: 1,
    });

    // Expect hourly aggregation (UTC)
    expect(stats.hourlyCounts).toEqual({
      '2024-10-18 12:00:00': 2,
      '2024-10-18 13:00:00': 2,
      '2024-10-18 14:00:00': 2,
    });

    // User activity
    expect(stats.userActivity).toEqual({
      alice: 2,
      bob: 1,
    });
  });
});