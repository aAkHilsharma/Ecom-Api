const mongoose = require("mongoose");

mongoose.connect(process.env.mongo_uri);

const connection = mongoose.connection;

connection.on("connected", function () {
  console.log("MongoDB connected successfully");
});

connection.on("error", function (err) {
  console.log("MongoDB connection failed", err);
});

module.exports = mongoose;
