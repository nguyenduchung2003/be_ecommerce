import connection from "../../service/database.js"
// import fireBase from "../../service/fireBaseStorage.js"
// {
//      "name": "",
//      "image": [],
//      "description": "",
//      "variants": [
//          {
//              "options": [
//                  {
//                      "name": "color",
//                      "value": "red"
//                  },
//                  {
//                      "name": "size",
//                      "value": "x"
//                  }
//              ],
//              "price": 100,
//              "quantity": 10
//          }
//          {
//              "options": [
//                  {
//                      "name": "color",
//                      "value": "blue"
//                  },
//                  {
//                      "name": "size",
//                      "value": "x"
//                  }
//              ],
//              "price": 20,
//              "quantity": 20
//          }
//      ]

//  }

import { v4 as uuidv4 } from "uuid"
import admin from "../../service/fireBaseStorage.js"

// import { v4 as uuidv4 } from "uuid"
const uploadImg = (req, res) => {
     const file = req.file

     if (!file) {
          return res.status(400).send("No file uploaded.")
     }

     const bucket = admin.storage().bucket()
     const fileName = uuidv4()
     const fileUpload = bucket.file(fileName)

     const blobStream = fileUpload.createWriteStream({
          metadata: {
               contentType: file.mimetype,
          },
     })

     blobStream.on("error", (error) => {
          console.error(error)
          res.status(500).send("Error uploading file.")
     })

     blobStream.on("finish", () => {
          // URL của ảnh sau khi tải lên
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/ecommerce-2bad9.appspot.com/o/${fileUpload.name}?alt=media&token=6d5b298b-0c9c-41bc-98e7-31c9be269231`
          res.status(200).send({
               URLImage: publicUrl,
               fileName: fileUpload.name,
          })
     })

     blobStream.end(file.buffer)
}
const deleteImage = (req, res) => {
     const { fileName } = req.body
     const bucket = admin.storage().bucket()
     const file = bucket.file(fileName)
     file.delete()
          .then(() => {
               res.status(200).send("Delete image successfully")
          })
          .catch((err) => {
               console.log(err)
               res.status(500).send("Error delete image")
          })
}

const addProduct = (req, res) => {
     const { name, category, image, description, variants } = req.body
     const JSONImage = JSON.stringify(image)
     let errorOccurred = false
     connection.query(
          "INSERT INTO products (name,description,image,category) VALUES (?, ?, ?,?)",
          [name, description, JSONImage, category],
          (err, results) => {
               if (err) {
                    console.log(err)
                    errorOccurred = true
                    return res.status(500).json({
                         message: "Failed to add products",
                    })
               } else {
                    variants.forEach((variant) => {
                         connection.query(
                              "INSERT INTO variants (product_id, price, quantity) VALUES (?, ?, ?)",
                              [
                                   results.insertId,
                                   variant.price,
                                   variant.quantity,
                              ],
                              (err, resultsVariants) => {
                                   if (err) {
                                        errorOccurred = true
                                        return res.status(500).json({
                                             message: "Failed to add variants",
                                        })
                                   } else {
                                        variant.options.forEach((option) => {
                                             connection.query(
                                                  "INSERT INTO options (variant_id, name, value) VALUES (?, ?, ?)",
                                                  [
                                                       resultsVariants.insertId,
                                                       option.name,
                                                       option.value,
                                                  ],
                                                  (err, results) => {
                                                       if (err) {
                                                            errorOccurred = true
                                                            return res
                                                                 .status(500)
                                                                 .json({
                                                                      message: "Failed to add options",
                                                                 })
                                                       }
                                                  }
                                             )
                                        })
                                   }
                              }
                         )
                    })
               }
               if (!errorOccurred) {
                    return res.status(200).json({
                         message: "Product added successfully!",
                         name: name,
                         image: image ? image : [],
                         description: description,
                         variants: variants,
                    })
               }
          }
     )
}
const deleteProduct = (req, res) => {
     const { productId, variantId, deleteVariant } = req.body
     if (deleteVariant) {
          connection.query(
               "DELETE FROM options WHERE variant_id = ? ",
               [variantId],
               (err, result) => {
                    if (err) {
                         console.log(err)
                         return res.status(500).json({
                              message: "Error delete table options",
                         })
                    } else {
                         connection.query(
                              "DELETE FROM variants WHERE variant_id = ? ",
                              [variantId],
                              (err, resultsVariants) => {
                                   if (err) {
                                        console.log(err)
                                        return res.status(500).json({
                                             message: "Error delete table variants",
                                        })
                                   } else {
                                        return res.status(200).json({
                                             message: "Delete variant succesfully",
                                        })
                                   }
                              }
                         )
                    }
               }
          )
     } else {
          let check
          connection.query(
               "SELECT variant_id FROM variants WHERE product_id = ?",
               [productId],
               (err, results) => {
                    if (err) {
                         check = true
                         return res.status(500).json({
                              message: "Error delete table variants",
                         })
                    } else {
                         results.forEach((variant) => {
                              connection.query(
                                   "DELETE FROM options WHERE variant_id = ? ",
                                   [variant.variant_id],
                                   (err, result) => {
                                        if (err) {
                                             check = true
                                             return res.status(500).json({
                                                  message: "Error delete table options",
                                             })
                                        } else {
                                             connection.query(
                                                  "DELETE FROM variants WHERE product_id = ? ",
                                                  [productId],
                                                  (err, resultsVariants) => {
                                                       if (err) {
                                                            check = true
                                                            return res
                                                                 .status(500)
                                                                 .json({
                                                                      message: "Error delete table variants",
                                                                 })
                                                       } else {
                                                            connection.query(
                                                                 "DELETE FROM products WHERE id = ? ",
                                                                 [productId],
                                                                 (
                                                                      err,
                                                                      resultsVariants
                                                                 ) => {
                                                                      if (err) {
                                                                           check = true
                                                                           return res
                                                                                .status(
                                                                                     500
                                                                                )
                                                                                .json(
                                                                                     {
                                                                                          message: "Error delete table products",
                                                                                     }
                                                                                )
                                                                      }
                                                                 }
                                                            )
                                                       }
                                                  }
                                             )
                                        }
                                   }
                              )
                         })
                    }
               }
          )
          if (!check) {
               return res.status(200).json({
                    message: "Delete product succesfully",
               })
          }
     }
}
const updateProduct = (req, res) => {
     const { name, category, image, description, variants, productId } =
          req.body
     let errorOccurred = false
     connection.query(
          "UPDATE products SET name = ?,category = ?,description = ?,image = ? WHERE id = ?",
          [name, category, description, JSON.stringify(image), productId],
          (err, results) => {
               if (err) {
                    console.log(err)
                    errorOccurred = true
                    return res.status(500).json({
                         message: "Failed to update products",
                    })
               } else {
                    variants.forEach((variant) => {
                         connection.query(
                              "UPDATE variants SET price = ?,quantity = ? WHERE variant_id = ?",
                              [
                                   variant.price,
                                   variant.quantity,
                                   variant.variant_id,
                              ],
                              (err, resultsVariants) => {
                                   if (err) {
                                        errorOccurred = true
                                        return res.status(500).json({
                                             message: "Failed to update variants",
                                        })
                                   } else {
                                        variant.options.forEach((option) => {
                                             connection.query(
                                                  "UPDATE options SET name = ?,value = ? WHERE id = ?",
                                                  [
                                                       option.name,
                                                       option.value,
                                                       option.option_id,
                                                  ],

                                                  (err, results) => {
                                                       if (err) {
                                                            errorOccurred = true
                                                            return res
                                                                 .status(500)
                                                                 .json({
                                                                      message: "Failed to update options",
                                                                 })
                                                       }
                                                  }
                                             )
                                        })
                                   }
                              }
                         )
                    })
               }
               if (!errorOccurred) {
                    return res.status(200).json({
                         message: "Product update successfully!",
                         // name: name,
                         // image: image ? image : [],
                         // description: description,
                         // variants: variants,
                    })
               }
          }
     )
}

export default {
     // getProducts: getProducts,
     uploadImg: uploadImg,
     addProduct: addProduct,
     deleteProduct: deleteProduct,
     updateProduct: updateProduct,
     deleteImage: deleteImage,
}
