const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// import helpers
const logger = require('./helpers/logger');

// import utils
const GameManager = require('./utils/game-manager');
const ComputerPlayer = require('./utils/computer-player');

// import custom routes
const gameRouter = require('./routes/game.router');

// import custom middlewares
const errorHandler = require('./middlewares/error-handler');

// other imports
const { gameTypes } = require('./utils/enums');

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '/config', 'development.env') });
}

// setup common middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// connect to mongoose
mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.print('successfully connect to mongodb');
  })
  .catch((err) => {
    logger.print(`unable to connect to mongodb with message ${err.message}`);
  });

// setup custom routes
app.use('/api/v1/games', gameRouter);

// setup error middleware
app.use(errorHandler);

// start server
server.listen(process.env.PORT, () => {
  if (NODE_ENV !== 'production') console.clear();
  logger.print(`server started on port ${process.env.PORT}`);
});

// setup websocket server
const gameManager = new GameManager();

function sendGameStart(pin) {
  io.to(pin).emit('game start');
}

function sendGameData(pin, data) {
  io.to(pin).emit('game data', data);
}

function sendGameEnd(pin, game) {
  io.to(pin).emit('game ended', { game });
}

io.on('connection', (socket) => {
  socket.on('join creator', async ({ pin, playerId, joinComputer = false }) => {
    socket.join(pin);
    try {
      await gameManager.joinCreator(pin, playerId, socket.id);
      logger.print(`creator ${socket.id} has joined`);

      if (joinComputer) {
        const computerPlayer = new ComputerPlayer();
        computerPlayer.start();

        setTimeout(() => {
          computerPlayer.join(pin);
          gameManager.registerComputer(pin, computerPlayer);
        }, 50);
      }
    } catch (error) {
      logger.error(`error while joining creator : ${error.message}`);
      logger.logStack(error);
    }
  });

  socket.on('join opponent', async ({ pin, type }) => {
    socket.join(pin);
    try {
      const {
        success,
        message,
        player,
        ...data
      } = await gameManager.joinOpponent(pin, type, socket.id);
      if (success) {
        logger.print(`opponent ${socket.id} has joined`);

        socket.emit('opponent joined', { player });
        setTimeout(() => {
          sendGameStart(pin);
          setTimeout(() => {
            sendGameData(pin, data);
          }, 50);
        }, 50);
      } else {
        socket.emit('notification', { message });
      }
    } catch (error) {
      logger.error(`error joining opponent : ${error.message}`);
    }
  });

  socket.on('play', async ({ pin, choice, playerId }) => {
    logger.print(
      `received choice ${choice.value} from ${playerId} for game ${pin}`
    );
    try {
      const { end, ...data } = gameManager.play(pin, choice, playerId);

      if (end) {
        logger.print(`game ${pin} will end`);
        const game = await gameManager.endGame(pin);
        sendGameEnd(pin, game);
      } else {
        sendGameData(pin, data);
      }
    } catch (error) {
      logger.error(error.message);
    }
  });

  socket.on('disconnect', async () => {
    logger.print(`player ${socket.id} has leaved`);

    try {
      const pin = await gameManager.disconnect(socket.id);
      if (pin) {
        const game = await gameManager.endGame(pin);
        sendGameEnd(pin, game);
        if (game.type === gameTypes.PLAYERVSCOMPUTER) {
          gameManager.disconnectComputerPlayer(pin);
        }
      }
    } catch (error) {
      logger.error(error.message);
    }
  });
});
