const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserInfosSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  friendList: [{
    type: Schema.Types.ObjectId,
    ref: 'Users'
    }],
  nickName: {
    type: String,
    require: false,
  }
    
});

module.exports = mongoose.model("UserInfos", UserInfosSchema);
