const router = require("express").Router();

// CONTROLLER
const currenciesController = require("../../http/controllers/currencies/currenciesController");
// MIDDLWEARE

// VALIDATIONS

// ROUTEING

// available
router.get("/available", currenciesController.fetchAllAvailable);
router.get("/available/:currency", currenciesController.fetchSingleAvailable);

module.exports = router;
