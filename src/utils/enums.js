// game enums
const gameTypes = {
  PLAYERVSPLAYER: 'PLAYERVSPLAYER',
  PLAYERVSCOMPUTER: 'PLAYERVSCOMPUTER',
};

const gameStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  ENDED: 'ENDED',
};

// player types
const playerTypes = {
  HUMAN: 'HUMAN',
  COMPUTER: 'COMPUTER',
};

// player choice enums
const choiceTypes = {
  INITIAL: 'initial',
  DIVIDER: 'diviseur',
  MULTIPLE: 'multiple',
};

module.exports = {
  gameTypes,
  gameStatus,
  choiceTypes,
  playerTypes,
};
