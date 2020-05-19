const StackTracey = require('stacktracey');

module.exports = {
  print: (message) => {
    console.log(`[server] ${new Date().toLocaleString()} : ${message}`);
  },
  error: (message) => {
    console.log(`[error] ${new Date().toLocaleString()} : ${message}`);
  },
  log: (data) => {
    console.log('[OBJECT_START]');
    console.log(data);
    console.log('[OBJECT_END]');
  },
  logStack: (error) => {
    const stacks = new StackTracey(error.stack);
    console.log(
      `[stack] ${new Date().toLocaleString()} : ${stacks[0].beforeParse}`
    );
  },
};
