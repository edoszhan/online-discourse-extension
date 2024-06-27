const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = function override(config, env) {
  config.entry = {
    main: ['./src/index.js'],
    contentScript: './src/content/contentScript.js'
  };
  config.output = {
    ...config.output,
    filename: 'static/js/[name].js'
  };

  // Add source map generation
  config.devtool = 'source-map';

  // Disable minimization
  config.optimization.minimize = false;

  // Add SourceMapDevToolPlugin
  config = addWebpackPlugin(
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: ['vendor.js'],
    })
  )(config);

  return config;
};
