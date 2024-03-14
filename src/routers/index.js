import express from "express"
import auth from "./auth/index.js"
import admin from "./admin/index.js"
import allRoles from "./allRole/index.js"
import users from "./users/index.js"
const router = express.Router()
const routers = (app) => {
     router.use("/auth/", auth(app))
     router.use("/admin/", admin(app))
     router.use("/user/", users(app))
     router.use("/", allRoles(app))
}

export default routers
