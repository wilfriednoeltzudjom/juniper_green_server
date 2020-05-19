const { USERNAMES, AVATARS, ROBOTS } = require('../data');

const generateUsername = () => {
  const partOne = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
  const partTwo = String(Date.now()).split('').reverse().slice(0, 3).join('');

  return partOne + partTwo;
};

const generateGamePin = () => {
  const letters = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
  const numbers = String(Date.now());
  const pin = [];

  for (let i = 0; i < 6; i += 1) {
    if (i % 2 === 0) {
      pin.push(numbers[Math.floor(Math.random() * numbers.length)]);
    } else {
      pin.push(letters[Math.floor(Math.random() * letters.length)]);
    }
  }

  return pin.join('').toUpperCase();
};

const generateAvatarForHuman = () => {
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  return `https://api.adorable.io/avatars/face/${avatar}`;
};

const generateAvatarForComputer = () => {
  const robot = ROBOTS[Math.floor(Math.random() * ROBOTS.length)];
  return `https://robohash.org/${robot}.png`;
};

module.exports = {
  generateUsername,
  generateGamePin,
  generateAvatarForComputer,
  generateAvatarForHuman,
};
