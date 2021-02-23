import { objectType, mutationType, enumType, stringArg, intArg, arg, idArg, list, nonNull } from '@nexus/schema';
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

export const SimulatorStatus = objectType({
  name: 'SimulatorStatus',
  definition(t) {
    t.field('kind', {
      type: 'String',
    });
    t.string('status');
  },
});

export const CreateSimulationResult = objectType({
  name: 'CreateSimulationResult',
  definition(t) {
    t.string('uuid');
    t.field('simulators', {
      type: list('SimulatorStatus'),
    });
  },
});

export const createSimulation = mutationType({
  definition(t) {
    t.field('createSimulation', {
      type: 'CreateSimulationResult',
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
        uuid: stringArg(),
      },
      async resolve(_, { name, simulators, uuid, timeToLiveInMS }, ctx) {
        return await ctx.createSimulation(name, simulators, uuid, timeToLiveInMS);
      },
    });
    t.field('create', {
      type: 'CreateResult',
      args: {
        simulationID: nonNull(idArg()),
        simulator: nonNull(arg({ type: 'AvailableSimulators' })),
        kind: nonNull(stringArg()),
        attributes: arg({ type: KeyValuePair }),
      },
      async resolve(_, { simulationID, simulator, kind, attributes }, ctx) {
        return ctx.create({ simulationID, simulator, kind, attributes });
      },
    });
  },
});
