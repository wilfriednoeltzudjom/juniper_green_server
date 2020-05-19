const io = require('socket.io-client');

const { playerTypes, choiceTypes } = require('../utils/enums');

const logger = require('../helpers/logger');

class ComputerPlayer {
  constructor() {
    this.socket = null;
    this.player = null;
    this.game = null;
    this.playedValues = [];
  }

  start() {
    this.socket = io.connect(process.env.HOST, {
      forceNew: true,
    });

    this.socket.on('opponent joined', ({ player }) => {
      this.player = player;
    });

    this.socket.on(
      'game data',
      ({ currentValue, currentPlayer, game, playedValues }) => {
        this.game = game;
        this.playedValues = playedValues;

        if (currentPlayer === this.player.uuid) {
          let value = -1;
          let multiple = false;
          for (let i = 1; i < 100; i += 1) {
            if (!this.playedValues.includes(i)) {
              if (i % currentValue === 0) {
                value = i;
              } else if (currentValue % i === 0) {
                value = i;
                multiple = true;
              }
            }
          }
          setTimeout(() => {
            this.socket.emit('play', {
              pin: this.game.pin,
              choice: {
                value,
                current: currentValue,
                type: multiple ? choiceTypes.MULTIPLE : choiceTypes.DIVIDER,
              },
              playerId: this.player._id,
            });
          }, 2 * 1000);
        }
      }
    );

    this.socket.on('game ended', ({ game }) => {
      logger.print(`computer received game ${game.pin} end`);
    });
  }

  join(pin) {
    this.socket.emit('join opponent', { pin, type: playerTypes.COMPUTER });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      logger.print('computer disconnected');
    }
  }
}

module.exports = ComputerPlayer;
