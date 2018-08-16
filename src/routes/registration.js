import {Router} from "express"
import VError from "verror"
import moment from "moment"
import {isArray} from "lodash"
import EmailValidator from "email-validator"

import {createJsonResponse} from "../utils/helpers"
import {authen} from "../middlewares/authenticator"
import {closeAfterDeadline} from "../middlewares/deadline"
import {emptyValidator} from "../middlewares/validator"
import {ROLE_IN_PROGRESS, ROLE_COMPLETED} from "../utils/const"
import {User, Question} from "../models"
import {generalQuestionSize, majorQuestionSize} from "../config"

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

    if (
      ["programming", "design", "content", "marketing"].indexOf(major) === -1
    ) {
      return next(new VError("invalid major: got %s", major))
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
  emptyValidator([
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
  ]),
  async (req, res, next) => {
    if (!moment(req.body.birthdate).isValid()) {
      return next(new Error("invalid birthdate"))
    }

    req.body.birthdate = moment.utc(req.body.birthdate).toDate()

    try {
      const {_id} = req.user
      const user = await User.findOne({_id})

      req.fields.forEach((field) => {
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
  emptyValidator([
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
  ]),
  async (req, res, next) => {
    if (!EmailValidator.validate(req.body.email)) {
      return next(new Error("invalid email format"))
    }

    try {
      const {_id} = req.user
      const user = await User.findOne({_id})

      req.fields.forEach((field) => {
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
  emptyValidator(["knowCamp", "activities"]),
  async (req, res, next) => {
    try {
      const {_id} = req.user
      const user = await User.findOne({_id})

      req.fields.forEach((field) => {
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
  async (req, res, next) => {
    if (!isArray(req.body.answers)) {
      return next(new Error("answers is not the array"))
    }

    if (req.body.answers.length !== generalQuestionSize) {
      return next(new Error("invalid array size"))
    }

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
  async (req, res, next) => {
    if (!isArray(req.body.answers)) {
      return next(new Error("answers is not the array"))
    }

    try {
      const {answers} = req.body
      const {_id} = req.user

      const user = await User.findOne({_id}).select("questions major")
      const question = await Question.findOne({_id: user.questions})

      if (!user.major) {
        return next(new Error("major is not selected"))
      }

      if (answers.length !== majorQuestionSize[user.major]) {
        return next(new Error("invalid array size"))
      }

      question.confirmedMajor = user.major
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

      if (!user.major) {
        return next(new Error("major is not selected"))
      }

      if (user.major !== question.confirmedMajor) {
        return next(new Error("major questions are not submited"))
      }

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
