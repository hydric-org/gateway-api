# Stress Test Report: hydric Gateway API

> Generated on: **Mon, 19 Jan 2026 16:05:05 GMT**

## 📊 Latest Execution Summary

- **Total Requests**: `23896`
- **Success Rate**: `100.00%`
- **Average RPS**: `36.06 reqs/s` **(🟢 +511.19%)**

## ⏱️ Latency Metrics

| Metric | Value |
| :--- | :--- |
| **p(95) Duration** | `794.12 ms` **(🔴 +137.60%)** |
| **Average Duration** | `405.32 ms` |

---

## 🕒 History

| Date | Scenario | Total Req | RPS | p(95) | Success |
| :--- | :------- | :-------- | :-- | :---- | :------ |
| Mon, 19 Jan 2026 16:05:05 GMT | stress | 23896 | 36.06 | 794.12ms | 100.00% |
| Mon, 19 Jan 2026 15:34:41 GMT | load | 714 | 5.90 | 334.22ms | 100.00% |
| Mon, 19 Jan 2026 15:32:36 GMT | smoke | 8 | 0.73 | 528.11ms | 100.00% |

---

## 🛠️ Automated Generation

To re-run the stress tests and update this report automatically:

# 1. Run the automated script
```bash
./stress-tests/run.sh <scenario>
```
*(scenario defaults to smoke if not provided)*
