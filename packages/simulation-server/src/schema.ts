import { makeSchema } from '@nexus/schema';
import { basename, join } from 'path';
import * as types from './nexus-types/simulation';
import * as scalars from './scalars/key-value-pair';

const cwd = process.cwd();

export const schema = makeSchema({
  shouldGenerateArtifacts: basename(__dirname) !== 'dist',
  types: { ...scalars, ...types },
  outputs: {
    schema: join(__dirname, '../__generated__/schema.graphql'),
    typegen: join(__dirname, '../__generated__/schema.types.d.ts'),
  },
  typegenAutoConfig: {
    contextType: 'ctx.SimulationContext',
    sources: [
      {
        alias: 'ctx',
        source: join(cwd, 'dist/context/SimulationContext.d.ts'),
      },
      {
        alias: 'scalars',
        source: join(cwd, 'dist/scalars/key-value-pair.d.ts'),
      },
      {
        alias: 'types',
        source: join(cwd, 'dist/types.d.ts'),
      },
    ],
  },
});
