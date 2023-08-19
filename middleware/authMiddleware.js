const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decryptedToken = jwt.verify(token, process.env.jwt_secret);
    req.user = decryptedToken.user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};
