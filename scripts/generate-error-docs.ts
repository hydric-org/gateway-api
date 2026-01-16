import * as fs from 'fs';
import * as path from 'path';
import { ApiErrorCode, ApiErrorCodeUtils } from '../src/lib/api/error/api-error-codes';

function generateErrorDocs() {
  const errorCodes = Object.keys(ApiErrorCodeUtils.toStatusCode) as Exclude<ApiErrorCode, 'HTTP_EXCEPTION'>[];

  errorCodes.sort();

  const comment = '[comment]: <> (This file is auto-generated. Do not modify manually. Changes will be overwritten.)';
  const header = '| Error Code | Status | Title | Description |\n| :--- | :--- | :--- | :--- |';

  const rows = errorCodes.map((code) => {
    const status = ApiErrorCodeUtils.toStatusCode[code];
    const title = ApiErrorCodeUtils.toTitle[code];
    const description = ApiErrorCodeUtils.toDescription[code];

    return `| \`${code}\` | ${status} | ${title} | ${description} |`;
  });

  return [comment, '', header, ...rows].join('\n');
}

// Check if running directly
if (require.main === module) {
  const output = generateErrorDocs();
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
