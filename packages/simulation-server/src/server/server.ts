import type { Config as ApolloServerConfig } from 'apollo-server-core';
import type { SimulationsState } from '../types';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { schema } from '../schema';
import { SimulationContext } from '../context/SimulationContext';
import { addRoutes } from '../simulators/auth0/auth0-routes';
import { main } from '@effection/node';
import { createAtom } from '@bigtest/atom';
import { spawn } from 'effection';
import { schema as gatewaySchema, createContext } from 'fake-api';
import { getStore } from '../simulators/gateway/gatewaySimulator';
import { createStatePublisher } from '../state-publisher/state-publisher';
import { subscribe } from '@effection/subscription';
import { map } from './synchronize';

const initialState: SimulationsState = {
  simulations: {},
};

export const ApolloServerDefaults: Pick<ApolloServerConfig, 'playground' | 'introspection' | 'subscriptions'> = {
  playground: true,
  introspection: true,
  subscriptions: false,
};

const port = process.env.PORT || 3000;

const createGatewayContext = createContext.bind(undefined, getStore());

main(function* () {
  const atom = createAtom(initialState);

  const publisher = createStatePublisher(atom);

  yield spawn(publisher.start());

  const simulationContext = new SimulationContext(atom, publisher);

  const controlServer = new ApolloServer({
    ...ApolloServerDefaults,
    schema,
    context: () => simulationContext,
  });

  const gatewayServer = new ApolloServer({
    ...ApolloServerDefaults,
    schema: gatewaySchema,
    context: createGatewayContext,
  });

  const app = express();

  addRoutes(app);

  controlServer.applyMiddleware({ app });
  gatewayServer.applyMiddleware({ app, path: '/gateway/:simulation_id' });

  app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });

  yield spawn(
    map(atom.slice('simulations'), function* (sim) {
      console.dir({ m: sim.get() });
      const simulation = sim.get().simulation;
      yield spawn(
        map(atom.slice('simulations', simulation.uuid, 'simulators'), function* (ul) {
          console.dir(ul.get().simulator);
          yield spawn(
            map(
              atom.slice('simulations', simulation.uuid, 'simulators', ul.get().simulator.uuid, 'things'),
              function* (a) {
                console.dir(a);
              },
            ),
          );
        }),
      );
      // yield spawn(
      //   map(atom.slice('simulations', simulation.uuid, 'simulators'), function* (s, k) {
      //     console.dir({ s, k });
      //   }),
      // );
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const subscription = yield subscribe(publisher);

  while (true) {
    const next = yield subscription.next();

    if (next.done) {
      break;
    }
  }

  console.log('heree');
});
