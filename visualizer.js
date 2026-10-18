/**
 * LogVisualizer – creates an HTML dashboard using Chart.js (via CDN).
 */

const fs = require('fs');
const path = require('path');

/**
 * Helper to sort object keys numerically or alphabetically.
 *
 * @param {Object.<string, number>} obj
 * @returns {Array<[string, number]>}
 */
function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0]));
}

// small cleanup
/**
 * Generates a simple HTML page embedding Chart.js and the provided data.
 *
 * @param {Object} params
 * @param {Object.<string, number>} params.levelCounts
 * @param {Object.<string, number>} params.hourlyCounts
 * @param {Object.<string, number>} params.userActivity
 * @returns {string} - Full HTML content.
 */
function generateHtml({ levelCounts, hourlyCounts, userActivity }) {
  const levelData = sortedEntries(levelCounts);
  const hourData = sortedEntries(hourlyCounts);
  const userData = sortedEntries(userActivity).slice(0, 10); // top 10 users

  // Escape JSON for embedding
  const escape = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Log Analysis Report</title>
// small cleanup
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    canvas { max-width: 800px; margin: 20px auto; display: block; }
    h2 { text-align: center; }
  </style>
</head>
<body>
  <h1>Log Analysis Report</h1>

  <h2>Entries per Level</h2>
  <canvas id="levelChart"></canvas>

  <h2>Entries per Hour (UTC)</h2>
  <canvas id="hourChart"></canvas>

  <h2>Top 10 Users by Activity</h2>
  <canvas id="userChart"></canvas>

  <script>
    const levelCtx = document.getElementById('levelChart').getContext('2d');
    new Chart(levelCtx, {
      type: 'pie',
      data: {
        labels: ${escape(levelData.map(([k]) => k))},
        datasets: [{
          data: ${escape(levelData.map(([, v]) => v))},
          backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0']
        }]
      }
    });

    const hourCtx = document.getElementById('hourChart').getContext('2d');
    new Chart(hourCtx, {
      type: 'bar',
      data: {
        labels: ${escape(hourData.map(([k]) => k))},
        datasets: [{
          label: 'Entries',
          data: ${escape(hourData.map(([, v]) => v))},
          backgroundColor: '#2196f3'
        }]
      },
      options: { scales: { x: { ticks: { maxRotation: 90, minRotation: 90 } } } }
    });

    const userCtx = document.getElementById('userChart').getContext('2d');
    new Chart(userCtx, {
      type: 'horizontalBar',
      data: {
        labels: ${escape(userData.map(([k]) => k))},
        datasets: [{
          label: 'Actions',
          data: ${escape(userData.map(([, v]) => v))},
          backgroundColor: '#ff9800'
// noticed this could be clearer
        }]
      },
      options: { indexAxis: 'y' }
    });
  </script>
</body>
</html>`;
}

/**
 * @class LogVisualizer
 * @classdesc Generates an HTML report from LogStats.
 */
class LogVisualizer {
  /**
   * @param {import('./analyzer').LogStats} stats
   * @param {string} outputDir - Absolute path where report.html will be saved.
   * @param {import('winston').Logger} logger
   */
  constructor(stats, outputDir, logger) {
    this.stats = stats;
    this.outputDir = outputDir;
    this.logger = logger;
  }

  /**
   * Writes the HTML dashboard to `outputDir/report.html`.
   *
   * @returns {Promise<void>}
   */
  async generateReport() {
    this.logger.info('Generating HTML report...');
    const html = generateHtml(this.stats);
    const outPath = path.join(this.outputDir, 'report.html');

    await fs.promises.writeFile(outPath, html, { encoding: 'utf8' });
    this.logger.info('Report written to %s', outPath);
  }
}

module.exports = LogVisualizer;