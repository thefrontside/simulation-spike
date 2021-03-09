import * as t from 'io-ts';
import * as fc from 'fast-check';
import { getArbitrary, createGenerateNArbitraries, GenerateNArbitraries } from './arbitrary';
import { date } from '../io-ts/date';

describe('fakery', () => {
  let generateNArbitraries: GenerateNArbitraries;
  fc.configureGlobal({ seed: 0, numRuns: 5 });
  const model = t.type({
    firstName: t.string,
    lastName: t.string,
    email: t.string,
    status: t.union([t.literal('active'), t.literal('inactive')]),
    updatedat: date,
  });

  beforeEach(() => {
    generateNArbitraries = createGenerateNArbitraries();
  });

  it('should generate the same single object each time', () => {
    const arbritaries = generateNArbitraries(getArbitrary(model));

    // for (const a of arbritaries) {
    //   console.dir(a);
    // }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete arbritaries[0].updatedat;

    expect(arbritaries[0]).toEqual({
      firstName: 'Gerardo',
      lastName: 'Nienow',
      email: 'Lila36@hotmail.com',
      status: 'active',
    });
  });

  it('should generate new objects in a run', () => {
    const [first, second] = generateNArbitraries(getArbitrary(model), 2);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete first.updatedat;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete second.updatedat;

    expect(first).toEqual({
      firstName: 'Gerardo',
      lastName: 'Nienow',
      email: 'Lila36@hotmail.com',
      status: 'active',
    });

    expect(second).toEqual({
      firstName: 'Leonard',
      lastName: 'Hirthe',
      email: 'Edwin.Johnson11@gmail.com',
      status: 'inactive',
    });
  });

  it('should generate new objects each time', () => {
    const first = generateNArbitraries(getArbitrary(model))[0];
    const second = generateNArbitraries(getArbitrary(model))[0];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete first.updatedat;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete second.updatedat;

    expect(first).toEqual({
      firstName: 'Gerardo',
      lastName: 'Nienow',
      email: 'Lila36@hotmail.com',
      status: 'active',
    });

    expect(second).toEqual({
      email: 'Iva75@gmail.com',
      firstName: 'Electa',
      lastName: 'Wiegand',
      status: 'active',
    });
  });
});
