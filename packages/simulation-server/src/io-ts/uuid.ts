import { string, brand, Branded } from 'io-ts';

export interface UUIDBrand {
  readonly UUID: unique symbol;
}

const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuid = brand(string, (n): n is Branded<string, UUIDBrand> => typeof n === 'string' && re.test(n), 'UUID');
