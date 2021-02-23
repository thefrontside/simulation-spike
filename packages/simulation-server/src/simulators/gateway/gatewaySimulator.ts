import type { Database } from 'fake-api';
import { assert } from 'assert-ts';
import { GraphQLObjectType } from 'graphql';
import * as t from 'io-ts';
import { uuid } from '../../io-ts/uuid';
import { date } from '../../io-ts/date';
import { Simulator, Store } from '../../types';
import { schema, db } from 'fake-api';
import { filterNexusQueryFromSchema } from './getSchemaFromNexus';
import { generateUUID4 } from '../../fakery/fakery';
import { fullUrl } from '../../utils/url';

const PrimitiveMap = {
  String: t.string,
  Float: t.number,
  Boolean: t.boolean,
  Int: t.number,
  ID: uuid,
  Date: date,
  DateTime: date,
  Email: t.string,
};

type GraphQlPrimitive = keyof typeof PrimitiveMap;

export const getStore = (): Database => {
  return db;
};

export const gatewayFactory = (): Simulator<'gateway'> => {
  return {
    status: { kind: 'IDLE' },
    uuid: generateUUID4(),
    tag: 'gateway',
    thingMap: {
      Token: 'User',
    },
    getTypes() {
      return filterNexusQueryFromSchema(schema).getTypeMap();
    },
    getIntermediateType(tag: string) {
      const graphqlType: GraphQLObjectType | undefined = this.getTypes()?.[tag];

      assert(!!graphqlType, `Entity ${tag} not found`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attributes: Record<string, t.Type<any>> = {};

      for (const [fieldName, fieldValue] of Object.entries(graphqlType.getFields())) {
        const graphQlType = fieldValue.type.toString().replace(/!/, '') as GraphQlPrimitive;

        const iosType = PrimitiveMap[graphQlType];

        if (!iosType) {
          // console.log(`no type found for field ${fieldName}`);
          continue;
        }

        attributes[fieldName] = iosType;
      }

      return t.type(attributes);
    },
    create<T>(tag: string, attributes: T): T {
      const graphqlType: GraphQLObjectType | undefined = this.getTypes()?.[tag];

      assert(!!graphqlType, `Entity ${tag} not found`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.store?.create(tag, attributes as any);
    },
    // purely for testing
    store: (getStore() as unknown) as Store,
  };
};
