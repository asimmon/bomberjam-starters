const { ACTION_STRINGS, ACTION_SIZE } = require("../src/game-constants");

class RandomBot {
    getAction(state, myPlayerId) {
        return ACTION_STRINGS[Math.floor(Math.random() * ACTION_SIZE)];
    }
}

module.exports = {
    RandomBot
}