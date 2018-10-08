'use strict';

const app = new Vue({
  el: '#app', // equivalent to mount
  data: {
    monsters: [],
    newMonster: { name: "", type: "", age: null, anthropomorpicness: 100 },
  },
  methods: {
    refreshMonsters: async function () {
      this.monsters = (await (await fetch("/monster/")).json()).map((monster) => {
        monster.isEditing = false;
        return monster;
      });
      console.log(this.monsters);
    },
    createMonster: async function () {
      await fetch("/monster/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(this.newMonster),
      });
      this.newMonster = { name: "", type: "", age: null, anthropomorpicness: 100 };
      this.refreshMonsters();
    },
    updateMonster: async function (monster) {
      await fetch(`/monster/${monster.id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(monster)
      });
      this.refreshMonsters();
    },
  },
});
