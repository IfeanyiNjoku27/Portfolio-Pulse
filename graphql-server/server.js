import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './graphql/typeDefs.js';
import { Resolvers } from './graphql/resolvers.js';

const app = express();

// Apply middleware 
app.use(cors());
app.use(bodyParser.json());

const server = new ApolloServer({
  typeDefs,
  resolvers: Resolvers, 
});

await server.start();

app.use('/graphql', expressMiddleware(server));

app.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
});