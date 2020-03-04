const CopyPlugin = require('copy-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const { join } = require('path');
const { optimize } = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    contentPage: join(__dirname, 'src/contentPage.ts'),
    background: join(__dirname, 'src/background.ts')
  },
  output: {
    path: join(__dirname, '../dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use:
          'awesome-typescript-loader?{configFileName: "chrome/tsconfig.json"}'
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new CopyPlugin([
      { from: 'chrome/manifest.json', to: '../dist' },
      { from: 'chrome/images', to: '../dist' },
      { from: 'node_modules/jquery/dist/jquery.min.js', to: '../dist' }
    ]),
    new optimize.AggressiveMergingPlugin(),
    new optimize.OccurrenceOrderPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js']
  }
};
