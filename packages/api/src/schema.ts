import { makeSchema } from '@nexus/schema';
import path from 'path';
import * as types from './types/User';

const cwd = process.cwd();

const schema = makeSchema({
  shouldGenerateArtifacts: path.basename(__dirname) !== 'dist',
  types,
  outputs: {
    schema: path.join(__dirname, '../__generated__/schema.graphql'),
    typegen: path.join(__dirname, '../__generated__/schema.types.d.ts'),
  },
  typegenAutoConfig: {
    contextType: 'ctx.Context',
    sources: [
      {
        alias: 'ctx',
        source: path.join(cwd, 'dist/context/types.d.ts'),
      },
    ],
  },
});

export default schema;
