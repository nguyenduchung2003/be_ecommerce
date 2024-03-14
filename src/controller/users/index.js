import connection from "../../service/database.js"
// add products to cart
const addOrderdProduct = (req, res) => {
     const { userId, optionId, quantity } = req.body
     connection.query(
          "SELECT * FROM `order` WHERE user_id = ? AND options_id = ?",
          [userId, optionId],
          (err, result) => {
               if (err) {
                    console.log(err)
                    res.status(500).send("Internal server error")
               } else if (result.length > 0) {
                    connection.query(
                         "UPDATE `order` SET quantity_order = quantity_order + ? WHERE user_id = ? AND options_id = ?",
                         [quantity, userId, optionId],
                         (err, result) => {
                              if (err) {
                                   console.log(err)
                                   res.status(500).send("Internal server error")
                              } else {
                                   res.status(200).send(
                                        "Update quantity of product in cart successfully"
                                   )
                              }
                         }
                    )
               } else {
                    connection.query(
                         "INSERT INTO `order` (user_id, options_id, quantity_order) VALUES (?, ?, ?)",
                         [userId, optionId, quantity],
                         (err, result) => {
                              if (err) {
                                   console.log(err)
                                   res.status(500).send("Internal server error")
                              } else {
                                   res.status(200).send(
                                        "Add product to cart successfully"
                                   )
                              }
                         }
                    )
               }
          }
     )
}
// get all products in cart
const getOrderWithUserID = async (req, res) => {
     try {
          const { userId } = req.body
          const [rows] = await connection
               .promise()
               .query("SELECT * FROM `order` WHERE user_id = ?", [userId])
          if (rows.length === 0)
               return res.status(200).send("No product in cart")
          const dataPromises = rows.map(async (element) => {
               try {
                    const [result] = await connection
                         .promise()
                         .query(
                              "SELECT * FROM variants INNER JOIN options ON options.variant_id = variants.variant_id WHERE options.id = ?",
                              [element.options_id]
                         )
                    const [resultProduct] = await connection
                         .promise()
                         .query("SELECT * FROM products WHERE id = ?", [
                              result[0].product_id,
                         ])
                    return {
                         nameProduct: resultProduct[0].name,
                         description: resultProduct[0].description,
                         image: resultProduct[0].image,
                         category: resultProduct[0].category,
                         price: result[0].price,
                         optionsID: element.options_id,
                         orderID: element.order_id,
                         name: result[0].name,
                         value: result[0].value,
                         quantity_order: element.quantity_order,
                    }
               } catch (error) {
                    console.error("Error in inner queries:", error)
                    res.status(500).send("Internal server error")
               }
          })

          const data = await Promise.all(dataPromises)

          return res.status(200).send(data)
     } catch (err) {
          console.error("Error in main query:", err)
          res.status(500).send("Internal server error")
     }
}

// delete product in cart
const deleteProductInCart = (req, res) => {
     const { orderID } = req.body
     connection.query(
          "DELETE FROM `order` WHERE id = ?",
          [orderID],
          (err, result) => {
               if (err) {
                    console.log(err)
                    res.status(500).send("Internal server error")
               } else {
                    res.status(200).send("Delete product in cart successfully")
               }
          }
     )
}
// update quantity of product in cart
const updateProductInCart = (req, res) => {
     const { orderID, type } = req.body
     if (type === "increase") {
          connection.query(
               "UPDATE `order` SET quantity_order = quantity_order + 1 WHERE id = ?",
               [orderID],
               (err, result) => {
                    if (err) {
                         console.log(err)
                         res.status(500).send("Internal server error")
                    } else {
                         res.status(200).send(
                              "Update quantity of product in cart successfully"
                         )
                    }
               }
          )
     } else if (type === "decrease") {
          connection.query(
               "UPDATE `order` SET quantity_order = quantity_order - 1 WHERE id = ?",
               [orderID],
               (err, result) => {
                    if (err) {
                         console.log(err)
                         res.status(500).send("Internal server error")
                    } else {
                         res.status(200).send(
                              "Update quantity of product in cart successfully"
                         )
                    }
               }
          )
     }
}
// pay to cart price
const payToCart = async (req, res) => {
     const {
          userId,
          date,
          status,
          totalAmount,
          numberPhone,
          address,
          orderIds,
     } = req.body
     // const datePay = new Date.now()
     try {
          for (const orderId of orderIds) {
               // const [result] = await connection
               //      .promise()
               //      .query("SELECT * FROM `order` WHERE id = ?", [orderId])
               // const [resultProduct] = await connection
               //      .promise()
               //      .query("SELECT * FROM options WHERE id = ?", [
               //           result[0].options_id,
               //      ])

               const [resultQuantity] = await connection
                    .promise()
                    .query(
                         "SELECT * FROM `order` INNER JOIN options ON `order`.options_id = options.id WHERE `order`.id = ? ",
                         [orderId]
                    )
               console.log("resultQuantity", resultQuantity)
               if (resultQuantity.length === 0)
                    return res.status(400).send("Order not found")
               const [resultVariant] = await connection
                    .promise()
                    .query(
                         "UPDATE `variants` SET quantity = quantity - ? WHERE variant_id = ?",
                         [
                              resultQuantity[resultQuantity.length - 1]
                                   .quantity_order,
                              resultQuantity[resultQuantity.length - 1]
                                   .variant_id,
                         ]
                    )
               const [resultDelete] = await connection
                    .promise()
                    .query("DELETE FROM `order` WHERE id = ?", [orderId])
               const [result] = await connection
                    .promise()
                    .query(
                         "INSERT INTO `bill` (user_id,date,status,total_amount,options_id,numberPhone,address,quantities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                         [
                              userId,
                              date,
                              status,
                              totalAmount,
                              resultQuantity[resultQuantity.length - 1]
                                   .options_id,
                              numberPhone,
                              address,
                              resultQuantity[resultQuantity.length - 1]
                                   .quantity_order,
                         ]
                    )

               console.log("resultVariant", resultVariant)
          }
          return res.status(200).send("Pay to cart successfully")
     } catch (error) {
          console.log(error)
          return res.sendStatus(500)
     }
}
// display information pay
const getBills = (req, res) => {
     const { userId } = req.body
     connection.query(
          "SELECT * FROM `bill` WHERE user_id = ?",
          [userId],
          (err, result) => {
               if (err) {
                    console.log(err)
                    res.status(500).send("Internal server error")
               } else {
                    result.sort((a, b) => a.date.localeCompare(b.date))
                    const groupedData = result.reduce((acc, current) => {
                         const index = acc.findIndex(
                              (item) => item[0].date === current.date
                         )

                         if (index === -1) {
                              acc.push([current])
                         } else {
                              acc[index].push(current)
                         }

                         return acc
                    }, [])
                    res.status(200).send(groupedData)
               }
          }
     )
}
export default {
     addOrderdProduct: addOrderdProduct,
     getOrderWithUserID: getOrderWithUserID,
     deleteProductInCart: deleteProductInCart,
     updateProductInCart: updateProductInCart,
     payToCart: payToCart,
     getBills: getBills,
}
