import type { Config as ApolloServerConfig } from 'apollo-server-core';
import type { SimulationsState } from '../types';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { schema } from '../schema';
import { SimulationContext } from '../context/SimulationContext';
import { addRoutes } from '../simulators/auth0/auth0-routes';
import { main } from '@effection/node';
import { createAtom } from '@bigtest/atom';
import { schema as gatewaySchema, createContext } from 'fake-api';
import { db } from '../simulators/gateway/gatewaySimulator';
import { createStatePublisher } from '../state-publisher/state-publisher';
import { spawn } from 'effection';

// import helmet from 'helmet';
// import * as fc from 'fast-check';

// fc.configureGlobal({ seed: 0 });

const initialState: SimulationsState = {
  simulations: {},
};

export const ApolloServerDefaults: Pick<ApolloServerConfig, 'playground' | 'introspection' | 'subscriptions'> = {
  playground: true,
  introspection: true,
  subscriptions: false,
};

const port = process.env.PORT || 3000;

const createGatewayContext = createContext.bind(undefined, db);

main(function* () {
  const atom = createAtom(initialState);

  const publisher = createStatePublisher(atom);

  const simulationContext = new SimulationContext(atom, publisher);

  yield spawn(publisher.start());

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

  // app.use(helmet());

  app.use((_, res, next) => {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  addRoutes(atom)(app);

  controlServer.applyMiddleware({ app });
  gatewayServer.applyMiddleware({ app, path: '/gateway/:simulation_id' });

  app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
});
