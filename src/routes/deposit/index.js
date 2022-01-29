const router = require("express").Router();

// CONTROLLERS
const depositController = require("../../http/controllers/deposit/depositController");
// MIDDLWEARES

// VALIDATIONS

router.get("/address/:currency", depositController.fetchAddress);

router.post(
  "/create/address/:currency",
  depositController.createDepositAddress
);
module.exports = router;
