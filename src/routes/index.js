import {Router} from "express"

import users from "./users"
// import count from './count';
import admin from "./admin"
// import questions from './questions';
import auth from "./auth"
// import member from './member';
import registration from "./registration"
import grading from "./grading"
import queue from "./queue"
import finalists from "./finalists"

const router = Router()
router.get("/", (req, res) => {
  res.status(200).send({status: "YWC API Server is running!"})
})
router.use("/users", users)
// router.use('/count', count);
router.use("/admin", admin)
// router.use('/questions', questions);
router.use("/auth", auth)
// router.use('/slip', slip);
// router.use('/member', member);
router.use("/registration", registration)
router.use("/grading", grading)
router.use("/queues", queue)
router.use("/finalists", finalists)

export default router
