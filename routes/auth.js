const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authmiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

// route - '/api/users/register
// method - post
// desc - Register a user

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    req.body.password = hashedPassword;

    const user = new User(req.body);
    await user.save();

    res.send({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    }
  }
});

// route - '/api/users/login
// method - post
// desc - Authenticate a user and generate a token

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

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
      console.log(err);
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    }
  }
});

// route - '/api/users/me'
// method - get
// desc - get authenticated user

router.get("/me", authmiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select(
      "-password"
    );
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
