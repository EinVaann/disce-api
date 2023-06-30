var express = require("express");
var router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
var auth = require("../middleware/auth");
const Users = require("../model/users");
const UserInfos = require("../model/userInfo");
const chatLine = require("../model/chatLine");
const { default: mongoose } = require("mongoose");

router.post("/login", async function (req, res, next) {
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
        process.env.ACCESS_TOKEN_SECRET
        // { expiresIn: '3h' }
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
      // { expiresIn: '3h' }
    );
    return res.status(200).json({
      message: "Register successfully",
      accessToken,
    });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.get("/get-users", auth, async function (req, res, next) {
  try {
    const search_username = req.query.search_username;
    const userId = req.userId;
    var userInfos = await UserInfos.findOne({ userId: userId });
    var friendList = userInfos.friendList;
    friendList.push(userId);
    // console.log(friendList);
    var foundUser = await Users.aggregate([
      {
        $project: {
          username: 1,
        },
      },
      {
        $match: {
          $and: [
            { username: { $regex: search_username, $options: "i" } },
            { _id: { $nin: friendList } },
          ],
        },
      },
    ]);
    return res.status(200).json(foundUser);
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.get("/friends", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const userInfo = await UserInfos.findOne({ userId: userId }).populate({
      path: "friendList",
      model: "Users",
      select: ["username"],
    });
    return res.status(200).json({ userInfo });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

// router.get("/infos", async function (req, res, next) {
//   const chats = await chatLine.aggregate([
//     {
//       $project: {
//         participant: 1,
//         sender: 1,
//         content: 1,
//         time: 1,
//       },
//     },
//     {
//       $match: {
//         participant: {
//           $all: [
//             new mongoose.Types.ObjectId("6460d516962328637321275e"),
//             new mongoose.Types.ObjectId("648c5d8ce8dd7e5398d5415b"),
//           ],
//         },
//       },
//     },
//     { $limit: 50 },
//   ]);
//   return res.status(200).json(chats);
// });

module.exports = router;
