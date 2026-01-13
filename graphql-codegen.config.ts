import { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const config: CodegenConfig = {
  schema: process.env.INDEXER_URL,
  overwrite: true,
  documents: ['./src/infrastructure/graphql/queries/*.graphql'],
  generates: {
    './src/gen/graphql.gen.ts': {
      plugins: ['typescript', 'typescript-graphql-request', 'typescript-operations'],
    },
  },
  config: {
    extractAllFieldsToTypes: true,
    scalars: {
      pooltype: '@core/enums/pool/pool-type#PoolType',
      Bytes: 'string',
      numeric: 'string',
      BigInt: 'string',
      ID: 'string',
    },
    documentMode: 'documentNode',
  },
  ignoreNoDocuments: false,
};

export default config;
