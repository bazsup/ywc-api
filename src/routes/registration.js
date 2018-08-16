import {Router} from "express"
import VError from "verror"

import {createJsonResponse} from "../utils/helpers"
import {authen} from "../middlewares/authenticator"
import {closeAfterDeadline} from "../middlewares/deadline"
import {validateRegistrationStep} from "../middlewares/validator"
import {ROLE_IN_PROGRESS, ROLE_COMPLETED} from "../utils/const"
import {User, Question} from "../models"

const router = Router()

router.put(
  "/major",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    const {_id} = req.user
    const {major} = req.body

    if (!major) {
      return next(new Error("major can't be empty"))
    }

    if (["programming", "design", "content", "marketing"].indexOf(major) === -1) {
      return next(new VError("invalid major got %s", major))
    }

    try {
      const user = await User.findOne({_id})
      user.major = major

      await user.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/major"))
    }
  },
)

router.put(
  "/info",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  validateRegistrationStep[0],
  async (req, res, next) => {
    try {
      const {_id} = req.user
      const user = await User.findOne({_id})
      const fields = [
        "title",
        "firstName",
        "lastName",
        "firstNameEN",
        "lastNameEN",
        "nickname",
        "faculty",
        "department",
        "academicYear",
        "university",
        "sex",
        "birthdate",
        "religion",
        "blood",
        "picture",
      ]

      fields.forEach((field) => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/info"))
    }
  },
)

router.put(
  "/contact",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  validateRegistrationStep[1],
  async (req, res, next) => {
    try {
      const {_id} = req.user
      const user = await User.findOne({_id})
      const fields = [
        "address",
        "province",
        "postalCode",
        "email",
        "phone",
        "emergencyPhone",
        "emergencyPhoneRelated",
        "emergencyName",
        "shirtSize",
        "food",
        "disease",
        "med",
        "foodAllergy",
        "medAllergy",
        "otherContact",
      ]

      fields.forEach((field) => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/contact"))
    }
  },
)

router.put(
  "/insight",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  validateRegistrationStep[2],
  async (req, res, next) => {
    try {
      const {_id} = req.user
      const user = await User.findOne({_id})
      const fields = ["knowCamp", "activities"]

      fields.forEach((field) => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/insight"))
    }
  },
)

router.put(
  "/general",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  validateRegistrationStep[3],
  async (req, res, next) => {
    try {
      const {answers} = req.body
      const {_id} = req.user

      const user = await User.findOne({_id}).select("questions")
      const questions = await Question.findOne({_id: user.questions})

      questions.generalQuestions = answers.map((answer) => ({answer}))
      await questions.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/general"))
    }
  },
)

router.put(
  "/special",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  validateRegistrationStep[4],
  async (req, res, next) => {
    try {
      const {answers} = req.body
      const {_id} = req.user

      const user = await User.findOne({_id}).select("questions")
      const question = await Question.findOne({_id: user.questions})

      if (!user.major) {
        return next(new Error("major is not selected"))
      }

      question.majorQuestions = answers.map((answer) => ({answer}))

      await question.save()

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/major"))
    }
  },
)

router.post(
  "/confirm",
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    try {
      const {_id} = req.user
      const user = await User.findOne({_id}).populate("questions")
      const question = await Question.findOne({_id: user.questions._id})

      question.confirmedMajor = user.major
      user.status = ROLE_COMPLETED
      user.completed_at = new Date()

      await Promise.all([user.save(), question.save()])

      return res.send(createJsonResponse("success"))
    } catch (e) {
      return next(new VError(e, "/registration/confirm"))
    }
  },
)

export default router
