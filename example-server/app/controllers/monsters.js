'use strict'

const { Monster } = require("../models/monsters.js");
const { serializeMonster } = require("../serializers/monsters.js");

async function listMonsters(request, reply) {
  reply.type('application/json').code(200);
  const serializedMonsters = [];
  for (let monster of Monster.list()) {
    serializedMonsters.push(serializeMonster(monster));
  }
  return serializedMonsters;
}

async function getMonster(request, reply) {
  const monster = Monster.get(request.params.id);
  reply.type('application/json').code(200);
  return serializeMonster(monster);
}

async function createMonster(request, reply) {
  const { name, type, age, anthropomorpicness } = request.body;
  const monster = await Monster.createMonster(
      name, type, parseInt(age), parseInt(anthropomorpicness));
  reply.type('application/json').code(200);
  return serializeMonster(monster);
}

async function updateMonster(request, reply) {
  const monster = Monster.get(request.params.id);
  monster.update(request.body);
  reply.type('application/json').code(200);
  return serializeMonster(monster);
}

module.exports = {
  listMonsters, getMonster, createMonster, updateMonster
}
