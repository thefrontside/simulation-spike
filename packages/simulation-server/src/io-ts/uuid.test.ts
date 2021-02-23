import { uuid } from './uuid';
import { right } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

describe('uuid', () => {
  it('should decode a valid uuid', () => {
    expect(uuid.decode('00000000-0000-0000-0000-000000000000')).toEqual(right('00000000-0000-0000-0000-000000000000'));
  });

  it('should fail validation for a non uuid', () => {
    expect(PathReporter.report(uuid.decode('not a uuid'))).toEqual(['Invalid value "not a uuid" supplied to : UUID']);
  });
});
