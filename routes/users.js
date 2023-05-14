var express = require("express");
var router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const Users = require("../model/users");

router.get("/login", async function (req, res, next) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({
      message: "Please fill in complete information",
    });
  try {
    const checkedUser = await Users.findOne({
      username: username,
    });
    let accessToken;
    if (checkedUser) {
      accessToken = jwt.sign(
        { userId: checkedUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '3h' }
      );
      var validatePassword = await argon2.verify(
        checkedUser.password,
        password
      );
      if (!validatePassword)
        return res.status(400).json({
          message: "Incorrect username or password",
        });
      return res.status(200).json({
        message: "Login successful",
        accessToken,
      });
    } else
      return res.status(400).json({
        message: "Incorrect email or password",
      });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.post("/register", async function (req, res, next) {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({
      message: "Please fill in complete information",
    });
  try {
    const UserExisted = await Users.findOne({
      username: username,
    });
    if (UserExisted)
      return res
        .status(400)
        .json({ success: false, message: "Username is existing" });
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must have at least 6 characters.",
      });
    }
    //check email is the right regex

    // all checked
    const hashPassword = await argon2.hash(password); //hash password
    const newUsers = new Users({
      username: username,
      password: hashPassword,
      email: email,
    });
    await newUsers.save();
    const accessToken = jwt.sign(
      { userId: newUsers._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    return res.status(200).json({
      message: "Register successfully",
      accessToken
    })
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

module.exports = router;
