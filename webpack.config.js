const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      //got this from https://github.com/chakra-ui/chakra-ui/issues/7266 to import a png for gaze tracing
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // custom loader added by me and installed using npm i file-loader
      {
        test: /\.(gif|svg|jpg|png)$/,  // add whatever files you wanna use within this regEx
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};