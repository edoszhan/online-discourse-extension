const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');

// Load environment variables
const env = dotenv.config().parsed;

module.exports = function override(config, env = dotenv.config().parsed) {

  config.entry = {
    main: ['./src/index.js'],
    contentScript: './src/content/contentScript.js',
    extractionScript: './src/extraction/extractionScript.js',
    background: './src/background.js'
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
        {
        from: path.resolve(__dirname, 'src/components/level1/ReviewPage.css'),
          to: path.resolve(__dirname, 'build/static/css/ReviewPage.css'),
        },
        {
          from: path.resolve(__dirname, 'src/assets/icon_cat.png'),
          to: path.resolve(__dirname, 'build/static/media/icon_cat.png'),
        },
        {
          from: path.resolve(__dirname, 'src/assets/icon_duck.png'),
          to: path.resolve(__dirname, 'build/static/media/icon_duck.png'),
        },
        {
          from: path.resolve(__dirname, 'src/assets/icon_fox.png'),
          to: path.resolve(__dirname, 'build/static/media/icon_fox.png'),
        },
      ],
    })
  )(config);

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env),
    })
  );

  config.module.rules.push({
    test: /\.(png|jpe?g|gif)$/i,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'static/media',
        },
      },
    ],
  });

  return config;
};

