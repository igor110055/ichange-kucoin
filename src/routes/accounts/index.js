const router = require("express").Router();

// CONTROLLER
const accountController = require("../../http/controllers/accounts/accountController");
// MIDDLWEARE

// VALIDATIONS

// ROUTEING

// available
router.get("/list", accountController.listAccount);
router.post("/create/:currency", accountController.createAccount);

module.exports = router;
