'use strict';


const { registerRoutes } = require("./app/routes.js");

const app = require('fastify')();
const path = require('path');

registerRoutes(app);

process.on("unhandledRejection", (error, p) => {
  throw reason;
});
app.setErrorHandler((error, request, reply) => {
  throw reason;
});

app.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
});

app.listen(3000, '0.0.0.0', () => { console.log('Running server on localhost:3000'); });
