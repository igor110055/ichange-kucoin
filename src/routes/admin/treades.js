const router = require("express").Router();

// CONTROLLERS
const tradeController = require("../../http/controllers/admin/tradesController");

router.get("/", tradeController.fetchAllTrades);

module.exports = router;
