const mongoose = require("mongoose");

const Commission = mongoose.Schema({
  percent: { type: Number, required: true },
});

module.exports = mongoose.model("commission", Commission);
