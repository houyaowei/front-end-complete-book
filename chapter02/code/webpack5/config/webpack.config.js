const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'development',
  entry: {
    index: [
      './src/scripts/index.js',
    ]
  },
  output: {
    filename: 'index.js'
  },
  // devServer: {
  //   contentBase: resolve('../'),
  //   host: '0.0.0.0',
  //   port: 9002,
  //   hot: true,
  //   open: false,
  //   clientLogLevel: 'silent'
  // },
  // devtool: 'source-map',
  // resolve: {
  //   alias: {
  //     '@': resolve('../src')
  //   }
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: ['@babel/preset-env']
  //         }
  //       }
  //     }
  //   ]
  // }
}