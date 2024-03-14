import express from "express"
import bodyParser from "body-parser"
import "dotenv/config"
import routersApp from "./src/routers/index.js"
import cors from "cors"

const app = express()
const port = process.env.PORT || 7070
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use(function (req, res, next) {
     res.setHeader(
          "Access-Control-Allow-Headers",
          "X-Requested-With,content-type, Accept,Authorization,Origin"
     )
     res.setHeader("Access-Control-Allow-Origin", "*")
     res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS, PUT, PATCH, DELETE"
     )
     res.setHeader("Access-Control-Allow-Credentials", true)
     next()
})
routersApp(app)
app.listen(port, () => {
     console.log(`Example app listening on port withs  ${port}`)
})
