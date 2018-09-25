'use strict';

const app = require('fastify')();

const memoryLeaker = require('./utils/memory-leaker');
app.get('/memory-leak/', function memoryLeakHandler(req, res) {
  memoryLeaker.run();
  res.send({});
});

const crasher = require('./utils/crasher');
app.get('/uncaught-exceptions/', function uncaughtExceptionHandler(req, res) {
  crasher.run();
  res.send({});
});

app.get('/infinite-loop/', function infiniteLoopHandler(req, res) {
  while (true) {};
  res.send({});
});

// TODO
// app.get('/native-crash/', function nativeCrashHandler(req, res) {
//     res.send({});
// });

app.listen(3000, () => { console.log('Running server on localhost:3000'); });
