/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Get products based on category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to retrieve products from
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       404:
 *         description: No products with that category found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               categoryId:
 *                 type: string
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - quantity
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get product details by product ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       400:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

const router = require("express").Router();
const Product = require("../models/product");

// route '/api/products/category/:categoryId'
// method - get
// desc - get products based on category id

router.get("/category/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const products = await Product.find(
      { categoryId },
      "name price description quantity"
    );
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products with that category found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
});

// route '/api/products'
// method - post
// desc - create a product

router.post("/", async (req, res) => {
  const { name, price, description, quantity, categoryId } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "Name is required and must be a string",
    });
  }

  if (!price || typeof price !== "number" || price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Price is required and must be a positive number",
    });
  }

  if (!categoryId || typeof categoryId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a string",
    });
  }

  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity is required and must be a positive number",
    });
  }

  try {
    const product = new Product({
      name,
      price,
      description,
      quantity,
      categoryId,
    });
    await product.save();
    res
      .status(201)
      .json({ success: true, message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
});

// route '/api/products/:productId'
// method - get
// desc - get product details based on id

router.get("/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving product details",
      error: error.message,
    });
  }
});

module.exports = router;
