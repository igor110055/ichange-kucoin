const router = require("express").Router();

// CONTROLLER
const authController = require("../../http/controllers/auth/authController");
// MIDDLWEARE

// VALIDATIONS
const validations = require("../../http/validations/validation");
const authValidatior = require("../../http/validations/auth");
// ROUTEING
router.post(
  "/register",
  authValidatior.register(),
  validations.fildesValidate,
  authController.register
);

router.post(
  "/login",
  authValidatior.login(),
  validations.fildesValidate,
  authController.login
);
module.exports = router;
