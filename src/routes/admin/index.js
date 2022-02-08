const router = require("express").Router();

// ROUTES
const deposit = require("./deposit");
const orders = require("./orders");
const trades = require("./treades");
// CONTROLLER
const commissionController = require("../../http/controllers/admin/commissionController");
// VALIDATIONS
const validations = require("../../http/validations/validation");
const commissionValidator = require("../../http/validations/commission");

router.get("/commission", commissionController.index);
router.put(
  "/commission",
  commissionValidator.update(),
  validations.fildesValidate,
  commissionController.update
);

// ROUTERING
router.use("/deposit", deposit);
router.use("/orders", orders);
router.use("/trades", trades);
module.exports = router;
