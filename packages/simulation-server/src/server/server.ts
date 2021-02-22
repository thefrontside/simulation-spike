import type { Config as ApolloServerConfig } from 'apollo-server-core';
import type { SimulationsState } from '../types';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { schema } from '../schema';
import { SimulationContext } from '../context/SimulationContext';
import { addRoutes } from '../simulators/auth0/auth0-routes';
import { run } from 'effection';
import { createAtom } from '@bigtest/atom';
import { spawn } from 'effection';
import { schema as gatewaySchema, createContext } from 'fake-api';
import { getStore } from '../simulators/gateway/gatewaySimulator';
import { createStatePublisher } from '../state-publisher/state-publisher';

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

run(function* () {
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
});
