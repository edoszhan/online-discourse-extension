const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');

// Load environment variables
const env = dotenv.config().parsed;
console.log('Environment variables:', env);

module.exports = function override(config, env = dotenv.config().parsed) {
  console.log('Override function called with env:', env);

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
      ],
    })
  )(config);

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env),
    })
  );

  return config;
};


// const path = require('path');
// const { override, addWebpackPlugin } = require('customize-cra');
// const webpack = require('webpack');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
// const dotenv = require('dotenv');

// // Load environment variables
// const env = dotenv.config().parsed;
// console.log('Loaded .env variables:', env);

// module.exports = override(
//   (config, buildEnv) => {
//     console.log('Build environment:', buildEnv);
//     console.log('Initial process.env.REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);

//     // Ensure existing process.env values are not overwritten
//     const envKeys = Object.keys(env).reduce((prev, next) => {
//       prev[`process.env.${next}`] = JSON.stringify(env[next]);
//       return prev;
//     }, {});

//     // Add custom environment variables
//     config.plugins.push(
//       new webpack.DefinePlugin({
//         ...envKeys,
//         'process.env.REACT_APP_BACKEND_URL': JSON.stringify(process.env.REACT_APP_BACKEND_URL),
//       })
//     );

//     console.log('Updated process.env.REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);

//     // Other customizations
//     config.entry = {
//       main: ['./src/index.js'],
//       contentScript: './src/content/contentScript.js',
//       extractionScript: './src/extraction/extractionScript.js',
//       background: './src/background.js'
//     };
//     config.output = {
//       ...config.output,
//       filename: 'static/js/[name].js'
//     };
//     config.devtool = 'source-map';
//     config.optimization.minimize = false;

//     config = addWebpackPlugin(
//       new webpack.SourceMapDevToolPlugin({
//         filename: '[file].map',
//         exclude: ['vendor.js'],
//       })
//     )(config);

//     config = addWebpackPlugin(
//       new CopyWebpackPlugin({
//         patterns: [
//           { from: path.resolve(__dirname, 'src/components/CommentSection/CommentSection.css'), to: path.resolve(__dirname, 'build/static/css/CommentSection.css') },
//           { from: path.resolve(__dirname, 'src/components/CommentThread/CommentThread.css'), to: path.resolve(__dirname, 'build/static/css/CommentThread.css') },
//           { from: path.resolve(__dirname, 'src/components/CommentBox/CommentBox.css'), to: path.resolve(__dirname, 'build/static/css/CommentBox.css') },
//           { from: path.resolve(__dirname, 'src/components/img/default-avatar-2.png'), to: path.resolve(__dirname, 'build/static/media/default-avatar-2.png') },
//           { from: path.resolve(__dirname, 'src/components/level1/ReviewPage.css'), to: path.resolve(__dirname, 'build/static/css/ReviewPage.css') },
//         ],
//       })
//     )(config);

//     return config;
//   }
// );



