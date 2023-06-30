const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatLineSchema = new Schema({
  participant: [
    {
      type: Schema.Types.ObjectID,
      ref: "Users",
    },
  ],
  sender: {
    type: Schema.Types.ObjectID,
    ref: "Users",
  },
  content: {
    type: String,
    require: true,
  },
  time: {
    type: Date,
    require: true,
  },
});

module.exports = mongoose.model("ChatLine", ChatLineSchema);
