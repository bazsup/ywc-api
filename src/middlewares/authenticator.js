import jwt from 'jsonwebtoken'
import config from 'config'
import VError from 'verror'

import { responseError } from '../middlewares/error'
import { ROLE_ANY } from '../utils/const'
import { User, Admin } from '../models'

export const authen = (type = ROLE_ANY) => async (req, res, next) => {
  try {
    const token = req.headers['x-access-token']
    const user = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET)

    if (!user) {
      return responseError(res, 'not authorized')
    }

    const userObj = await User.findOne({ _id: user._id })
    if (
      type === ROLE_ANY ||
      type === userObj.status ||
      type.indexOf(userObj.status) !== -1
    ) {
      req.user = user
      return next()
    }

    return responseError(res, 'not authorized')
  } catch (e) {
    return next(new VError(e, 'authen middlewares: on %s', req.originalUrl))
  }
}

export const adminAuthen = (role = ROLE_ANY) => async (req, res, next) => {
  try {
    const token = req.headers['x-access-token']
    const admin = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET)

    if (!admin) {
      return responseError(res, 'not authorized')
    }

    const adminObj = await Admin.findOne({ _id: admin._id })
    if (
      role === 'any' ||
      role === adminObj.role ||
      role.indexOf(adminObj.role) !== -1
    ) {
      req.admin = adminObj
      return next()
    }

    return responseError(res, 'not authorized')
  } catch (e) {
    return next(
      new VError(e, 'admin authen middlewares: on %s', req.originalUrl),
    )
  }
}
