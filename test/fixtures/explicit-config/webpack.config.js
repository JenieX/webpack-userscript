const path = require('path')
const WebpackTampermonkey = require('../../..')

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'output'),
    filename: 'index.js'
  },
  plugins: [
    new WebpackTampermonkey({
      headers: {
        name: 'Explicit Test',
        version: '2.0.0',
        match: 'https://google.com/*',
        grant: [
          'GM_setValue',
          'GM_getValue'
        ]
      },
      pretty: false
    })
  ]
}
