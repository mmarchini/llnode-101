'use strict';

function serializeMonster(monster) {
  const { id, name, type, age, anthropomorpicness, spookiness }  = monster;
  return { id, name, type, age, anthropomorpicness, spookiness };
}

module.exports = { serializeMonster };
