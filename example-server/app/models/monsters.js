'use strict';

const { spookiness } = require("../utils/spookiness.js");
const monsters_list = new Map();

class Monster {
  update({ description, is_done}) {
    this.description = description;
    this.is_done = is_done;
  }

  static async createMonster(name, type, age, anthropomorpicness) {
    const monster = new Monster();
    monster.id = monsters_list.size + 1;
    monster.name = name;
    monster.age = age;
    monster.anthropomorpicness = anthropomorpicness;
    monster.spookiness = await spookiness(age, anthropomorpicness);
    monsters_list.set(monster.id, monster);
    return monster;
  }

  static list() {
    return monsters_list.values();
  }

  static get(monsterId) {
    return monsters_list.get[monsterId];
  }
}

module.exports = { Monster };
