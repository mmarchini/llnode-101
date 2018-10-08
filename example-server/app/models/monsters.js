'use strict';

const { spookiness } = require("../utils/spookiness.js");
const monsters_list = new Map();

class Monster {
  static _copy({ name, type, age, anthropomorpicness, spookiness }) {
    const newMonster = new Monster();

    newMonster.name = name;
    newMonster.type = type;
    newMonster.age = age;
    newMonster.anthropomorpicness = anthropomorpicness;
    newMonster.spookiness = spookiness;
    newMonster._previousState = undefined;
    newMonster._nextState = undefined;

    return newMonster;
  }

  update({ name, type }) {
    // Keep changes history
    const saveState = Monster._copy(this);
    saveState.prototype = this.prototype;
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
