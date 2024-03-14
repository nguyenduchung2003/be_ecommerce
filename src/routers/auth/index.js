import express from "express"

import auth from "../../controller/auth/index.js"

const router = express.Router()

const authUsers = (app) => {
     router.post("/login", auth.authenAccessToken, auth.logIn)
     router.post("/register", auth.register)
     router.post("/logout", auth.logOut)
     router.post("/refreshToken", auth.authenRefreshToken)
     return app.use("/auth/", router)
}

export default authUsers
