const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
  template: './demo/index.html',
  filename: './index.html',
});

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './demo/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [htmlPlugin],
};
