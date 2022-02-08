const router = require("express").Router();

// CONTROLLERS
const ordersController = require("../../http/controllers/orders/ordersController");
// VALIDATIONS
const validation = require("../../http/validations/validation");
const orderValidator = require("../../http/validations/orders");
// MIDDLEWARES

router.get(
  "/estimate/:from/:to/:toNetwork/:amount",
  orderValidator.estimate(),
  validation.fildesValidate,
  ordersController.estimate
);
router.post("/add/trade/", ordersController.addTrade);
router.post("/trade/:from/:to/:amount/:transationId", ordersController.trade);
module.exports = router;
