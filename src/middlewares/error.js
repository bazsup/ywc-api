import {createJsonResponse} from "../utils"

export const errorHandler = (err, req, res, next) => {
  res.status(500)
  res.json(createJsonResponse("error", {
    message: err.message,
  }))
}
