import { check, sleep } from 'k6';
import http from 'k6/http';

// Define the scenarios for the test
const allScenarios = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '10s',
    tags: { test_type: 'smoke' },
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 }, // Ramp up to 10 users
      { duration: '1m', target: 10 }, // Sustain
      { duration: '30s', target: 0 }, // Ramp down
    ],
    gracefulRampDown: '30s',
    tags: { test_type: 'load' },
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 20 }, // Start easy
      { duration: '1m', target: 40 }, // Ramp up
      { duration: '2m', target: 40 }, // Sustain
      { duration: '1m', target: 60 }, // Push harder (approx 60 RPS)
      { duration: '2m', target: 60 },
      { duration: '1m', target: 80 }, // Near indexer limit (83 RPS)
      { duration: '2m', target: 80 },
      { duration: '1m', target: 0 }, // Cool down
    ],
    gracefulRampDown: '30s',
    tags: { test_type: 'stress' },
  },
};

const selectedScenario = __ENV.SCENARIO || 'smoke';

export const options = {
  scenarios: {
    [selectedScenario]: allScenarios[selectedScenario],
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Max 5% failure rate
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
  },
};

const API_KEY = __ENV.API_KEY;
const BASE_URL = 'https://api.hydric.org/v1';

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Get Single Pool
  const chainId = '1';
  const poolAddress = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';
  const poolRes = http.get(`${BASE_URL}/pools/${chainId}/${poolAddress}`, params);

  check(poolRes, {
    'pool status is 200': (r) => r.status === 200,
    'pool has data': (r) => r.json().data !== undefined,
  });

  sleep(1);

  // 2. Search Pools (realistic search)
  const searchPayload = JSON.stringify({
    tokensA: [
      {
        chainId: 1,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      {
        chainId: 1,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      },
      {
        chainId: 8453,
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
    ],
    tokensB: [
      {
        chainId: 1,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      {
        chainId: 8453,
        address: '0x4200000000000000000000000000000000000006',
      },
    ],
    filters: {
      blockedPoolTypes: ['ALGEBRA'],
      blockedProtocols: ['sushiswap-v3'],
      minimumTotalValueLockedUsd: 10000,
    },
    config: {
      limit: 100,
      orderBy: {
        field: 'yield',
        direction: 'desc',
        timeframe: '24h',
      },
      cursor: '',
    },
  });

  const searchRes = http.post(`${BASE_URL}/pools/search`, searchPayload, params);

  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
