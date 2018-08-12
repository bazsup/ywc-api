import winston from "winston"

import {createJsonResponse} from "../utils"

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: "error.log", level: "error"}),
  ],
})

export const errorHandler = (err, req, res, next) => {
  // log message to console
  console.error("Error", err.message)

  // store error message to file on production server
  if (process.env.NODE_ENV === "production") {
    logger.log({
      level: "error",
      message: err.message,
    })
  }

  // response error with json
  res.status(500)
  res.json(
    createJsonResponse("error", {
      message: err.message,
    }),
  )
}
