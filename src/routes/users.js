import {Router} from "express"

import {pick} from "lodash"

import VError from "verror"

import User from "../models/user"

import {
  ROLE_STAFF,
  ROLE_COMMITTEE,
  ROLE_COMPLETED,
  ROLE_MANAGER,
  ROLE_ADMIN,
} from "../utils/const"

import {createJsonResponse} from "../utils/helpers"

import {authen, adminAuthen} from "../middlewares/authenticator"

const router = Router()

// get all users in database
router.get(
  "/all",
  adminAuthen([ROLE_ADMIN, ROLE_MANAGER]),
  async (req, res, next) => {
    try {
      const select = [
        "_id",
        "facebook",
        "status",
        "firstNameEN",
        "lastNameEN",
        "firstName",
        "lastName",
        "nickname",
        "email",
        "major",
        "committeeScore",
        "birthdate",
        "sex",
        "phone",
        "failed",
        "isPassStaff",
      ]

      const projectAggregate = select.reduce((prev, curr) => {
        prev[curr] = 1
        return prev
      }, {})

      const users = await User.aggregate([
        {
          $lookup: {
            from: "questions",
            localField: "questions",
            foreignField: "_id",
            as: "questions",
          },
        },
        {
          $project: {...projectAggregate, questions: 1},
        },
        {
          $addFields: {
            isAnswerGeneral: {
              $ne: [{$size: {$ifNull: ["$questions.generalQuestions", []]}}, 0],
            },
            isAnswerMajor: {
              $ne: [{$size: {$ifNull: ["$questions.majorQuestions", []]}}, 0],
            },
          },
        },
        {
          $project: {...projectAggregate, isAnswerGeneral: 1, isAnswerMajor: 1},
        },
      ])
        .cursor({})
        .exec()
        .toArray()

      return res.json(createJsonResponse("success", users))
    } catch (e) {
      return next(new VError("/users/all: %s", e.message))
    }
  },
)

// get users id by staff major (for staff grading system)
router.get("/staff", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  try {
    const {major} = req.admin

    const users = await User.find({
      major,
      status: ROLE_COMPLETED,
      isPassStaff: {
        $ne: true,
      },
      failed: {
        $ne: true,
      },
    }).select("_id major")

    return res.json(createJsonResponse("success", users))
  } catch (e) {
    return next(new VError("/users/staff", e))
  }
})

// get user general question from user id (for staff grading system)
router.get("/staff/:id", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  const userID = req.params.id

  try {
    const user = await User.findById(userID).populate("questions")

    const data = pick(user, [
      "birthdate",
      "sex",
      "educationStatus",
      "questions",
      "major",
    ])

    return res.json(createJsonResponse("success", data))
  } catch (e) {
    return next(new VError(`/users/staff/${userID}`, e))
  }
})

// get users id by committee major (for committee grading system)
router.get(
  "/committee",
  adminAuthen(ROLE_COMMITTEE),
  async (req, res, next) => {
    try {
      const {major} = req.admin

      const users = await User.find({
        major,
        status: ROLE_COMPLETED,
        isPassStaff: true,
        failed: {
          $ne: true,
        },
      }).select("_id major committeeVote")

      return res.json(createJsonResponse("success", users))
    } catch (e) {
      return next(new VError("/users/committee", e))
    }
  },
)

// get only staff pass (tend to be deprecated)
router.get(
  "/committee/stat",
  adminAuthen(ROLE_COMMITTEE),
  async (req, res, next) => {
    try {
      const passStaff = await User.count({
        major: req.admin.major,
        isPassStaff: true,
        failed: {
          $ne: true,
        },
      })

      return res.send(
        createJsonResponse("success", {
          passStaff,
        }),
      )
    } catch (e) {
      return next(new VError(e, "/users/committee/stat"))
    }
  },
)

// get user data from user id (for committee grading system)
// return questions, profile (without name and contact information)
router.get(
  "/committee/:id",
  adminAuthen(ROLE_COMMITTEE),
  async (req, res, next) => {
    const userID = req.params.id

    try {
      const user = await User.findById(userID).populate("questions")

      const data = pick(user, [
        "academicYear",
        "department",
        "educationStatus",
        "equivalentEducationDegree",
        "faculty",
        "university",
        "questions",
        "activities",
        "major",
        "staffComment",
        "staffUsername",
      ])

      return res.json(createJsonResponse("success", data))
    } catch (e) {
      return next(new VError(`/users/committee/${userID}`, e))
    }
  },
)

// get all candidates (users)
// router.get("/", adminAuthen("admin"), async (req, res) => {
//   const users = await User.find().select(
//     "_id major title firstName lastName firstNameEN lastNameEN email nickname completed_at status major completed",
//   )
//   return res.send(users)
// })

// get user information and questions from access token
router.get("/me", authen(), async (req, res, next) => {
  const user = await User.findOne({
    _id: req.user._id,
  }).populate("questions")

  if (!user) {
    return next(new Error("user not found"))
  }

  return res.send(createJsonResponse("success", user))
})

// show completed-user stat
router.get("/stat", async (req, res) => {
  try {
    // query total number of completed registration user
    const completed = ["programming", "design", "content", "marketing"].map(
      (major) => {
        return User.count({
          status: "completed",
          major,
        })
      },
    )

    const [programming, design, content, marketing] = await Promise.all(
      completed,
    )

    return res.json(
      createJsonResponse("success", {
        programming,
        design,
        content,
        marketing,
      }),
    )
  } catch (err) {
    return next(new VError("/stat:", err))
  }
})

// backoffice candidates stat (dashboard)
router.get(
  "/stat/all",
  adminAuthen([ROLE_ADMIN, ROLE_MANAGER]),
  async (req, res, next) => {
    try {
      const countUserStep = await User.aggregate([
        {
          $addFields: {
            step_info: {
              $ne: [
                {
                  $ifNull: ["$firstName", false],
                },
                false,
              ],
            },
            step_contact: {
              $ne: [
                {
                  $ifNull: ["$phone", false],
                },
                false,
              ],
            },
            step_insight: {
              $ne: [
                {
                  $ifNull: ["$activities", false],
                },
                false,
              ],
            },
          },
        },
        {
          $addFields: {
            step_major: {
              $and: [
                {
                  $eq: ["$step_info", true],
                },
                {
                  $eq: ["$step_contact", true],
                },
                {
                  $eq: ["$step_insight", true],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              major: "$major",
              stepInfo: "$step_info",
              stepContact: "$step_contact",
              stepInsight: "$step_insight",
              stepMajor: "$step_major",
            },
            userCount: {
              $sum: 1,
            },
          },
        },
      ])
        .cursor({})
        .exec()
        .toArray()

      const completedTimeline = await User.aggregate([
        {
          $group: {
            _id: {
              month: {
                $month: "$completed_at",
              },
              day: {
                $dayOfMonth: "$completed_at",
              },
              year: {
                $year: "$completed_at",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ])
        .cursor({})
        .exec()
        .toArray()

      const totalCandidate = await User.count({})

      const completed = ["programming", "design", "content", "marketing"].map(
        (major) => {
          return User.count({major})
        },
      )

      const [programming, design, content, marketing] = await Promise.all(
        completed,
      )

      return res.send(
        createJsonResponse("success", {
          totalCandidate,
          programming,
          design,
          content,
          marketing,
          countUserStep,
          completedTimeline,
        }),
      )
    } catch (e) {
      return next(new VError(e, "/stat/all"))
    }
  },
)

export default router
