import { Token } from './token';
import { isRight, isLeft } from 'fp-ts/lib/Either';

describe('Token', () => {
  it('should decode a valid Token', () => {
    const token = Token.decode({
      id: '5cc170e4-b4aa-457b-b7de-06b177ad02ca',
      email: 'bob@gmail.com',
      status: 'active',
      token: 'blah',
    });

    expect(isRight(token)).toBe(true);
  });

  it('should fail an invalid token', () => {
    const token = Token.decode({
      id: 'no-no-no',
      email: 'bob@gmail.com',
      status: 'active',
      token: 'blah',
    });

    expect(isLeft(token)).toBe(true);
  });
});
