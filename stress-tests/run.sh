#!/bin/bash

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Determine Scenario (default to smoke)
SCENARIO=${1:-smoke}

# Ensure STRESS_TEST_API_KEY is set
if [ -z "$STRESS_TEST_API_KEY" ]; then
  echo "❌ Error: STRESS_TEST_API_KEY is not set. Stress tests require a valid API key."
  echo "Please set it in your .env file or export it: export STRESS_TEST_API_KEY=your_key"
  exit 1
fi

echo "🚀 Running k6 stress test [Scenario: $SCENARIO]..."

# Run k6
k6 run -e SCENARIO=$SCENARIO --summary-export=summary.json stress-tests/stress-test.js

# Generate report
# Generate report
echo "📊 Generating performance report..."
SCENARIO=$SCENARIO node stress-tests/generate-report.js

echo "✅ Done! Check STRESS_TEST_REPORT.md for results."
