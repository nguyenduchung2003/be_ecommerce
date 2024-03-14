import express from "express"
import allRole from "../../controller/allRole/index.js"
const router = express.Router()

const allRoles = (app) => {
     // hiển thị tất cả sản phẩm
     router.get("/getProducts", allRole.getProducts)
     router.get("/getProducts/:id", (req, res) => {
          const idOrCategory = req.params.id
          if (!isNaN(idOrCategory)) {
               // hiển thị 1 sản phẩm khi click
               allRole.getProductWithID(req, res)
          } else if (idOrCategory == "category") {
               // hiển thị tất cả categories của products
               allRole.getCategory(req, res)
          } else if (idOrCategory == "search") {
               allRole.searchProductWithName(req, res)
          }
     })
     // hiển thị sản phẩm theo categories
     router.get(
          "/getProducts/category/:category",
          allRole.getProductWithCategory
     )
     // router.get("/getProducts/search", allRole.searchProductWithName)

     return app.use("/", router)
}
export default allRoles
