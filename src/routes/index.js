import {Router} from "express"

import users from "./users"
import admin from "./admin"
// import questions from './questions';
import auth from "./auth"
import registration from "./registration"
import grading from "./grading"

const router = Router()
router.get("/", (req, res, next) => {
  res.status(200).send({status: "YWC API Server is running!"})
})
router.use("/users", users)
router.use("/admin", admin)
// router.use('/questions', questions);
router.use("/auth", auth)
router.use("/registration", registration)
router.use("/grading", grading)

export default router
