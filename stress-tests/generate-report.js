const fs = require('fs');
const path = require('path');

const SUMMARY_FILE = process.argv[2] || 'summary.json';
const REPORT_FILE = path.join(__dirname, '../STRESS_TEST_REPORT.md');

if (!fs.existsSync(SUMMARY_FILE)) {
  console.error(`Error: Summary file ${SUMMARY_FILE} not found. Ensure you run k6 with --summary-export=summary.json`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));

const currentMetrics = {
  rps: summary.metrics.http_reqs.values.rate.toFixed(2),
  p95: summary.metrics.http_req_duration.values['p(95)'].toFixed(2),
  avg: summary.metrics.http_req_duration.values.avg.toFixed(2),
  successRate: ((1 - summary.metrics.http_req_failed.values.rate) * 100).toFixed(2),
  totalReqs: summary.metrics.http_reqs.values.count,
};

let previousMetrics = null;
if (fs.existsSync(REPORT_FILE)) {
  const content = fs.readFileSync(REPORT_FILE, 'utf8');
  const rpsMatch = content.match(/- \*\*Average RPS\*\*: ([0-9.]+) reqs\/s/);
  const p95Match = content.match(/\| \*\*p\(95\) Duration\*\* +\| ([0-9.]+) ms/);
  if (rpsMatch && p95Match) {
    previousMetrics = {
      rps: parseFloat(rpsMatch[1]),
      p95: parseFloat(p95Match[1]),
    };
  }
}

function getDelta(current, previous, higherIsBetter = true) {
  if (!previous) return '';
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return ' ( - )';
  const percent = ((diff / previous) * 100).toFixed(2);
  const sign = diff >= 0 ? '+' : '';
  const color = diff >= 0 === higherIsBetter ? '🟢' : '🔴';
  return ` **(${color} ${sign}${percent}%)**`;
}

const report = `# Stress Test Report: hydric Gateway API

> Generated on: **${new Date().toUTCString()}**

## 📊 Execution Summary

- **Total Requests**: \`${currentMetrics.totalReqs}\`
- **Success Rate**: \`${currentMetrics.successRate}%\`
- **Average RPS**: \`${currentMetrics.rps} reqs/s\`${getDelta(currentMetrics.rps, previousMetrics?.rps)}

## ⏱️ Latency Metrics

| Metric | Value |
| :--- | :--- |
| **p(95) Duration** | \`${currentMetrics.p95} ms\`${getDelta(currentMetrics.p95, previousMetrics?.p95, false)} |
| **Average Duration** | \`${currentMetrics.avg} ms\` |

---

## 🛠️ Automated Generation

To re-run the stress tests and update this report automatically:

\`\`\`bash
# 1. Run k6 and export results to JSON
k6 run --summary-export=summary.json stress-tests/stress-test.js

# 2. Generate the comparative report
node stress-tests/generate-report.js
\`\`\`
`;

fs.writeFileSync(REPORT_FILE, report);
console.log(`Report updated at ${REPORT_FILE}`);
