require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
var users = require("./routes/users");
var words = require("./routes/words");
var flashCard = require("./routes/flashCard")

var app = express();
// app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Err0r: ", error.message);
    process.exit(1);
  }
};
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/users/", users);
app.use("/api/v1/words/", words);
app.use("/api/v1/flashCard/", flashCard);
module.exports = app;
