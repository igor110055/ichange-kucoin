const router = require("express").Router();

// CONTROLLERS
const profileController = require("../../../http/controllers/dashboard/profile/profileController");

// ROUTERING
router.get("/", profileController.index);

module.exports = router;
