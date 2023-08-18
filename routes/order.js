const router = require("express").Router();
const mongoose = require("mongoose");

const authmiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");

// route - '/api/orders'
// method - post
// desc - place a order from user's cart

router.post("/", authmiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const userCart = await Cart.findOne({ owner: userId });

    if (!userCart || userCart.products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products found in cart" });
    }

    const productsToUpdate = [];

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const cartProduct of userCart.products) {
        const product = await Product.findById(cartProduct.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${cartProduct.name}`,
          });
        }

        if (product.quantity < cartProduct.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity for product: ${cartProduct.name}`,
          });
        }

        productsToUpdate.push({
          productId: cartProduct.id,
          name: cartProduct.name,
          quantity: cartProduct.quantity,
          price: cartProduct.price,
        });

        product.quantity -= cartProduct.quantity;
        await product.save();
      }

      const newOrder = new Order({
        owner: userId,
        products: productsToUpdate,
        totalAmount: userCart.bill,
      });
      await newOrder.save();

      userCart.products = [];
      userCart.bill = 0;
      await userCart.save();

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: newOrder,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while placing order",
      error: error.message,
    });
  }
});

// route - '/api/orders/history'
// method - get
// desc - View order history

router.get("/history", authmiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Order history retrieved successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving order history",
      error: error.message,
    });
  }
});

// route - '/api/orders/:orderId'
// method - get
// desc - get order details by order id

router.get("/:orderId", authmiddleware, async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;

  if (!mongoose.isValidObjectId(orderId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid productId" });
  }

  try {
    const order = await Order.findOne({ _id: orderId, owner: userId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving order details",
      error: error.message,
    });
  }
});

module.exports = router;
