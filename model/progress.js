const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    date: {
        type: Date,
        require: true,
    },
    quizResult:{
        type: Number,
        require: true
    }
  });
module.exports = mongoose.model("Progress", ProgressSchema);