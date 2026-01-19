#!/bin/bash

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Determine Scenario (default to smoke)
SCENARIO=${1:-smoke}

# Ensure API_KEY is set
if [ -z "$API_KEY" ]; then
  echo "⚠️  Warning: API_KEY is not set. The tests will likely fail with 401 Unauthorized."
  echo "You can set it in your .env file or export it: export API_KEY=your_key"
fi

echo "🚀 Running k6 stress test [Scenario: $SCENARIO]..."

# Run k6
k6 run -e SCENARIO=$SCENARIO --summary-export=summary.json stress-tests/stress-test.js

# Generate report
# Generate report
echo "📊 Generating performance report..."
SCENARIO=$SCENARIO node stress-tests/generate-report.js

echo "✅ Done! Check STRESS_TEST_REPORT.md for results."
