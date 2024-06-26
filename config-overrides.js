const path = require('path');

module.exports = function override(config, env) {
  config.entry = {
    main: ['./src/index.js'],
    // background: './src/background.js',
    contentScript: './src/content/contentScript.js'
  };
  config.output = {
    ...config.output,
    filename: 'static/js/[name].js'
  };

  return config;
};