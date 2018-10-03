const { listMonsters, getMonster, createMonster, updateMonster } = require("./controllers/monsters.js");

function registerRoutes(app) {
  app.get('/monster/', listMonsters);
  app.get('/monster/:id/', getMonster);
  app.post('/monster/', createMonster);
  app.put('/monster/:id/', updateMonster);
}

module.exports = {
  registerRoutes
};
