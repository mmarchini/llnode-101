'use strict';

const { spookiness } = require("../utils/spookiness.js");
const monsters_list = new Map();

class Monster {
  update({ name, type }) {
    // Keep changes history
    const saveState = {... this}
    if (this._previousState)
      this._previousState._nextState = saveState;
    saveState._nextState = this;
    this._previousState = saveState;

    this.name = name;
    this.type = name;
  }

  static async createMonster(name, type, age, anthropomorpicness) {
    const monster = new Monster();
    monster.id = monsters_list.size + 1;

    monster.name = name;
    monster.type = type;
    monster.age = age;
    monster.anthropomorpicness = anthropomorpicness;

    monster.spookiness = await spookiness(age, anthropomorpicness);
    monsters_list.set(monster.id, monster);
    monster._previousState = undefined;
    monster._nextState = undefined;
    return monster;
  }

  static list() {
    return monsters_list.values();
  }

  static get(monsterId) {
    return monsters_list.get(monsterId);
  }
}

module.exports = { Monster };
