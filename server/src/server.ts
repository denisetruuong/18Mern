import express from "express";
import path from "node:path";
import db from "./config/connection.js";
import routes from "./routes/index.js";
import { ApolloServer } from "apollo-server-express";
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.use(routes);

db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

const startApolloServer = async (typeDefs: any, resolvers: any) => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    console.log(`Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startApolloServer(typeDefs, resolvers);
