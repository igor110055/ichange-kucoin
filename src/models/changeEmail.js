const mongooose = require("mongoose");

const ChangeEmail = mongooose.Schema({
  newEmail: {
    type: String,
    required: true,
  },
  lastEmail: {
    type: String,
    required: true,
  },
  userId: {
    type: mongooose.Schema.Types.ObjectId,
    ref: "users",
  },
  linkId : {
    type : String , required : true,
  },
  code : {
    type : Number ,
    required : true
  },
  used: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongooose.model("ChagngeEmails", ChangeEmail);
