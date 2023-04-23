const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  word: {
    type: String,
    require: true,
  },
  pronunciation: {
    type: String,
    require: true,
  },
  meaning: {
    type: ["Mixed"]
  },
});

module.exports = mongoose.model("Word", WordSchema);
