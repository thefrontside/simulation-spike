import * as t from 'io-ts';
import jwt from 'jsonwebtoken';
import { uuid } from '../../io-ts/uuid';
import { generateUUID4 } from '../../fakery/fakery';
import { Simulator, Store } from '../../types';

const TokenModel = t.type({
  id: uuid,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  status: t.union([t.literal('active'), t.literal('inactive')]),
  token: t.string,
});

type Token = t.TypeOf<typeof TokenModel>;

const Pluralize = {
  Token: 'tokens',
} as const;

export type Authh0Types = Token;

export const tokenStore: { tokens: Token[] } = {
  tokens: [],
};

const auth0Schema = {
  Token: TokenModel,
};

type Auth0Keys = keyof typeof auth0Schema;

export const auth0Factory = (): Simulator<'auth0'> => {
  return {
    uuid: generateUUID4(),
    tag: 'auth0',
    thingMap: {
      User: 'Token',
    },
    getIntermediateType<K>(k: K) {
      switch (k) {
        case ('Token' as unknown) as K:
          return TokenModel;
        default:
          throw new Error(`unknown auth0 type ${k}`);
      }
    },
    getTypes() {
      return auth0Schema;
    },
    create<T>(tag: Auth0Keys, attributes: Authh0Types): T {
      attributes.token = jwt.sign(
        {
          user_id: `auth0|${attributes.email}`,
        },
        'auth0-mock',
      );

      tokenStore[Pluralize[tag]].push(attributes);

      return (attributes as unknown) as T;
    },
    store: ({
      clear() {
        tokenStore.tokens = [];
      },
      getAll(): unknown[] {
        return (tokenStore.tokens as unknown) as Token[];
      },
    } as unknown) as Store,
  };
};
