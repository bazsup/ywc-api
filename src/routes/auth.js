import {Router} from "express"
import jwt from "express-jwt"
import config from "config"

import {login, adminLogin} from "../controllers/auth"
import {isAuthenticated} from "../middlewares"
import {closeAfterDeadline} from "../middlewares/deadline"

const router = Router()

router.post("/login", closeAfterDeadline, login)
router.post("/login/admin", adminLogin)

export default router
