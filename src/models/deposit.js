const mongoose = require("mongoose");

const Deposit = mongoose.Schema({
  currency: { type: String, required: true },
  status: { type: String, required: true },
  address: { type: String, required: true },
  memo: { type: String, required: false },
  isInner: { type: Boolean, default: false },
  amount: { type: Number, required: true },
  fee: { type: Number, required: true },
  walletTxId: { type: String, required: true },
  remark: { type: String, required: true },
});

module.exports = mongoose.model("deposits", Deposit);
