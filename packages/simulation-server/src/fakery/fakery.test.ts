import * as t from 'io-ts';
import * as fc from 'fast-check';
import { getArbitrary } from './arbitrary';
import { date } from '../io-ts/date';

describe('fakery', () => {
  fc.configureGlobal({ seed: 0, numRuns: 5 });

  it('should generate the same object sample with the same seed', () => {
    const model = t.type({
      firstName: t.string,
      lastName: t.string,
      email: t.string,
      status: t.union([t.literal('active'), t.literal('inactive')]),
      updatedat: date,
    });

    const arbritaries = fc.sample(getArbitrary(model));

    // for (const a of arbritaries) {
    //   console.dir(a);
    // }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete arbritaries[0].updatedat;

    expect(arbritaries[0]).toEqual({
      firstName: 'Reanna',
      lastName: 'Quigley',
      email: 'Tod_Botsford42@hotmail.com',
      status: 'inactive',
    });
  });
});
