const mongoose = require("mongoose");

const Trade = mongoose.Schema({
  status: { type: String, default: "wating"  /* wating and deposited and trading and withdrawing and failed and complete*/},
  deposit: { type: Boolean, default: false },
  depositAddress: { type: String, required: true },
  from: { type: String, required: true },
  to: {
    type: String,
    required: true,
  },
  fromNetwork: {
    type: String,
    required: true,
  },
  toNetwork: {
    type: String,
    required: true,
  },
  estimate: {
    type: String,
    required: true,
  },
  withdrawAddress: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Trades", Trade);
