import * as t from 'io-ts';

const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UUIDBrand {
  readonly UUID: unique symbol;
}

export type uuid = t.Branded<string, UUIDBrand>;

export const uuid = t.brand(t.string, (s): s is uuid => regex.test(s), 'UUID');
