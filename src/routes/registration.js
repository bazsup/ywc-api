import { Router } from 'express'
import VError from 'verror'
import moment from 'moment'
import EmailValidator from 'email-validator'

import { responseError } from '../middlewares/error'
import { createJsonResponse } from '../utils/helpers'
import { authen } from '../middlewares/authenticator'
import { closeAfterDeadline } from '../middlewares/deadline'
import { emptyValidator } from '../middlewares/validator'
import { ROLE_IN_PROGRESS, ROLE_COMPLETED } from '../utils/const'
import { User, Question } from '../models'
import { generalQuestionSize, majorQuestionSize } from '../config'

const router = Router()

router.put(
  '/major',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    const { _id } = req.user
    const { major } = req.body

    if (!major) {
      return responseError(res, "major can't be empty")
    }

    if (
      ['programming', 'design', 'content', 'marketing'].indexOf(major) === -1
    ) {
      return next(new VError('invalid major: got %s', major))
    }

    try {
      const user = await User.findOne({ _id })
      user.major = major

      await user.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/major'))
    }
  },
)

router.put(
  '/info',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  emptyValidator([
    'title',
    'firstName',
    'lastName',
    'firstNameEN',
    'lastNameEN',
    'nickname',
    'faculty',
    'department',
    'academicYear',
    'university',
    'sex',
    'birthdate',
    'religion',
    'blood',
    'picture',
    'educationStatus',
    'equivalentEducationDegree',
    'currentWorkingStatus',
    'workingStatusDescription',
  ]),
  async (req, res, next) => {
    if (!moment(req.body.birthdate).isValid()) {
      return responseError(res, 'invalid birthdate')
    }

    req.body.birthdate = moment.utc(req.body.birthdate).toDate()

    try {
      const { _id } = req.user
      const user = await User.findOne({ _id })

      req.fields.forEach(field => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/info'))
    }
  },
)

router.put(
  '/contact',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  emptyValidator([
    'address',
    'province',
    'postalCode',
    'email',
    'phone',
    'emergencyPhone',
    'emergencyPhoneRelated',
    'emergencyName',
    'shirtSize',
    'food',
    'disease',
    'med',
    'foodAllergy',
    'medAllergy',
    'skype',
  ]),
  async (req, res, next) => {
    if (!EmailValidator.validate(req.body.email)) {
      return responseError(res, 'invalid email format')
    }

    try {
      const { _id } = req.user
      const user = await User.findOne({ _id })

      req.fields.forEach(field => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/contact'))
    }
  },
)

router.put(
  '/insight',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  emptyValidator(['knowCamp', 'activities']),
  async (req, res, next) => {
    try {
      const { _id } = req.user
      const user = await User.findOne({ _id })

      req.fields.forEach(field => {
        user[field] = req.body[field]
      })

      await user.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/insight'))
    }
  },
)

router.put(
  '/general',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    if (!Array.isArray(req.body.answers)) {
      return responseError(res, 'answers is not the array')
    }

    if (req.body.answers.length !== generalQuestionSize) {
      return responseError(res, 'invalid array size')
    }

    try {
      const { answers } = req.body
      const { _id } = req.user

      const user = await User.findOne({ _id }).select('questions')
      const questions = await Question.findOne({ _id: user.questions })

      questions.generalQuestions = answers.map(answer => ({ answer }))
      await questions.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/general'))
    }
  },
)

router.put(
  '/special',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    if (!Array.isArray(req.body.answers)) {
      return responseError(res, 'answers is not the array')
    }

    try {
      const { answers } = req.body
      const { _id } = req.user

      const user = await User.findOne({ _id }).select('questions major')
      const question = await Question.findOne({ _id: user.questions })

      if (!user.major) {
        return responseError(res, 'major is not selected')
      }

      if (answers.length !== majorQuestionSize[user.major]) {
        return responseError(res, 'invalid array size')
      }

      question.confirmedMajor = user.major
      question.majorQuestions = answers.map(answer => ({ answer }))

      await question.save()

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/major'))
    }
  },
)

router.post(
  '/confirm',
  closeAfterDeadline,
  authen(ROLE_IN_PROGRESS),
  async (req, res, next) => {
    try {
      const { _id } = req.user
      const user = await User.findOne({ _id }).populate('questions')
      const question = await Question.findOne({ _id: user.questions._id })

      if (!user.major) {
        return responseError(res, 'major is not selected')
      }

      if (user.major !== question.confirmedMajor) {
        return responseError(res, 'major questions are not submited')
      }

      user.status = ROLE_COMPLETED
      user.completed_at = new Date()

      await Promise.all([user.save(), question.save()])

      return res.send(createJsonResponse('success'))
    } catch (e) {
      return next(new VError(e, '/registration/confirm'))
    }
  },
)

export default router
