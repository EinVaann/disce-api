var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");
var FlashCard = require("../model/flashCard");
const Words = require("../model/words");
router.get("/", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const cardList = await FlashCard.find({ userId: userId });
    return res.status(200).json({
      NumberOfCard: cardList.length,
      cardList,
    });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.get("/get", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const cardId = req.query.cardId;
    // get and check
    const flashCard = await FlashCard.findOne({
      _id: cardId,
      userId: userId,
    }).populate("wordList");
    if (!flashCard) {
      return res.status(400).json({
        message: "Can't find designated flash card",
      });
    } else {
      return res.status(200).json({
        WordsIdCard: flashCard.wordList.length,
        flashCard,
      });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.post("/create", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { name } = req.body;
    const wordList = [];
    const newFlashCard = new FlashCard({
      name,
      wordList,
      userId,
    });
    await newFlashCard.save();
    return res.status(200).json({ newFlashCard });
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.put("/addWord", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { wordId, flashCardId } = req.body;
    //check exist flashCard
    const checkFlashCard = await FlashCard.findOne({ _id: flashCardId });
    if (!checkFlashCard || checkFlashCard.userId != userId) {
      return res.status(400).json({
        message: "FlashCard is not existed!",
      });
    } else {
      var wordList = checkFlashCard.wordList;
      if (wordList.indexOf(wordId) != -1) {
        return res.status(400).json({
          message: "Word is already in this card.",
        });
      }
      wordList.push(wordId);
      var editedFlashCard = {
        name: checkFlashCard.name,
        wordList,
        userId: checkFlashCard.userId,
      };
      const afterEdit = await FlashCard.findByIdAndUpdate(
        flashCardId,
        editedFlashCard,
        { new: true }
      );
      return res.status(200).json({ flashCard: afterEdit });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.put("/remove-multiple-word", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { wordIds, flashCardId } = req.body;
    console.log(wordIds);
    const checkFlashCard = await FlashCard.findOne({
      _id: flashCardId,
      userId: userId,
    });
    if (!checkFlashCard) {
      return res.status(400).json({
        message: "FlashCard is not existed!",
      });
    } else {
      var wordList = checkFlashCard.wordList;
      for (var i = 0; i < wordIds.length; i++) {
        console.log(wordIds[i]);
        if (wordList.indexOf(wordIds[i]) == -1) {
          console.log("conti");
          continue;
        }
        wordList.splice(wordList.indexOf(wordIds[i], 1));
      }
      var editedFlashCard = {
        name: checkFlashCard.name,
        wordList,
        userId: checkFlashCard.userId,
      };
      const afterEdit = await FlashCard.findByIdAndUpdate(
        flashCardId,
        editedFlashCard,
        { new: true }
      );
      return res.status(200).json({ flashCard: afterEdit });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.put("/add-multiple-word", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { words, flashCardId } = req.body;
    console.log(words);
    const checkFlashCard = await FlashCard.findOne({
      _id: flashCardId,
      userId: userId,
    });
    if (!checkFlashCard) {
      return res.status(400).json({
        message: "FlashCard is not existed!",
      });
    } else {
      var wordList = await Words.aggregate([
        {
          $project: {
            word: 1,
            pronunciation: 1,
            meaning: 1,
          },
        },
        {
          $match: {
            word: { $in: words },
          },
        },
      ]);
      var existedWordList = checkFlashCard.wordList;
      for (var i = 0; i < wordList.length; i++) {
        if(!(wordList[i]._id in existedWordList)){
          existedWordList.push(wordList[i])
        }
      }
      var editedFlashCard = {
        name: checkFlashCard.name,
        wordList: existedWordList,
        userId: checkFlashCard.userId,
      };
      const afterEdit = await FlashCard.findByIdAndUpdate(
        flashCardId,
        editedFlashCard,
        { new: true }
      );
      return res.status(200).json({ flashCard: afterEdit });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.put("/removeWord", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { wordId, flashCardId } = req.body;
    const checkFlashCard = await FlashCard.findOne({
      _id: flashCardId,
      userId: userId,
    });
    if (!checkFlashCard) {
      return res.status(400).json({
        message: "FlashCard is not existed!",
      });
    } else {
      var wordList = checkFlashCard.wordList;
      if (wordList.indexOf(wordId) == -1) {
        return res.status(400).json({
          message: "Word isn't in this card.",
        });
      }
      wordList.splice(wordList.indexOf(wordId), 1);
      var editedFlashCard = {
        name: checkFlashCard.name,
        wordList,
        userId: checkFlashCard.userId,
      };
      const afterEdit = await FlashCard.findByIdAndUpdate(
        flashCardId,
        editedFlashCard,
        { new: true }
      );
      return res.status(200).json({ flashCard: afterEdit });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.put("/rename", auth, async function (req, res, next) {
  try {
    const userId = req.userId;
    const { newName, flashCardId } = req.body;
    const checkFlashCard = await FlashCard.findOne({
      _id: flashCardId,
      userId: userId,
    });
    if (!checkFlashCard) {
      return res.status(400).json({
        message: "FlashCard is not existed!",
      });
    } else {
      var editedCard = {
        name: newName,
        wordList: checkFlashCard.wordList,
        userId: userId,
      };
      const afterEdit = await FlashCard.findByIdAndUpdate(
        flashCardId,
        editedCard,
        { new: true }
      );
      return res.status(200).json({
        editedCard: afterEdit,
      });
    }
  } catch (error) {
    const err = new Error("Internal Server Error");
    err.status = 500;
    next(err);
    return res.status(500).json({ success: false, message: "" + error });
  }
});

router.delete("/delete", auth, async function (req, res, next) {
  try {
    const deletingCardId = req.query.cardId;
    //check existing
    const deletingCard = await FlashCard.findOne({ _id: deletingCardId });
    if (!deletingCard || deletingCard.userId != req.userId) {
      return res.status(400).json({
        message: "Can't delete card due to various reason.",
      });
    } else {
      await FlashCard.findByIdAndDelete(deletingCardId);
      return res.status(200).json({
        message: "Deleted card!",
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
