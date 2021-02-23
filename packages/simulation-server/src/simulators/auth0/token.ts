import * as t from 'io-ts';
import { uuid } from '../../io-ts/uuid';

const Token = t.type({
  id: uuid,
  email: t.string,
  status: t.union([t.literal('active'), t.literal('inactive')]),
  token: t.string,
});

type Token = t.TypeOf<typeof Token>;

export { Token };
