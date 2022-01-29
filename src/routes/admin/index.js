const router = require("express").Router();

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

module.exports = router;
