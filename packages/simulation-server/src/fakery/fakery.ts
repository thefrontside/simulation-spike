import faker from 'faker';
import * as fc from 'fast-check';
import { loremIpsum } from 'lorem-ipsum';
import dayjs, { OpUnitType } from 'dayjs';

export const stringProps = {
  firstname: faker.name.firstName,
  middlename: faker.name.firstName,
  lastname: faker.name.lastName,
  name: faker.name.findName,
  phone: faker.phone.phoneNumber,
  email: faker.internet.email,
  initials: faker.address.countryCode,
  avatarurl: faker.internet.avatar,
  username: faker.internet.userName,
  companyname: faker.company.companyName,
  zippostalcode: faker.address.zipCode,
};

const dateRangePast = (unit: OpUnitType) => (): fc.Arbitrary<Date> =>
  fc.date({
    min: dayjs().subtract(80, unit).toDate(),
    max: dayjs().subtract(20, unit).toDate(),
  });

const dateRangeFuture = (unit: OpUnitType) => (): fc.Arbitrary<Date> =>
  fc.date({
    min: dayjs().add(20, unit).toDate(),
    max: dayjs().subtract(80, unit).toDate(),
  });

const dateProps = {
  startdate: dateRangeFuture('days'),
  createdon: dateRangePast('months'),
  createdat: dateRangePast('months'),
  updatedat: dateRangePast('months'),
  dateofbirth: dateRangePast('years'),
  enddate: dateRangeFuture('months'),
  lastloginat: dateRangePast('days'),
  date: dateRangePast('months'),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fakerToArb = <T>(fakerGenerator: any): fc.Arbitrary<T> => {
  return fc
    .integer()
    .noBias()
    .noShrink()
    .map((seed) => {
      faker.seed(seed);
      return fakerGenerator();
    });
};

export const generateUUID4 = (): string => fc.sample(fc.uuidV(4), 1)[0] as string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loremIpsumArb = (): fc.Arbitrary<any> =>
  fc
    .infiniteStream(fc.double().noBias())
    .noShrink()
    .map((s) => {
      const rng = () => s.next().value; // prng like Math.random but controlled by fast-check
      return loremIpsum({ random: rng });
    });

export const generateSmartArbitrary = <T extends string | Date>(
  smarts: typeof stringProps | typeof dateProps,
  noMatch: () => fc.Arbitrary<T>,
) => (property: string): fc.Arbitrary<T> => {
  const prop = property.toLowerCase();
  const candidate = Object.keys(smarts)
    .map((k) => k.toLowerCase())
    .find((k) => prop.includes(k));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return candidate ? fakerToArb(() => (smarts as any)[candidate]()) : noMatch();
};

export const generateStringArbitrary = generateSmartArbitrary(stringProps, loremIpsumArb);

export const generateDateArbitrary = (property: string): fc.Arbitrary<Date> => {
  const prop = property.toLowerCase();
  const candidate = Object.keys(dateProps)
    .map((k) => k.toLowerCase())
    .find((k) => prop.includes(k));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return candidate ? (dateProps as any)[candidate]() : dateRangePast('months');
};
