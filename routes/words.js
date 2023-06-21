var express = require("express");
const Word = require("../model/words");
var router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Gtts = require('gtts');

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
    console.log(req.userId);
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

router.get("/hear", function(req,res){
  const gtts = new Gtts(req.query.text, 'en');
  res.set({'Content-Type': 'audio/mpeg'});
  gtts.stream().pipe(res);
})

// router.post("/create", async function (req, res, next) {
//   try {
//     const { word, pronunciation, meaning } = req.body;

//     //validate
//     if (!word || !pronunciation || !meaning) {
//       return res.status(400).json({
//         message: "Missing information.",
//       });
//     }
//     // create object and save
//     var newWord = new Word({
//       word,
//       pronunciation,
//       meaning,
//     });
//     await newWord.save();
//     return res.status(200).json({
//       newWord,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       messsage: "Err0r: " + err,
//     });
//   }
// });

// router.delete("/delete", async function (req, res, next) {
//   try {
//     const word_id = req.query.word_id;
//     const deletedWord = await Word.findByIdAndDelete(word_id);
//     return res.status(200).json({
//       deletedWord,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       messsage: "Err0r: " + err,
//     });
//   }
// });

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

// router.post("/file", multer().single("file"), async function (req, res, next) {
//   try {
//     if (req.file != null) {
//       const dicString = String(req.file.buffer);
//       const dic = JSON.parse(dicString);
//       var count = 0;
//       // console.log(dic.length)
//       for (let i = 0; i < dic.length; i++) {
//         const newWord = new Word(dic[i]);
//         await newWord.save();
//         // console.log(count)
//         count++;
//       }
//       return res.status(200).json({
//         message: "received file add " + count + " file",
//       });
//     }
//   } catch (err) {
//     return res.status(400).json({
//       messsage: "Err0r: " + err,
//     });
//   }
// });
module.exports = router;
