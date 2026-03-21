import "dotenv/config";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs } from "./graphql/typeDefs.js";
import { Resolvers } from "./graphql/resolvers.js";
import { trace } from "console";

const app = express();

// allowed origin
const allowedOrigins = [
  "http://localhost:4000",
  "https://studio.apollographql.com",
  "http://192.168.0.243:4000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow request with no origin. Requests from allowed origins
    // or requests coming from ngork tunnel
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.includes("ngrok-free.app") || 
      origin.includes("ngrok-free.dev") || 
      origin.includes("ngrok.io"))
    {
      callback(null, trace);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

const server = new ApolloServer({
  typeDefs,
  resolvers: Resolvers,
});

await server.start();

app.use("/graphql", expressMiddleware(server));

app.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
});
