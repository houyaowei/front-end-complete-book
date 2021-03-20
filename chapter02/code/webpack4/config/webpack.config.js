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
  }
}