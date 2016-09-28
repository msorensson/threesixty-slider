var path = require('path');

module.exports = {
  entry: {
    'threesixty.jquery': './src/threesixty.jquery.js'
  },

  output: {
    filename: '[name].min.js',
    path: path.join(__dirname, '/dist'),
    publicPath: '',
    libraryTarget: 'umd'
  }
};
