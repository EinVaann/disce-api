const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    quizContent: {
        type: ['Mixed']
    }
  });
module.exports = mongoose.model("Quiz", QuizSchema);