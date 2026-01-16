import * as fs from 'fs';
import * as path from 'path';
import { ChainIdUtils } from '../src/core/enums/chain-id';

function generateChainDocs() {
  const chainIds = ChainIdUtils.values();

  // Sort by name for better readability
  chainIds.sort((a, b) => {
    const nameA = ChainIdUtils.chainName[a] || '';
    const nameB = ChainIdUtils.chainName[b] || '';
    return nameA.localeCompare(nameB);
  });

  const header = '| Chain Name | Chain ID |\n| :--- | :--- |';

  const rows = chainIds.map((chainId) => {
    const name = ChainIdUtils.chainName[chainId];
    return `| ${name} | ${chainId} |`;
  });

  return [header, ...rows].join('\n');
}

// Check if running directly
if (require.main === module) {
  const output = generateChainDocs();
  // If an output path is provided as argument
  if (process.argv[2]) {
    const outputPath = process.argv[2];
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Documentation generated at ${outputPath}`);
  } else {
    console.log(output);
  }
}
