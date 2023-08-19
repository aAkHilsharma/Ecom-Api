/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful response with User registered successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user and generate a token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with token
 *       400:
 *         description: Invalid request data or credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with authenticated user's details
 *       400:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authmiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

// route - '/api/users/register
// method - post
// desc - Register a user

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "Name is required and must be a string",
    });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email is required and must be a string",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required and must be a string",
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({
        success: false,
        message: "User with that email already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    password = hashedPassword;

    const user = new User({
      name,
      email,
      password,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    if (err) {
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
});

// route - '/api/users/login
// method - post
// desc - Authenticate a user and generate a token

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email is required and must be a string",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required and must be a string",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.send({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      process.env.jwt_secret,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          message: "Logged in successfully",
          data: token,
        });
      }
    );
  } catch (err) {
    if (err) {
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
});

// route - '/api/users/me'
// method - get
// desc - get authenticated user

router.get("/me", authmiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.send({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
