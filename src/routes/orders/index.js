const router = require("express").Router();

// CONTROLLERS
const ordersController = require("../../http/controllers/orders/ordersController");
// VALIDATIONS
const validation = require("../../http/validations/validation");
const orderValidator = require("../../http/validations/orders");
// MIDDLEWARES

router.get(
  "/estimate/:from/:to/:amount",
  orderValidator.estimate(),
  validation.fildesValidate,
  ordersController.estimate
);

router.post("/trade/:from/:to/:amount", ordersController.tradeTest);
module.exports = router;
