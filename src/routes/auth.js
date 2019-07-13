import { Router } from 'express'
import jwt from 'jsonwebtoken'
import VError from 'verror'
import * as R from 'ramda'
import bcrypt from 'bcrypt'

import { JWT_SECRET } from '../config'
import { Admin, User, Question } from '../models'
import { responseError } from '../middlewares/error'
import { closeAfterDeadline } from '../middlewares/deadline'
import { createJsonResponse } from '../utils/helpers'
import { getFacebookUser } from '../utils/facebook'

const router = Router()

export function pickUser(user) {
  return R.pick(['_id', 'facebook', 'status'], user.toObject())
}

export function pickAdminUser(admin) {
  return R.pick(['_id'], admin)
}

router.post('/login', closeAfterDeadline, async (req, res, next) => {
  const { accessToken } = req.body

  if (!accessToken) {
    return responseError(res, 'not token provided')
  }

  try {
    // request public profile from facebook
    const fbUser = await getFacebookUser(accessToken)

    let user = await User.findOne({
      facebook: fbUser.id,
    })

    if (!user) {
      const questions = new Question()
      const question = await questions.save()

      const newUser = new User({
        facebook: fbUser.id,
        questions: question._id,
        status: 'in progress',
        firstNameEN: fbUser.first_name,
        lastNameEN: fbUser.last_name,
        email: fbUser.email,
      })

      user = await newUser.save()
    }

    // sign token with _id, facebook, status
    const token = jwt.sign(pickUser(user.toObject), JWT_SECRET)

    return res.json(
      createJsonResponse('success', {
        token,
      }),
    )
  } catch (e) {
    return next(new VError(e, '/login'))
  }
})

router.post('/login/admin', async (req, res, next) => {
  const { username, password } = req.body

  if (!username) {
    return responseError(res, 'not username provided')
  }

  if (!password) {
    return responseError(res, 'not password provided')
  }

  try {
    const admin = await Admin.findOne({
      username,
    }).select('password')

    if (!admin) {
      return responseError(res, 'authentication fail')
    }

    const isMatch = bcrypt.compareSync(password, admin.password)

    if (isMatch) {
      const token = jwt.sign(pickAdminUser(admin), JWT_SECRET)

      return res.json(
        createJsonResponse('success', {
          token,
        }),
      )
    }

    return responseError(res, 'password not match')
  } catch (e) {
    return next(new VError(e, '/login/admin'))
  }
})

export default router
