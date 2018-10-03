'use strict';

function serializeMonster(monster) {
  const { id, name, type, spookiness }  = monster;
  return { id, name, type, spookiness };
}

module.exports = { serializeMonster };
