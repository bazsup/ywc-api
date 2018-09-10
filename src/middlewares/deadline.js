import moment from "moment"

import {responseError} from "../middlewares/error"
import {deadline} from "../config"

export const closeAfterDeadline = (req, res, next) => {
  if (moment().isAfter(deadline)) {
    return responseError(res, "registration is now closed")
  }
  return next()
}
