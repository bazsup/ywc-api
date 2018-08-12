// generate root admin user for backoffice login

import bcrypt from "bcrypt"
import mongoose from "mongoose"
import config from "config"

import Admin from "../src/models/admin"

// connect mongodb database
mongoose.connect(
  process.env.MONGODB_URI || process.env.MONGOLAB_URI || config.MONGODB_URI,
)

// root admin user setting
const username = "admin"
const password = "password"
;(async () => {
  try {
    await Admin.create({
      username,
      password: bcrypt.hashSync(password, 10),
      role: "admin",
    })

    console.log("Create admin success!")
  } catch (err) {
    console.err(err)
  }
})()
