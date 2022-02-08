const router = require("express").Router();

// CONTROLLERS
const orderListController = require("../../http/controllers/admin/orderListController");

router.get("/", orderListController.fetchAllOrders);

module.exports = router;
