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
  user: {
    type: mongooose.Schema.Types.ObjectId,
    ref: "users",
  },
  used: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongooose.model("ChagngeEmails", ChangeEmail);
