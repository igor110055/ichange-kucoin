const router = require("express").Router();

// ROUTES
const currencies = require("./currencies/index");
const auth = require("./auth/index");
const deposit = require("./deposit/index");
const orders = require("./orders/index");
const admin = require("./admin/index");
const accounts = require("./accounts/index");
const trades = require("./trades/index");
const dashboard = require("./dashboard/index");
// MIDDLEWARES
const hasRole = require("../http/middlewares/hasRole");
const hasToken = require("../http/middlewares/hasToken");
// ROUTEING
router.use("/currencies", currencies);
router.use("/auth", auth);
router.use("/deposit", deposit);
router.use("/orders", orders);
router.use("/accounts", accounts);
router.use("/trades", trades);
router.use("/dashboard", hasToken, dashboard);
router.use("/admin", hasToken, hasRole(["admin"]), admin);
module.exports = router;
