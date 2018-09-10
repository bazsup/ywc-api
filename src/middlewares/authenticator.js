import jwt from "jsonwebtoken"
import config from "config"
import VError from "verror"

import {respondError, responseError} from "../middlewares/error"
import {User, Admin} from "../models"

export const authen = (type = "any") => async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"]
    const user = jwt.verify(token, config.JWT_SECRET)

    if (!user) {
      return responseError(res, "not authorized")
    }

    const userObj = await User.findOne({_id: user._id})
    if (
      type === "any" ||
      type === userObj.status ||
      type.indexOf(userObj.status) !== -1
    ) {
      req.user = user
      return next()
    }

    return responseError(res, "not authorized")
  } catch (e) {
    return next(new VError(e, "authen middlewares: on %s", req.originalUrl))
  }
}

export const adminAuthen = (role = "any") => async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"]
    const admin = jwt.verify(token, config.JWT_SECRET)
    if (!admin) return respondErrors(res)("Not Authorize")
    const adminObj = await Admin.findOne({_id: admin._id})
    if (
      role === "any" ||
      role === adminObj.role ||
      role.indexOf(adminObj.role) !== -1
    ) {
      req.admin = adminObj
      return next()
    }
    return res.error("Not Authorize")
  } catch (e) {
    return respondErrors(res)(e)
  }
}

export const isAuthenticated = (req, res, next) => {
  const token = req.headers["x-access-token"]
  const user = jwt.verify(token, config.JWT_SECRET)
  if (!user) return respondErrors(res)("Not Authorize")
  req.user = user
  return next()
}

export const isInterviewMember = async (req, res, next) => {
  try {
    const {user} = req

    if (user.status === "interview1" || user.status === "interview2") {
      next()
    } else {
      respondErrors(res)({code: 403, message: "Forbidden"})
    }
  } catch (err) {
    respondErrors(res)(err)
  }
}

export const afterAnnounce = async (req, res, next) => {
  const announceTime = new Date(2016, 10, 16, 19, 0, 0)

  if (Date.now() < announceTime.getTime()) {
    respondErrors(res)({code: 403, message: "Forbidden"})
  } else {
    next()
  }
}

// export default authenticator;
