var express = require("express");
require("dotenv").config();
const Word = require("../model/words");
var router = express.Router();
const GTTS = require('gtts');
const { translate } = require("bing-translate-api");
const thesaurus = require("word-thesaurus");


router.get("/", async function (req, res, next) {
  try {
    const wordList = await Word.find();
    const l = wordList.length;
    return res.status(200).json({
      numberOfWords: l,
      wordList,
    });
  } catch (err) {
    return res.status(400).json({
      messsage: "Err0r: " + err,
    });
  }
});

router.get("/find", async function (req, res, next) {
  try {
    const search_query = req.query.search_query;
    let queriedWord = [];
    const exactWord = await Word.aggregate([
      {
        $project: {
          word: 1,
          pronunciation: 1,
          meaning: 1,
          field_length: {
            $strLenCP: "$word",
          },
        },
      },
      {
        $match: {
          word: search_query,
        },
      },
    ]);
    if (exactWord.length > 0) {
      queriedWord = queriedWord.concat(exactWord);
    }
    const queriedWord2 = await Word.aggregate([
      {
        $project: {
          word: 1,
          pronunciation: 1,
          meaning: 1,
          field_length: {
            $strLenCP: "$word",
          },
        },
      },
      {
        $match: {
          $and: [
            { word: { $regex: search_query, $options: "i" } },
            { word: { $ne: search_query } },
          ],
        },
      },
      { $limit: 100 },
      {
        $sort: {
          field_length: 1,
        },
      },
    ]);
    if (queriedWord2.length > 0) {
      queriedWord = queriedWord.concat(queriedWord2);
    }
    return res.status(200).json({
      numberOfResults: queriedWord.length,
      queriedWord,
    });
  } catch (err) {
    return res.status(400).json({
      messsage: "Err0r: " + err,
    });
  }
});

router.get("/hear", function (req, res) {
  const gtts = new GTTS(req.query.text, "en");
  res.set({ "Content-Type": "audio/mpeg" });
  gtts.stream().pipe(res);
});

router.get("/trans", function (req, res) {
  translate(req.query.text, "vi", "en", true)
    .then((ress) => {
      res.redirect("/api/v1/words/find?search_query=" + ress.translation);
    })
    .catch((err) => {
      return res.status(500).json({ err });
    });
});

router.get("/thesaurus", function (req, res) {
  var text = thesaurus.find(req.query.text);
  return res.status(200).json(text);
});

router.get("/mean", async function (req, res, next) {
  try {
    const meaning = req.query.meaning;
    const queriedWord = await Word.find({
      "meaning.meaning": { $regex: meaning, $options: "i" },
    });
    const thiss = queriedWord[0].meaning[0].wordType;
    return res.status(200).json({
      queriedWord,
      answer: thiss,
    });
  } catch (err) {
    return res.status(400).json({
      messsage: "Err0r: " + err,
    });
  }
});
module.exports = router;
