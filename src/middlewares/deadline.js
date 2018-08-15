import moment from "moment"

import {deadline} from "../config"

export const closeAfterDeadline = (req, res, next) => {
  if (moment().isAfter(deadline)) {
    const err = new Error("registration is now closed")
    return next(err)
  }
  return next()
}
