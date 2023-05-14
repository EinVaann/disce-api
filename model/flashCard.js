const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlashCardSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  wordList: [{ type: Schema.ObjectId, ref: "Word" }],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});

module.exports = mongoose.model("FlashCard", FlashCardSchema);
