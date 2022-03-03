const router = require("express").Router();

// CONTROLLERS
const tradeController = require("../../http/controllers/trades/tradesController");

router.get("/", tradeController.fetchAllTrades);
router.get('/:id' , tradeController.fetchSingleTrades)
module.exports = router;
