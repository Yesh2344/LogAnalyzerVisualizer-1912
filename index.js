/**
 * Main entry point – orchestrates configuration, analysis, and visualization.
 */

const { config, logger } = require('./config');
const LogAnalyzer = require('./analyzer');
const LogVisualizer = require('./visualizer');

(async () => {
  try {
    const analyzer = new LogAnalyzer(config.logFilePath, logger);
    await analyzer.parse();
    const stats = analyzer.getStats();

    const visualizer = new LogVisualizer(stats, config.outputDir, logger);
    await visualizer.generateReport();

    logger.info('Log analysis complete. Open the generated report to view charts.');
  } catch (err) {
    logger.error('Fatal error: %s', err.message, { stack: err.stack });
    process.exit(1);
  }
})();