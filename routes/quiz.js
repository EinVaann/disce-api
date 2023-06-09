var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");
var FlashCard = require("../model/flashCard");
var Quiz = require("../model/quiz");

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
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
    if (flashCard.wordList.length < 10) {
      return res.status(400).json({
        message: "Flash card need more word to create a quiz.",
      });
    } else {
      // create quiz
      // get 10 random word
      var wordList = flashCard.wordList;
      var quizWords = wordList.sort(() => 0.5 - Math.random()).slice(0, 10);
      var wordMeanings = []
      for (let i = 0; i < 10; i++) {
        // console.log(quizWords[i].meaning[0].meaning)
        wordMeanings.push(quizWords[i].meaning[0].meaning)
      }
      // make quizs
      var quizQuestionList = [];
      var indexArray = [0,1,2,3,4,5,6,7,8,9]
      for (let i = 0; i < 10; i++) {
        // console.log(quizWords[i].word)
        var tempArray = indexArray;
        tempArray.splice(i,1);
        // console.log("---",tempArray)
        var buzzAnswersIndex = tempArray.sort(() => 0.5 - Math.random()).slice(0, 3);
        // console.log(buzzAnswersIndex)
        var rightAnswerIndex = randomIntFromInterval(0,3);
        var buzzAnswers = []
        for ( let j=0; j<3;j++){
            buzzAnswers.push(wordMeanings[buzzAnswersIndex[j]])
        }
        buzzAnswers.splice(rightAnswerIndex,0, wordMeanings[i])
        var allAnswer = buzzAnswers;
        var questionObject = {
            word: quizWords[i].word,
            allAnswer,
            rightAnswerIndex
        }
        quizQuestionList.push(questionObject)
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


module.exports = router;
