import express from 'express'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import logger from 'morgan'
import lusca from 'lusca'
import flash from 'express-flash'
import mongoose from 'mongoose'
import cors from 'cors'
import expressValidator from 'express-validator'

import routes from './routes'
import { errorHandler } from './middlewares/error'

let mongoURL = process.env.MONGODB_URI

console.log('connecting to', mongoURL)

mongoose.connect(mongoURL, {
  useMongoClient: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
})
mongoose.connection.on('error', err => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.',
  )
  console.error('Error', err)
  process.exit(1)
})

const app = express()

app.use(compression())
app.use(logger('dev'))
app.use(
  bodyParser.json({
    extended: true,
    limit: '6mb',
  }),
)
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '6mb',
  }),
)
app.use(expressValidator())
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'SESSION_SECRET',
    cookie: {
      maxAge: 60000,
    },
  }),
)

app.use(flash())
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.disable('etag')
app.use(cors())

app.use('/', routes)

// Error handling
app.use(errorHandler)

export default app
