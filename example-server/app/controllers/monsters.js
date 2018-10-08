'use strict'

const { Monster } = require("../models/monsters.js");
const { serializeMonster } = require("../serializers/monsters.js");

function listMonsters(request, reply) {
  reply.type('application/json').code(200);
  const serializedMonsters = [];
  for (let monster of Monster.list()) {
    serializedMonsters.push(serializeMonster(monster));
  }
  reply.send(serializedMonsters);
}

function getMonster(request, reply) {
  const monster = Monster.get(request.params.id);
  reply.type('application/json').code(200);
  reply.send(serializeMonster(monster));
}

function createMonster(request, reply) {
  const { name, type, age, anthropomorpicness } = request.body;
  reply.type('application/json').code(200);
  Monster.createMonster(
      name, type, parseInt(age), parseInt(anthropomorpicness)).then((monster) => {
    reply.send(serializeMonster(monster));
  });
}

function updateMonster(request, reply) {
  const monster = Monster.get(parseInt(request.params.id));
  if (monster == undefined) {
    reply.type('application/json').code(404);
    return reply.send({});
  }
  monster.update(request.body);
  reply.type('application/json').code(200);
  reply.send(JSON.stringify(monster));
}

module.exports = {
  listMonsters,
  getMonster,
  createMonster,
  updateMonster
}
