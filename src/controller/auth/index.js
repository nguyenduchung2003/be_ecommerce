import connection from "../../service/database.js"
import jwt from "jsonwebtoken"

const resgister = (req, res) => {
     const { email, password } = req.body
     connection.query(
          "INSERT INTO users (email, password) VALUES (?, ?)",
          [email, password],
          (err, results) => {
               if (err) {
                    res.status(500).json({
                         message: "User already exists",
                    })
               } else {
                    res.status(200).json({
                         message: "User registered successfully!",
                         email: email,
                         password: password,
                    })
               }
          }
     )
}
const logIn = (req, res) => {
     const { email, password } = req.body

     connection.query(
          "SELECT * FROM users WHERE email = ? AND password = ?",
          [email, password],
          (err, results) => {
               if (err) {
                    res.status(500).send("An error occurred while logging in")
                    throw err
               }
               if (results.length === 0) {
                    res.status(404).send("User not found")
               }

               const AccessToken = jwt.sign(
                    { id: results[0].id, email: results[0].email },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                         expiresIn: "1h",
                    }
               )
               const RefreshToken = jwt.sign(
                    { id: results[0].id, email: results[0].email },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                         expiresIn: "1y",
                    }
               )
               let current_datetime = new Date()
               let formatted_date =
                    current_datetime.getFullYear() +
                    "-" +
                    (current_datetime.getMonth() + 1) +
                    "-" +
                    current_datetime.getDate() +
                    " " +
                    current_datetime.getHours() +
                    ":" +
                    current_datetime.getMinutes() +
                    ":" +
                    current_datetime.getSeconds()
               connection.query(
                    "INSERT INTO token (user_id,token,created) VALUES (?,?, ?)",
                    [results[0].id, RefreshToken, formatted_date]
               )
               return res.status(200).json({
                    message: "Login successfully",
                    email: email,
                    AccessToken: AccessToken,
                    RefreshToken: RefreshToken,
               })
          }
     )
}
const logOut = (req, res) => {
     const { refreshToken } = req.body
     if (refreshToken == null) return res.sendStatus(401)
     connection.query(
          "DELETE FROM token WHERE token = ?",
          [refreshToken],
          (err, results) => {
               if (err) {
                    res.status(500).send("An error occurred while logging out")
                    throw err
               }
               res.status(200).json({
                    message: "Logout successfully",
               })
          }
     )
}
const authenRefreshToken = (req, res, next) => {
     const refreshToken = req.body.token
     if (refreshToken == null) return res.sendStatus(401)
     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) return res.sendStatus(403)
          console.log("user", user)
          const accessesToken = jwt.sign(
               { id: user.id, email: user.email },
               process.env.ACCESS_TOKEN_SECRET,
               {
                    expiresIn: "1h",
               }
          )
          const resfreshToken = jwt.sign(
               { id: user.id, email: user.email },
               process.env.REFRESH_TOKEN_SECRET,
               {
                    expiresIn: "1y",
               }
          )
          return res.status(200).json({
               message: "verify successfully",
               access_token: accessesToken,
               refresh_token: resfreshToken,
          })
     })
}
const authenAccessToken = (req, res, next) => {
     const authHeader = req.headers["authorization"]
     const token = authHeader && authHeader.split(" ")[1]
     if (token == null) return res.sendStatus(401)
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
          if (err) return res.sendStatus(403).json({ message: "Token expired" })

          req.user = user
          const userCheck = connection.query(
               "SELECT * FROM users WHERE id = ?",
               [user.id]
          )
          if (userCheck.length === 0) {
               return res.status(404).json({ message: "User not found" })
          }
          next()
     })
}

export default {
     logIn: logIn,
     logOut: logOut,
     register: resgister,
     authenAccessToken: authenAccessToken,
     authenRefreshToken: authenRefreshToken,
}
