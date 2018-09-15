import express from "express"
import compression from "compression"
import session from "express-session"
import bodyParser from "body-parser"
import logger from "morgan"
import lusca from "lusca"
import flash from "express-flash"
import mongoose from "mongoose"
import cors from "cors"
import config from "config"
import expressValidator from "express-validator"

import routes from "./routes"
import {errorHandler} from "./middlewares/error"

// const upload = multer({ dest: path.join(__dirname, 'uploads') });

mongoose.connect(
  process.env.MONGODB_URI || process.env.MONGOLAB_URI || config.MONGODB_URI,
  {
    useMongoClient: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
  },
)
mongoose.connection.on("error", () => {
  console.error(
    "MongoDB Connection Error. Please make sure that MongoDB is running.",
  )
  process.exit(1)
})

const app = express()
// ioServer.listen(process.env.IO_PORT, () => console.log(`IO Port listening on ${process.env.IO_PORT}`));
// app.start = app.listen = () => {
//   return server.listen.apply(server, arguments);
// };
app.use(compression())
app.use(logger("dev"))
app.use(bodyParser.json({extended: true, limit: "6mb"}))
app.use(bodyParser.urlencoded({extended: true, limit: "6mb"}))
app.use(expressValidator())
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || "SESSION_SECRET",
    cookie: {maxAge: 60000},
  }),
)
// app.use((req, res, next) => {
//   console.log('[' + req.path + ']', req.get('accessToken'));
//   next();
// });
app.use(flash())
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe("SAMEORIGIN"))
app.use(lusca.xssProtection(true))
app.disable("etag")
app.use(cors())
// app.use(authenticator);
app.use("/", routes)
app.use("/uploads", express.static("uploads"))

// Error handling
app.use(errorHandler)

export default app
