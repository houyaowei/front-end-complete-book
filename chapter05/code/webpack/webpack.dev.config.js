const webpack = require("webpack");
const HTMLWebpachPlugin = require("html-webpack-plugin");
const  path = require("path")
module.exports = {
  entry: "./src/app.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  devServer: {
    port: 9003,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins:[
    new HTMLWebpachPlugin({
      title: "hc-portal-fe",
      template: "./src/index.html",
    }),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dist/manifest.json')
    }),
  ]
};
