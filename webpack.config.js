var path = require('path');

module.exports = {
  entry: {
    'threesixty': './src/threesixty.js'
  },

  output: {
    filename: '[name].min.js',
    path: path.join(__dirname, '/dist'),
    publicPath: '',
    libraryTarget: 'umd'
  }
};
