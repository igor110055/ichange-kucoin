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
    default: null,
  },
  phoneNumberVerify: {
    type: Boolean,
    default: false,
  },
  role: { type: String, default: "user" },
});

User.methods.comparePassword = async (hashPassword, password) => {
  const result = await bcrypt.compareSync(password, hashPassword);
  return result;
};

module.exports = mongooose.model("users", User);
