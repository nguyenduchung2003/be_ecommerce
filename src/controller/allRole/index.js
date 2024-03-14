import connection from "../../service/database.js"

const getProducts = async (req, res) => {
     try {
          const [result] = await connection
               .promise()
               .query("SELECT * FROM products")

          const products = await Promise.all(
               result.map(async (product) => {
                    const [resultsVariants] = await connection
                         .promise()
                         .query("SELECT * FROM variants WHERE product_id = ?", [
                              product.id,
                         ])

                    const variants = await Promise.all(
                         resultsVariants.map(async (variant) => {
                              const [resultsOptions] = await connection
                                   .promise()
                                   .query(
                                        "SELECT * FROM options WHERE variant_id = ?",
                                        [variant.variant_id]
                                   )

                              const options = resultsOptions.map((option) => ({
                                   option_id: option.id,
                                   name: option.name,
                                   value: option.value,
                              }))

                              return {
                                   variant_id: variant.variant_id,
                                   price: variant.price,
                                   quantity: variant.quantity,
                                   options: options,
                              }
                         })
                    )

                    return {
                         id: product.id,
                         name: product.name,
                         category: product.category,
                         image: product.image,
                         description: product.description,
                         variants: variants,
                    }
               })
          )

          res.status(200).json({
               products: products,
          })
     } catch (error) {
          console.error(error)
          res.status(500).json({ error: "Internal server error" })
     }
}

const getProductWithID = (req, res) => {
     const keySearch = req.params.id
     connection.query(
          "SELECT * FROM products INNER JOIN variants ON products.id = variants.product_id INNER JOIN options ON options.variant_id = variants.variant_id WHERE products.id = ?",
          [keySearch],
          (err, products) => {
               if (err) {
                    console.log(err)
                    return res.status(500).json({
                         message: "Error get product with ID",
                    })
               } else {
                    let outputData = {
                         id: products[0]?.product_id,
                         name: products[0]?.name,
                         category: products[0]?.category,
                         image: products[0]?.image,
                         description: products[0]?.description,
                         variants: [],
                    }
                    products.forEach((entry) => {
                         let variantIndex = outputData.variants.findIndex(
                              (variant) =>
                                   variant.variant_id === entry.variant_id
                         )

                         if (variantIndex === -1) {
                              outputData.variants.push({
                                   variant_id: entry.variant_id,
                                   price: entry.price,
                                   quantity: entry.quantity,
                                   options: [],
                              })

                              variantIndex = outputData.variants.length - 1
                         }

                         outputData.variants[variantIndex].options.push({
                              option_id: entry.id,
                              name: entry.name,
                              value: entry.value,
                         })
                    })
                    return res.status(200).json({
                         result: outputData,
                    })
               }
          }
     )
}

const getProductWithCategory = async (req, res) => {
     try {
          const keySearch = req.params.category
          const [results] = await connection
               .promise()
               .query("SELECT * FROM products WHERE category = ?", [keySearch])
          const products = await Promise.all(
               results.map(async (product) => {
                    const [resultsVariants] = await connection
                         .promise()
                         .query("SELECT * FROM variants WHERE product_id = ?", [
                              product.id,
                         ])

                    const variants = await Promise.all(
                         resultsVariants.map(async (variant) => {
                              const [resultsOptions] = await connection
                                   .promise()
                                   .query(
                                        "SELECT * FROM options WHERE variant_id = ?",
                                        [variant.variant_id]
                                   )

                              const options = resultsOptions.map((option) => ({
                                   option_id: option.id,
                                   name: option.name,
                                   value: option.value,
                              }))

                              return {
                                   variant_id: variant.variant_id,
                                   price: variant.price,
                                   quantity: variant.quantity,
                                   options: options,
                              }
                         })
                    )

                    return {
                         id: product.id,
                         name: product.name,
                         category: product.category,
                         image: product.image,
                         description: product.description,
                         variants: variants,
                    }
               })
          )
          return res.status(200).json({ products: products })
     } catch (error) {
          console.log(error)
          return res.status(500).json({
               message: "Error getProductWithCategory",
          })
     }
}
const getCategory = (req, res) => {
     connection.query("SELECT * FROM categories", (err, result) => {
          if (err) {
               console.log(err)
               return res.status(500).json({
                    message: "Error get category",
               })
          } else {
               return res.status(200).json(result)
          }
     })
}

const searchProductWithName = async (req, res) => {
     const keySearch = req.query.name
     const categorySearch = req.query.category

     if (!categorySearch) {
          try {
               const [results] = await connection
                    .promise()
                    .query("SELECT * FROM products WHERE name LIKE ?", [
                         "%" + keySearch + "%",
                    ])
               const products = await Promise.all(
                    results.map(async (product) => {
                         const [resultsVariants] = await connection
                              .promise()
                              .query(
                                   "SELECT * FROM variants WHERE product_id = ?",
                                   [product.id]
                              )

                         const variants = await Promise.all(
                              resultsVariants.map(async (variant) => {
                                   const [resultsOptions] = await connection
                                        .promise()
                                        .query(
                                             "SELECT * FROM options WHERE variant_id = ?",
                                             [variant.variant_id]
                                        )

                                   const options = resultsOptions.map(
                                        (option) => ({
                                             option_id: option.id,
                                             name: option.name,
                                             value: option.value,
                                        })
                                   )

                                   return {
                                        variant_id: variant.variant_id,
                                        price: variant.price,
                                        quantity: variant.quantity,
                                        options: options,
                                   }
                              })
                         )

                         return {
                              id: product.id,
                              name: product.name,
                              category: product.category,
                              image: product.image,
                              description: product.description,
                              variants: variants,
                         }
                    })
               )
               return res.status(200).json({ products: products })
          } catch (error) {
               console.log(error)
               return res.status(500).json({
                    message: "Error searchProductWithName.",
               })
          }
     } else {
          try {
               const [results] = await connection
                    .promise()
                    .query(
                         "SELECT * FROM products WHERE name LIKE ? AND category = ?",
                         ["%" + keySearch + "%", categorySearch]
                    )
               const products = await Promise.all(
                    results.map(async (product) => {
                         const [resultsVariants] = await connection
                              .promise()
                              .query(
                                   "SELECT * FROM variants WHERE product_id = ?",
                                   [product.id]
                              )

                         const variants = await Promise.all(
                              resultsVariants.map(async (variant) => {
                                   const [resultsOptions] = await connection
                                        .promise()
                                        .query(
                                             "SELECT * FROM options WHERE variant_id = ?",
                                             [variant.variant_id]
                                        )

                                   const options = resultsOptions.map(
                                        (option) => ({
                                             option_id: option.id,
                                             name: option.name,
                                             value: option.value,
                                        })
                                   )

                                   return {
                                        variant_id: variant.variant_id,
                                        price: variant.price,
                                        quantity: variant.quantity,
                                        options: options,
                                   }
                              })
                         )

                         return {
                              id: product.id,
                              name: product.name,
                              category: product.category,
                              image: product.image,
                              description: product.description,
                              variants: variants,
                         }
                    })
               )
               return res.status(200).json({ products: products })
          } catch (error) {
               console.log(error)
               return res.status(500).json({
                    message: "Error searchProductWithName.",
               })
          }
     }
}
export default {
     getProducts: getProducts,
     getProductWithID: getProductWithID,
     getProductWithCategory: getProductWithCategory,
     getCategory: getCategory,
     searchProductWithName: searchProductWithName,
}
