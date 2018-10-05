import {Router} from "express"
import {pick} from "lodash"
import VError from "verror"

import {User} from "../models"
import {ROLE_STAFF, ROLE_COMMITTEE, ROLE_COMPLETED} from "../utils/const"
import {createJsonResponse} from "../utils/helpers"
import {authen, adminAuthen} from "../middlewares/authenticator"

const router = Router()

// get users id by staff major (for staff grading system)
router.get("/staff", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  try {
    const {major} = req.admin

    const users = await User.find({
      major,
      status: ROLE_COMPLETED,
      isPassStaff: {$ne: true},
      failed: {$ne: true},
    }).select("_id major")

    return res.json(createJsonResponse("success", users))
  } catch (e) {
    return next(new VError("/users/staff", e))
  }
})

// get user general question from user id (for staff grading system)
router.get("/staff/:id", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  try {
    const userID = req.params.id

    const user = await User.findById(userID).populate("questions")

    const generalQuestions = user.questions.generalQuestions

    return res.json(createJsonResponse("success", generalQuestions))
  } catch (e) {
    return next(new VError(`/users/staff/${userID}`, e))
  }
})

// get users id from committee major (for committee grading system)
router.get(
  "/committee",
  adminAuthen(ROLE_COMMITTEE),
  async (req, res, next) => {
    try {
      const major = req.admin.major

      const users = await User.find({
        major,
        isPassStaff: true,
        failed: false,
      }).select("_id major")

      const data = users.filter(
        (user) => user.committeeVote.indexOf(req.admin._id) === -1,
      )

      return res.json(createJsonResponse("success", data))
    } catch (e) {
      return next(new VError("/users/committee", e))
    }
  },
)

// get user data from user id (for committee grading system)
// return questions, profile (without name and contact information)
router.get(
  "/committee/:id",
  adminAuthen(ROLE_STAFF),
  async (req, res, next) => {
    try {
      const userID = req.params.id

      const user = await User.findById(userID).populate("questions")

      const data = pick(user, [
        "questions",
        "activities",
        "major",
        "staffComment",
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
  const user = await User.findOne({_id: req.user._id}).populate("questions")

  if (!user) {
    return next(new Error("user not found"))
  }

  return res.send(createJsonResponse("success", user))
})

// show completed-user stat
router.get("/stat", async (req, res) => {
  try {
    // query total number of completed registration user
    const completed = ["programming", "design", "content", "marketing"].map(major => {
      return User.count({
        status: "completed",
        major,
      })
    })

    const [programming, design, content, marketing] = await Promise.all(completed)

    return res.json(createJsonResponse("success", {
      programming,
      design,
      content,
      marketing,
    }))
  } catch (err) {
    return next(new VError("/stat:", err))
  }
})

// router.get("/by-day-stat", adminAuthen("admin"), async (req, res) => {
//   try {
//     const {sort = "desc"} = req.query
//     const statistics = await User.aggregate([
//       {$match: {status: "completed"}},
//       {$sort: {completed_at: 1}},
//       {
//         $project: {
//           dateString: {
//             $dateToString: {format: "%Y-%m-%d", date: "$completed_at"},
//           },
//         },
//       },
//       {$group: {_id: "$dateString", count: {$sum: 1}}},
//     ])
//     return res.send(
//       statistics.sort((a, b) => {
//         if (moment(a._id, "YYYY-MM-DD").isBefore(moment(b._id, "YYYY-MM-DD")))
//           return sort === "desc" ? 1 : -1
//         else if (
//           moment(a._id, "YYYY-MM-DD").isSame(moment(b._id, "YYYY-MM-DD"))
//         )
//           return 0
//         return sort === "desc" ? -1 : 1
//       }),
//     )
//   } catch (e) {
//     return res.error(e)
//   }
// })

// router.get(
//   "/programming",
//   adminAuthen(["admin", "programming"]),
//   async (req, res) => {
//     try {
//       const users = await User.find({status: "completed", major: "programming"})
//       return res.send(users)
//     } catch (err) {
//       return res.error(err)
//     }
//   },
// )

// router.get("/design", adminAuthen(["admin", "design"]), async (req, res) => {
//   try {
//     const users = await User.find({status: "completed", major: "design"})
//     return res.send(users)
//   } catch (err) {
//     return res.error(err)
//   }
// })

// router.get(
//   "/marketing",
//   adminAuthen(["admin", "marketing"]),
//   async (req, res) => {
//     try {
//       const users = await User.find({status: "completed", major: "marketing"})
//       return res.send(users)
//     } catch (err) {
//       return res.error(err)
//     }
//   },
// )

// router.get("/content", adminAuthen(["admin", "content"]), async (req, res) => {
//   try {
//     const users = await User.find({status: "completed", major: "content"})
//     return res.send(users)
//   } catch (err) {
//     return res.error(err)
//   }
// })

// router.get("/interview", async (req, res) => {
//   try {
//     const interviewCandidate = await User.find({
//       status: "completed",
//       isPassStageOne: true,
//       isPassStageTwo: true,
//       isPassStageThree: true,
//     })
//       .select(
//         "_id major title firstName lastName firstNameEN lastNameEN email nickname completed_at",
//       )
//       .sort("firstName")
//     return res.send({
//       programming: interviewCandidate.filter(
//         (user) => user.major === "programming",
//       ),
//       design: interviewCandidate.filter((user) => user.major === "design"),
//       marketing: interviewCandidate.filter(
//         (user) => user.major === "marketing",
//       ),
//       content: interviewCandidate.filter((user) => user.major === "content"),
//     })
//   } catch (err) {
//     return res.error(err)
//   }
// })

// router.get("/:id", adminAuthen("admin"), async (req, res) => {
//   const user = await User.findOne({_id: req.params.id}).populate("questions")
//   return res.send(user)
// })

// // check backoffice candidates stat
// router.get("/stat/all", adminAuthen("admin"), async (req, res) => {
//   try {
//     const programmingCompleted = User.count({
//       status: "completed",
//       major: "programming",
//     })
//     const designCompleted = User.count({status: "completed", major: "design"})
//     const contentCompleted = User.count({status: "completed", major: "content"})
//     const marketingCompleted = User.count({
//       status: "completed",
//       major: "marketing",
//     })
//     const pendingPromise = User.count({
//       status: {$ne: "completed"},
//       completed: {$ne: [true, true, true, true, true]},
//     })
//     const notConfirmPromise = User.count({
//       status: {$ne: "completed"},
//       completed: [true, true, true, true, true],
//     })
//     const [
//       programming,
//       design,
//       content,
//       marketing,
//       pending,
//       notConfirm,
//     ] = await Promise.all([
//       programmingCompleted,
//       designCompleted,
//       contentCompleted,
//       marketingCompleted,
//       pendingPromise,
//       notConfirmPromise,
//     ])
//     return res.send({
//       programming,
//       design,
//       content,
//       marketing,
//       pending,
//       notConfirm,
//     })
//   } catch (err) {
//     return res.error(err)
//   }
// })

export default router
