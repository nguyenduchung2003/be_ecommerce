import mysql from "mysql2"
import "dotenv/config"
import bluebird from "bluebird"
const connection = mysql.createConnection({
     host: process.env.MYSQL_HOST,
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASSWORD,
     database: process.env.MYSQL_DB,
     Promise: bluebird,
})

connection.connect((err) => {
     if (err) {
          console.error("An error occurred while connecting to the DB")
          throw err
     }
     console.log("Connected !")
})
export default connection
