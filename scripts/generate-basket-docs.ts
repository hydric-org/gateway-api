import * as fs from 'fs';
import * as path from 'path';
import { BasketId } from '../src/core/enums/token/basket-id.enum';

function generateBasketDocs() {
  const basketIds = Object.values(BasketId);

  // Sort alphabetically for consistency
  basketIds.sort((a, b) => a.localeCompare(b));

  const comment = '[comment]: <> (This file is auto-generated. Do not modify manually. Changes will be overwritten.)';
  const header = '| Basket ID |\n| :--- |';

  const rows = basketIds.map((id) => {
    return `| ${id} |`;
  });

  return [comment, '', header, ...rows].join('\n');
}

// Check if running directly
if (require.main === module) {
  const output = generateBasketDocs();
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
