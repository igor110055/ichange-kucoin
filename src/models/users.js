const mongooose = require("mongoose");
const bcrypt = require("bcrypt");

const User = mongooose.Schema({
  username: { type: String },
  password: { type: String, required: true },
  email: { type: String, default: null },
  emailVeryfied: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    required : true
  },
  phoneNumberVerify: {
    type: Boolean,
    default: false,
  },
  role: { type: String, default: "user" },
  // users information
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  birthDay: {
    type: Number,
    default: null,
  },
  nationalIdNumber: {
    type: Number,
    default: null,
  },
});

User.methods.comparePassword = async (hashPassword, password) => {
  const result = await bcrypt.compareSync(password, hashPassword);
  return result;
};

module.exports = mongooose.model("users", User);
