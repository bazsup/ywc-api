import expressValidator from "express-validator"
import moment from "moment"
import _ from "lodash"

export const validator = () =>
  expressValidator({
    customValidators: {
      isArray: (target) => _.isArray(target),
      isMajor: (target) =>
        _.includes(["programming", "design", "content", "marketing"], target),
    },
  })

export const validateRegistrationStep = [
  (req, res, next) => {
    req.checkBody("title", "Invalid").notEmpty()
    req.checkBody("firstName", "Invalid").notEmpty()
    req.checkBody("lastName", "Invalid").notEmpty()
    req.checkBody("firstNameEN", "Invalid").notEmpty()
    req.checkBody("lastNameEN", "Invalid").notEmpty()
    req.checkBody("nickname", "Invalid").notEmpty()
    req.checkBody("faculty", "Invalid").notEmpty()
    req.checkBody("department", "Invalid").notEmpty()
    req.checkBody("academicYear", "Invalid").notEmpty()
    req.checkBody("university", "Invalid").notEmpty()
    req.checkBody("sex", "Invalid").notEmpty()
    req.checkBody("religion", "Invalid").notEmpty()
    req.checkBody("blood", "Invalid").notEmpty()

    req.sanitizeBody("title").toString()
    req.sanitizeBody("firstName").toString()
    req.sanitizeBody("lastName").toString()
    req.sanitizeBody("firstNameEN").toString()
    req.sanitizeBody("lastNameEN").toString()
    req.sanitizeBody("nickname").toString()
    req.sanitizeBody("faculty").toString()
    req.sanitizeBody("department").toString()
    req.sanitizeBody("academicYear").toString()
    req.sanitizeBody("university").toString()
    req.sanitizeBody("sex").toString()
    req.sanitizeBody("religion").toString()
    req.sanitizeBody("blood").toString()

    if (!moment(req.body.birthdate).isValid()) {
      return next(new Error("invalid birthdate"))
    }

    req.body.birthdate = moment.utc(req.body.birthdate).toDate()

    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    return next()
  },
  (req, res, next) => {
    // STEP 2 Form Validation
    req.checkBody("address", "Invalid").notEmpty()
    req.checkBody("province", "Invalid").notEmpty()
    req.checkBody("postalCode", "Invalid").notEmpty()
    req
      .checkBody("email", "Invalid")
      .notEmpty()
      .isEmail()
    req.checkBody("phone", "Invalid").notEmpty()
    req.checkBody("emergencyPhone", "Invalid").notEmpty()
    req.checkBody("emergencyPhoneRelated", "Invalid").notEmpty()
    req.checkBody("emergencyName", "Invalid").notEmpty()
    req.checkBody("shirtSize", "Invalid").notEmpty()
    req.checkBody("food", "Invalid").notEmpty()
    // req.checkBody('disease', 'Invalid').notEmpty();
    // req.checkBody('med', 'Invalid').notEmpty();
    req.checkBody("foodAllergy", "Invalid").notEmpty()
    req.checkBody("skype", "Invalid").notEmpty()
    // req.checkBody('medAllergy', 'Invalid').notEmpty();

    req.sanitizeBody("address").toString()
    req.sanitizeBody("province").toString()
    req.sanitizeBody("postalCode").toString()
    req.sanitizeBody("email").toString()
    req.sanitizeBody("phone").toString()
    req.sanitizeBody("emergencyPhone").toString()
    req.sanitizeBody("emergencyPhoneRelated").toString()
    req.sanitizeBody("emergencyName").toString()
    req.sanitizeBody("shirtSize").toString()
    req.sanitizeBody("food").toString()
    req.sanitizeBody("disease").toString()
    req.sanitizeBody("med").toString()
    req.sanitizeBody("foodAllergy").toString()
    req.sanitizeBody("medAllergy").toString()
    req.sanitizeBody("skype").toString()

    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    return next()
  },
  (req, res, next) => {
    req.checkBody("activities", "Invalid").notEmpty()

    req.sanitizeBody("activities").toString()

    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    return next()
  },
  (req, res, next) => {
    // STEP 4: General question
    req.checkBody("answers", "Invalid").isArray()

    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    if (req.body.answers.filter((x) => !x).length !== 0) {
      return res.status(400).send([
        {
          msg: "Invalid",
          param: "answers",
          value: [],
        },
      ])
    }
    return next()
  },
  (req, res, next) => {
    req
      .checkBody("major", "Invalid role")
      .notEmpty()
      .isMajor()
    req.sanitizeBody("major").toString()
    // req.checkBody('answers', 'Invalid').isArray();
    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    return next()
  },
  (req, res, next) => {
    req
      .checkBody("major", "Invalid")
      .notEmpty()
      .isMajor()
    req.sanitizeBody("major").toString()

    const errors = req.validationErrors()
    if (errors) return res.status(400).send(errors)
    return next()
  },
]
