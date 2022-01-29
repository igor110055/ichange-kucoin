const mongooose = require("mongoose");
const bcrypt = require("bcrypt");
const User = mongooose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "user" },
});

User.methods.comparePassword = async (hashPassword, password) => {
  const result = await bcrypt.compareSync(password , hashPassword);
  return result;
};

module.exports = mongooose.model("users", User);
