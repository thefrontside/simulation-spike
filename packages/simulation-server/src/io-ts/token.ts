import { string, brand, Branded } from 'io-ts';

export interface TokenBrand {
  readonly Token: unique symbol;
}

const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const token = brand(
  string,
  (n): n is Branded<string, TokenBrand> => typeof n === 'string' && re.test(n),
  'Token',
);
