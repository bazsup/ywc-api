import http from 'http'

import app from '../app'

require('babel-polyfill')

const PORT = process.env.PORT || 3000

const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
