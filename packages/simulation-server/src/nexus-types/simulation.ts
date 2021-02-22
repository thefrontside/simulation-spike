import {
  objectType,
  mutationType,
  enumType,
  stringArg,
  intArg,
  arg,
  idArg,
  inputObjectType,
  list,
  nonNull,
} from '@nexus/schema';
import { KeyValuePair } from '../scalars';

export const Simulation = objectType({
  name: 'Simulation',
  definition(t) {
    t.string('uuid');
    t.string('name');
  },
});

export const SimulationResult = objectType({
  name: 'SimulationResult',
  definition(t) {
    t.string('message');
    t.boolean('success');
  },
});

export const CreateResult = objectType({
  name: 'CreateResult',
  definition(t) {
    t.string('message');
    t.boolean('success');
    t.field('attributes', { type: KeyValuePair });
  },
});

export const AvailableSimulators = enumType({
  name: 'AvailableSimulators',
  members: ['gateway', 'auth0'],
});

export const CreateSimulationResult = inputObjectType({
  name: 'CreateSimulationResult',
  definition(t) {
    t.string('uuid');
  },
});

export const createSimulation = mutationType({
  definition(t) {
    t.field('createSimulation', {
      type: 'Simulation',
      args: {
        name: nonNull(stringArg()),
        simulators: nonNull(
          list(
            arg({
              type: 'AvailableSimulators',
            }),
          ),
        ),
        timeToLiveInMS: intArg(),
      },
      async resolve(_, { name, simulators, timeToLiveInMS }, ctx) {
        return await ctx.createSimulation(name, simulators, timeToLiveInMS);
      },
    });
    t.field('create', {
      type: 'CreateResult',
      args: {
        simulationID: nonNull(idArg()),
        simulator: nonNull(arg({ type: 'AvailableSimulators' })),
        type: nonNull(stringArg()),
        attributes: arg({ type: KeyValuePair }),
      },
      async resolve(_, { simulationID, simulator, type, attributes }, ctx) {
        return ctx.create({ simulationID, simulator, type, attributes });
      },
    });
  },
});
