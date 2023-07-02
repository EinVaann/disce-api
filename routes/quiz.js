var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");
var FlashCard = require("../model/flashCard");
var Quiz = require("../model/quiz");
var Progress = require("../model/progress");
const { default: mongoose } = require("mongoose");
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

router.get("/generate", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const flashCardId = req.query.cardId;
    // check flash card before generate
    const flashCard = await FlashCard.findOne({
      _id: flashCardId,
      userId: userId,
    }).populate("wordList");
    if (!flashCard) {
      return res.status(400).json({
        message: "Can't find flash card.",
      });
    }
    // const uniqueWordList = flashCard.wordList;
    // for (let i in uniqueWordList) {
    // }
    if (flashCard.wordList.length < 10) {
      return res.status(400).json({
        message: "Flash card need more word to create a quiz.",
      });
    } else {
      // create quiz start
      // get 10 random words
      var wordList = flashCard.wordList;
      var quizWords = wordList.sort(() => 0.5 - Math.random()).slice(0, 10);
      var wordMeanings = [];
      //get meaning of the 10 selected words
      for (let i = 0; i < 10; i++) {
        wordMeanings.push(
          quizWords[i].meaning[0].meaning.replace(/ *\([^)]*\) */g, "")
        );
      }
      // make quizzes
      var quizQuestionList = [];
      for (let i = 0; i < 10; i++) {
        var indexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // remove index of the right answer
        var tempArray = indexArray;
        tempArray.splice(i, 1);
        // randomize 3 wrong answers
        var buzzAnswersIndex = tempArray
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        // select where the right answer will be put
        var rightAnswerIndex = randomIntFromInterval(0, 3);
        // push the wrong answers in
        var buzzAnswers = [];
        for (let j = 0; j < 3; j++) {
          buzzAnswers.push(wordMeanings[buzzAnswersIndex[j]]);
        }
        // insert the right answer at the selected position
        buzzAnswers.splice(rightAnswerIndex, 0, wordMeanings[i]);
        var allAnswer = buzzAnswers;
        // create new question and add to list then continue
        var questionObject = {
          word: quizWords[i].word,
          allAnswer,
          rightAnswerIndex,
        };
        quizQuestionList.push(questionObject);
      }

      return res.status(200).json({
        quizQuestionList,
      });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.post("/save-result", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { result } = req.body;
    var newProgress = new Progress({
      userId: userId,
      date: new Date(Date.now() + 7 * 60 * 60000).setHours(0, 0,0,0),
      quizResult: result,
    });
    await newProgress.save();
    return res.status(200).json({ newProgress });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.get("/progress", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const personalProgress = await Progress.aggregate([
      {
        $project: {
          userId: 1,
          date: 1,
          quizResult: 1,
        },
      },
      {
        $match: {
          userId:new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
      // {$group:{
      //   _id: '$date'
      // }}
    ]);
    return res.status(200).json(personalProgress);
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

module.exports = router;
