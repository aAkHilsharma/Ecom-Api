const router = require("express").Router();
const mongoose = require("mongoose");

const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/cart");
const Product = require("../models/product");

// route - '/api/cart/add/:productId'
// method - post
// desc - add product to the cart

router.post("/add/:productId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid productId" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let userCart = await Cart.findOne({ owner: userId });
    if (!userCart) {
      userCart = new Cart({ owner: userId, products: [], bill: 0 });
    }

    const existingProductIndex = userCart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex !== -1) {
      userCart.products[existingProductIndex].quantity += 1;
    } else {
      userCart.products.unshift({
        productId: productId,
        name: product.name,
        quantity: 1,
        price: product.price,
      });
    }

    userCart.bill = userCart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
    });
  }
});

// route - '/api/cart'
// method - get
// desc - view the cart

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const userCart = await Cart.findOne({ owner: userId }).populate("products");

    if (!userCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
});

// route - 'api/cart/update/:productId'
// method - put
// desc - Update the quantity of a product in the cart

router.put("/update/:productId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const newQuantity = req.body.quantity;

  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid productId" });
  }

  if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quantity value" });
  }

  try {
    const userCart = await Cart.findOne({ owner: userId });

    if (!userCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const existingProductIndex = userCart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingProductIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    if (newQuantity === 0) {
      userCart.products.splice(existingProductIndex, 1);
    } else {
      userCart.products[existingProductIndex].quantity = newQuantity;
    }

    userCart.bill = userCart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message:
        newQuantity === 0
          ? "Product removed from cart"
          : "Product quantity updated in cart",
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// route - 'api/cart/remove/:productId'
// method - delete
// desc - remove a product from the cart

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid productId" });
  }

  try {
    const userCart = await Cart.findOne({ owner: userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingProductIndex = userCart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex === -1) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found in cart" });
    }

    userCart.products.splice(existingProductIndex, 1);

    userCart.bill = userCart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
});

module.exports = router;
