const { Game } = require('../models/game');

const dataHelper = require('../helpers/data');
const playerService = require('./player.service');

const { BadRequestError, ResourceNotFoundError } = require('../utils/errors');
const { gameStatus, playerTypes } = require('../utils/enums');

const verifyPin = async ({ pin }) => {
  if (!pin) throw new BadRequestError('Pin is required');
  const game = await Game.findOne({ pin, status: gameStatus.PENDING }).populate(
    'players'
  );
  if (!game)
    throw new ResourceNotFoundError(`Game ${pin} not found or already closed`);

  return game;
};

const findGame = async (query, populate = false) => {
  const game = await (populate
    ? Game.findOne(query).populate('players')
    : Game.findOne(query));
  if (!game)
    throw new ResourceNotFoundError(
      `Game not found : ${JSON.stringify(query)}`
    );
  return game;
};

const createGame = async ({ type }) => {
  const player = await playerService.createPlayer({
    creator: true,
    type: playerTypes.HUMAN,
  });
  const game = new Game({
    players: [player._id],
    type,
    pin: dataHelper.generateGamePin(),
  });
  await game.save();

  const savedGame = await findGame({ _id: game._id }, true);

  return {
    player,
    game: savedGame,
  };
};

module.exports = {
  verifyPin,
  createGame,
  findGame,
};
