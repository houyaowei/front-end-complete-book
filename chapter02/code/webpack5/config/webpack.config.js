const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'development',
  entry: {
    index: './src/scripts/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'all',
          name: 'commons',
        }
      },
      //最小的文件大小 超过之后将不予打包
      minSize: {
        javascript: 0,
        style: 0,
      },
      //最大的文件 超过之后继续拆分
      maxSize: {
        javascript: 1, //故意写小的效果更明显
        style: 3000,
      }
    }
  }
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