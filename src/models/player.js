const mongoose = require('mongoose');
const uuid = require('uuid');

const { choiceTypes, playerTypes } = require('../utils/enums');

const { Schema } = mongoose;

const choiceSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid.v1(),
    },
    value: Number,
    current: Number,
    type: {
      type: String,
      enum: Object.values(choiceTypes),
      default: choiceTypes.INITIAL,
    },
  },
  {
    timestamps: true,
  }
);

const playerSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid.v1(),
    },
    type: {
      type: String,
      enum: Object.values(playerTypes),
      default: playerTypes.HUMAN,
    },
    sessionId: String,
    username: String,
    avatar: String,
    creator: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: Boolean,
      default: false,
    },
    choices: [choiceSchema],
  },
  {
    timestamps: true,
  }
);

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

module.exports = { Player };
