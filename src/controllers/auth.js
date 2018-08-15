import jwt from "jsonwebtoken"
import fb from "fb"
import _ from "lodash"
import config from "config"
import bcrypt from "bcrypt"

import {respondResult, respondErrors} from "../utils"
import {User, Question, Slip, Admin} from "../models"

// login with facebook and generate jwt
export const login = async (req, res) => {
  const {accessToken} = req.body
  if (!accessToken) return respondErrors(res)("Not token provide")

  try {
    // request public profile from facebook
    const fbUser = await new Promise((resolve, reject) => {
      fb.napi(
        "/me",
        {
          fields: "id,first_name,last_name,email",
          access_token: accessToken,
        },
        (err, data) => (err ? reject(err) : resolve(data)),
      )
    })
    let user = await User.findOne({facebook: fbUser.id})
    if (!user) {
      const questions = new Question()
      const q = await questions.save()
      const newUser = new User({
        facebook: fbUser.id,
        questions: q._id,
        completed: [...new Array(5)].map((_) => false),
        status: "in progress",
        firstNameEN: fbUser.first_name,
        lastNameEN: fbUser.last_name,
        email: fbUser.email,
      })
      user = await newUser.save()
    }
    const token = jwt.sign(
      _.pick(user.toObject(), ["_id", "facebook", "status"]),
      config.JWT_SECRET,
    )
    return res.send({token})
  } catch (e) {
    return respondErrors(res)(e.message)
  }
}

export const adminLogin = async (req, res) => {
  try {
    req
      .checkBody("username", "Invalid username")
      .notEmpty()
      .isString()
    req
      .checkBody("password", "Invalid password")
      .notEmpty()
      .isString()
    req.sanitizeBody("username").toString()
    req.sanitizeBody("password").toString()
    const errors = req.validationErrors()
    if (errors) return res.error(errors)
    const {username, password} = req.body
    const admin = await Admin.findOne({username}).select("password")
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password)
      if (isMatch) {
        const token = jwt.sign(
          _.pick(admin.toObject(), ["username", "_id"]),
          config.JWT_SECRET,
        )
        return res.send({token})
      }
    }
    return res.error("Fail to Login")
  } catch (e) {
    return res.error(e)
  }
}
