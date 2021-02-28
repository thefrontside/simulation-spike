import { assert } from 'assert-ts';
import { GraphQLObjectType } from 'graphql';
import * as t from 'io-ts';
import { uuid } from '../../io-ts/uuid';
import { date } from '../../io-ts/date';
import { Simulator, Store } from '../../types';
import { schema, DB } from 'fake-api';
import { filterNexusQueryFromSchema } from './getSchemaFromNexus';
import { v4 } from 'uuid';
import { generateUUID4 } from '../../fakery/fakery';

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

export const db = new DB(() => generateUUID4());

export const gatewayFactory = (): Simulator<'gateway'> => {
  return {
    status: { kind: 'IDLE' },
    uuid: v4(),
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
    store: (db as unknown) as Store,
  };
};
