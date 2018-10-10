'use strict';

const { registerRoutes } = require("./app/routes.js");

const app = require("fastify")({ logger: true });
const path = require('path');

registerRoutes(app);

app.setErrorHandler((error, request, reply) => {
  if (reply.res.statusCode == 404) return true;
  process.abort();
});
process.on("unhandledRejection", (error, p) => {
  process.abort();
});

app.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
});

app.listen(3000, '0.0.0.0');
