const express = require('express');

const gameService = require('../services/game.service');

const router = express.Router();

router.get('/pin-verification', (req, res, next) => {
  gameService
    .verifyPin(req.query)
    .then((game) => res.json(game))
    .catch((err) => next(err));
});

router.post('/', (req, res, next) => {
  gameService
    .createGame(req.body)
    .then((game) => res.status(201).json(game))
    .catch((err) => next(err));
});

module.exports = router;
