const fs = require('fs');
const path = require('path');

const SUMMARY_FILE = process.argv[2] || 'summary.json';
const REPORT_FILE = path.join(__dirname, '../STRESS_TEST_REPORT.md');

if (!fs.existsSync(SUMMARY_FILE)) {
  console.error(
    `Error: Summary file ${SUMMARY_FILE} not found. Ensure k6 ran successfully with --summary-export=${SUMMARY_FILE}`,
  );
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));

// Helper to safely get nested values
const getMetric = (metricName, field = 'value') => {
  const metric = summary.metrics[metricName];
  if (!metric) return null;
  // If requesting a specific value field (like 'min', 'max', 'p(95)')
  return metric.values ? metric.values[field] : metric[field];
};

const currentMetrics = {
  rps: (getMetric('http_reqs', 'rate') || 0).toFixed(2),
  p95: (getMetric('http_req_duration', 'p(95)') || 0).toFixed(2),
  avg: (getMetric('http_req_duration', 'avg') || 0).toFixed(2),
  successRate: ((1 - (getMetric('http_req_failed', 'rate') || 0)) * 100).toFixed(2),
  totalReqs: getMetric('http_reqs', 'count') || 0,
};

// Determine scenario from file or args (simplistic approach: assume Env was passed via process or defaulted)
// Since we don't have easy access to the k6 ENV vars here, we check process.env or default to 'unknown'
const scenario = process.env.SCENARIO || 'unknown';

let previousMetrics = null;
let history = '';

if (fs.existsSync(REPORT_FILE)) {
  const content = fs.readFileSync(REPORT_FILE, 'utf8');

  // Extract previous metrics from the last run's summary
  const rpsMatch = content.match(/- \*\*Average RPS\*\*: `([0-9.]+) reqs\/s`/);
  const p95Match = content.match(/\| \*\*p\(95\) Duration\*\* +\| `([0-9.]+) ms`/);

  if (rpsMatch && p95Match) {
    previousMetrics = {
      rps: parseFloat(rpsMatch[1]),
      p95: parseFloat(p95Match[1]),
    };
  }

  // Extract history table if it exists
  const historyStart = content.indexOf('## 🕒 History');
  if (historyStart !== -1) {
    // Find where the next section starts (---) or take till end if no more sections
    const nextSectionIndex = content.indexOf('\n---', historyStart + 15);
    if (nextSectionIndex !== -1) {
      history = content.substring(historyStart, nextSectionIndex).trim();
    } else {
      history = content.substring(historyStart).trim();
    }
  }
}

// Ensure history has a header if it was empty, now including "Scenario"
if (!history) {
  history = `## 🕒 History

| Date | Scenario | Total Req | RPS | p(95) | Success |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;
} else if (!history.includes('| Scenario |')) {
  // Migration: If existing history doesn't have Scenario column, recreate header
  // Note: This won't fix existing rows, but ensures future compatibility
  history = history
    .replace('| Date | Total Req | RPS | p(95) | Success |', '| Date | Scenario | Total Req | RPS | p(95) | Success |')
    .replace('| :--- | :--- | :--- | :--- | :--- |', '| :--- | :--- | :--- | :--- | :--- | :--- |');
}

function getDelta(current, previous, higherIsBetter = true) {
  if (!previous || previous === 0) return '';
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return ' ( - )';
  const percent = ((diff / previous) * 100).toFixed(2);
  const sign = diff >= 0 ? '+' : '';
  const color = diff >= 0 === higherIsBetter ? '🟢' : '🔴';
  return ` **(${color} ${sign}${percent}%)**`;
}

const timestamp = new Date().toUTCString();

// Add current run to history (limit to last 10 runs optionally, but keeping all for now)
const newHistoryEntry = `| ${timestamp} | ${scenario} | ${currentMetrics.totalReqs} | ${currentMetrics.rps} | ${currentMetrics.p95}ms | ${currentMetrics.successRate}% |
`;
const historyLines = history.split('\n');
historyLines.splice(4, 0, newHistoryEntry.trim());
history = historyLines.join('\n');

const report = `# Stress Test Report: hydric Gateway API

> Generated on: **${timestamp}**

## 📊 Latest Execution Summary

- **Total Requests**: \`${currentMetrics.totalReqs}\`
- **Success Rate**: \`${currentMetrics.successRate}%\`
- **Average RPS**: \`${currentMetrics.rps} reqs/s\`${getDelta(currentMetrics.rps, previousMetrics?.rps)}

## ⏱️ Latency Metrics

| Metric | Value |
| :--- | :--- |
| **p(95) Duration** | \`${currentMetrics.p95} ms\`${getDelta(currentMetrics.p95, previousMetrics?.p95, false)} |
| **Average Duration** | \`${currentMetrics.avg} ms\` |

---

${history}

---

## 🛠️ Automated Generation

To re-run the stress tests and update this report automatically:

# 1. Run the automated script
\`\`\`bash
./stress-tests/run.sh <scenario>
\`\`\`
*(scenario defaults to smoke if not provided)*
`;

fs.writeFileSync(REPORT_FILE, report);
console.log(`Report updated at ${REPORT_FILE}`);
