import {Router} from "express"

import users from "./users"
import admin from "./admin"
import auth from "./auth"
import registration from "./registration"
import grading from "./grading"

import {questions} from "../config"
import {createJsonResponse} from "../utils/helpers"

const router = Router()

router.get("/", (req, res, next) => {
  res.status(200).send({status: "YWC API Server is running!"})
})

router.use("/users", users)
router.use("/admin", admin)
router.use("/auth", auth)
router.use("/registration", registration)
router.use("/grading", grading)

// send question as json
router.use("/questions", (req, res) => {
  return res.json(createJsonResponse("success", questions))
})

export default router
