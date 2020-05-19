const mongoose = require('mongoose');
const uuid = require('uuid');

const { gameStatus, gameTypes } = require('../utils/enums');

const { Schema } = mongoose;

const gameSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid.v1(),
    },
    status: {
      type: String,
      enum: Object.values(gameStatus),
      default: gameStatus.PENDING,
    },
    type: {
      type: String,
      enum: Object.values(gameTypes),
      default: gameTypes.PLAYERVSPLAYER,
    },
    pin: String,
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

module.exports = { Game };
