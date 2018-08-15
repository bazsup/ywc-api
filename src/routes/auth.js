import {Router} from "express"
import jwt from "jsonwebtoken"
import config from "config"
import VError from "verror"
import {pick} from "lodash"

import {User, Question} from "../models"
import {isAuthenticated} from "../middlewares"
import {closeAfterDeadline} from "../middlewares/deadline"
import {createJsonResponse, getFacebookUser} from "../utils"

const router = Router()

router.post("/login", closeAfterDeadline, async (req, res, next) => {
  const {accessToken} = req.body

  if (!accessToken) {
    return next(new Error("not token provided"))
  }

  try {
    // request public profile from facebook
    const fbUser = await getFacebookUser(accessToken)

    let user = await User.findOne({facebook: fbUser.id})

    if (!user) {
      const questions = new Question()
      const question = await questions.save()

      const newUser = new User({
        facebook: fbUser.id,
        questions: question._id,
        status: "in progress",
        firstNameEN: fbUser.first_name,
        lastNameEN: fbUser.last_name,
        email: fbUser.email,
      })

      user = await newUser.save()
    }

    // sign token with _id, facebook, status
    const token = jwt.sign(
      pick(user.toObject(), ["_id", "facebook", "status"]),
      config.JWT_SECRET,
    )

    return res.json(
      createJsonResponse("success", {
        token,
      }),
    )
  } catch (e) {
    return next(new VError(e, "/login"))
  }
})

// TODO: router.post("/login/admin", adminLogin)

export default router
