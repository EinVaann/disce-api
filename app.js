require("dotenv").config();
var express = require("express");
var path = require("path");
const cors = require('cors');
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
var users = require("./routes/users");
var words = require("./routes/words");
var flashCard = require("./routes/flashCard")
var quiz = require("./routes/quiz")
const {Server} = require("socket.io");
const http = require('http');

var app = express();
app.use(cors());

const server = http.createServer(app)
const io = new Server(server, {})

io.on("connection", (socket)=>{
  console.log(socket.id);
  socket.on('disconnect', ()=>{
    console.log("dis", socket.id);
  })
})
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
app.use("/api/v1/quiz/", quiz);
module.exports = app;
