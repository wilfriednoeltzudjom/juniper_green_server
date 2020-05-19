const playerService = require('../services/player.service');
const gameService = require('../services/game.service');

const { gameStatus, playerTypes } = require('../utils/enums');

const logger = require('../helpers/logger');

class GameManager {
  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.playedValues = new Map();
    this.computerPlayers = new Map();
  }

  async joinCreator(pin, playerId, sessionId) {
    await playerService.updatePlayer(playerId, { sessionId });
    this.players.set(sessionId, { pin, playerId, type: 'creator' });
    this.playedValues.set(pin, []);
  }

  async joinOpponent(pin, type, sessionId) {
    const game = await gameService.findGame({ pin });
    if (game.status === gameStatus.RUNNING)
      return { success: false, message: 'Game already running' };

    const player = await playerService.createPlayer({ type, sessionId });
    game.players.push(player._id);
    game.status = gameStatus.RUNNING;
    await game.save();

    const validGame = await gameService.findGame({ pin }, true);
    this.games.set(pin, validGame);
    this.players.set(sessionId, {
      pin,
      playerId: player._id,
      type: 'opponent',
    });
    logger.print(`opponent ${player._id} joined successfully`);

    return {
      success: true,
      game: validGame,
      player,
      currentPlayer: validGame.players[0].uuid,
      currentValue: -1,
      playedValues: [],
    };
  }

  play(pin, choice, playerId) {
    const game = this.games.get(pin);
    if (!game) throw new Error(`game ${pin} has not been initialized`);
    if (game.status !== gameStatus.RUNNING)
      throw new Error(`game ${pin} has already stopped`);

    if (choice.value === -1) {
      game.players = game.players.map((player) => {
        if (player._id.toString() === playerId.toString()) {
          player.choices.push(choice);
        } else {
          player.winner = true;
        }

        return player;
      });
      this.games.set(pin, game);

      return { end: true, game: { ...game } };
    }

    const currentValue = choice.value;
    const playedValues = this.playedValues.get(pin);
    playedValues.push(currentValue);

    let currentPlayer;
    game.players = game.players.map((player) => {
      if (player._id.toString() === playerId.toString()) {
        player.choices.push(choice);
      } else {
        currentPlayer = player.uuid;
      }

      return player;
    });
    this.games.set(pin, game);

    return { end: false, currentValue, currentPlayer, game, playedValues };
  }

  async disconnect(sessionId) {
    const player = this.players.get(sessionId);
    if (!player) {
      throw new Error(`session ${sessionId} has not been registered`);
    }

    const { pin, playerId, type } = player;
    this.play(pin, { value: -1 }, playerId);

    return pin;
  }

  async endGame(pin) {
    const game = this.games.get(pin);
    this.games.forEach((value, key) => console.log(key));
    if (!game) throw new Error(`game ${pin} has not been initialized`);

    const tasks = [];
    game.players.forEach((player) => {
      tasks.push(player.save());
    });
    await Promise.all(tasks);

    game.players = game.players.map((player) => player._id);
    game.status = gameStatus.ENDED;
    await game.save();

    this.games.delete(pin);
    this.playedValues.delete(pin);

    const validGame = await gameService.findGame({ pin }, true);

    return validGame;
  }

  registerComputer(pin, computerPlayer) {
    this.computerPlayers.set(pin, computerPlayer);
  }

  disconnectComputerPlayer(pin) {
    const computerPlayer = this.computerPlayers.get(pin);
    if (computerPlayer) {
      computerPlayer.disconnect();
      this.computerPlayers.delete(pin);
    }
  }
}

module.exports = GameManager;
