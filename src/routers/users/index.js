import express from "express"
import user from "../../controller/users/index.js"
const router = express.Router()

const users = (app) => {
     router.get("/getOrderdProduct", user.getOrderWithUserID)
     router.get("/getBills", user.getBills)
     router.post("/addOrderdProduct", user.addOrderdProduct)
     router.post("/payToCart", user.payToCart)
     router.delete("/deleteProductInCart", user.deleteProductInCart)
     router.patch("/updateProductInCart", user.updateProductInCart)
     return app.use("/user", router)
}
export default users
