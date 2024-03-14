import express from "express"
import multer from "multer"

import admin from "../../controller/admin/index.js"
const router = express.Router()

const roleAdmin = (app) => {
     const storage = multer.memoryStorage()
     const upload = multer({ storage: storage })
     // router.get("/getProducts", admin.getProducts)
     router.post(
          "/upload",
          upload.single("image"),

          admin.uploadImg
     )
     router.post("/addProduct", admin.addProduct)
     router.post("/uploadImg", admin.uploadImg)
     router.delete("/deleteProduct", admin.deleteProduct)
     router.put("/updateProduct", admin.updateProduct)

     return app.use("/admin", router)
}
export default roleAdmin
