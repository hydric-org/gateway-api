# Stress Test Report: hydric Gateway API

> Generated on: **Mon, 19 Jan 2026 14:55:00 GMT**

## 📊 Execution Summary

- **Total Requests**: \`23490\`
- **Success Rate**: \`100.00%\`
- **Average RPS**: \`35.46 reqs/s\`

## ⏱️ Latency Metrics

| Metric               | Value         |
| :------------------- | :------------ |
| **p(95) Duration**   | \`814.29 ms\` |
| **Average Duration** | \`429.94 ms\` |

---

## 🛠️ Automated Generation

To re-run the stress tests and update this report automatically:

\`\`\`bash

# 1. Run k6 and export results to JSON

k6 run --summary-export=summary.json stress-tests/stress-test.js

# 2. Generate the comparative report

node stress-tests/generate-report.js
\`\`\`
