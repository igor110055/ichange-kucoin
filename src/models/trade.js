const mongoose = require("mongoose");

const Trade = mongoose.Schema({
  status: {
    type: String,
    default:
      "deposited" /*  deposited and trading and withdrawing and failed and complete*/,
  },
  depositId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deposits",
  },
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
  withdrawAddress: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Trades", Trade);
