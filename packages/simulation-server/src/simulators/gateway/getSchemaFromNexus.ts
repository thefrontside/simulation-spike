import { GraphQLSchema } from 'graphql';
import { NexusGraphQLSchema } from '@nexus/schema/dist/core';

export const filterNexusQueryFromSchema = (schema: NexusGraphQLSchema): GraphQLSchema => {
  const types = Object.values(schema.getTypeMap()).filter((type) => {
    if (['Query', 'Mutation'].includes(type.name)) {
      return false;
    }
    return true;
  });

  return new GraphQLSchema({
    ...schema.toConfig(),
    types,
  });
};
