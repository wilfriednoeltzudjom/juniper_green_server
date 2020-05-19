const { Player } = require('../models/player');

const dataHelper = require('../helpers/data');

const { playerTypes } = require('../utils/enums');
const { ResourceNotFoundError } = require('../utils/errors');

const createPlayer = async (data = {}) => {
  const { type } = data;
  const player = new Player({
    ...data,
    username: dataHelper.generateUsername(),
  });
  if (type === playerTypes.HUMAN) {
    player['avatar'] = dataHelper.generateAvatarForHuman();
  } else if (type === playerTypes.COMPUTER) {
    player['avatar'] = dataHelper.generateAvatarForComputer();
  }
  await player.save();

  return player;
};

const findPlayer = async (query = {}) => {
  const player = await Player.findOne(query);
  if (!player)
    throw new ResourceNotFoundError(
      `Player not found : ${JSON.stringify(query)}`
    );
  return player;
};

const updatePlayer = async (playerId, updates) => {
  const player = await Player.updateOne(
    {
      _id: playerId,
    },
    { $set: updates }
  );
};

module.exports = {
  createPlayer,
  findPlayer,
  updatePlayer,
};
