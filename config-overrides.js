const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
  
  config = addWebpackPlugin(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/components/CommentSection/CommentSection.css'),
          to: path.resolve(__dirname, 'build/static/css/CommentSection.css'),
        },
        {
          from: path.resolve(__dirname, 'src/components/CommentThread/CommentThread.css'),
          to: path.resolve(__dirname, 'build/static/css/CommentThread.css'),
        },
        {
          from: path.resolve(__dirname, 'src/components/CommentBox/CommentBox.css'),
          to: path.resolve(__dirname, 'build/static/css/CommentBox.css'),
        },
        {
        from: path.resolve(__dirname, 'src/components/img/default-avatar-2.png'),
          to: path.resolve(__dirname, 'build/static/media/default-avatar-2.png'),
        },
      ],
    })
  )(config);

  return config;
};
