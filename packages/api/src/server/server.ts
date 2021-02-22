import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import schema from '../schema';
import { createContext } from '../context/context';
import { db } from '../db/database';

const getContext = createContext.bind(undefined, db);

const server = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  context: getContext,
});

const app = express();

server.applyMiddleware({ app });

const port = process.env.PORT || 4000;

app.listen({ port }, () => {
  console.log(`GraphQL API ready at: http://localhost:${port}/graphql`);
});
