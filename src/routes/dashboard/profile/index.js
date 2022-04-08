const router = require("express").Router();

// CONTROLLERS
const profileController = require("../../../http/controllers/dashboard/profile/profileController");

// ROUTERING
router.get("/", profileController.index);

router.put('/edit' , profileController.edit);

router.put('/email' , profileController.editEmail);
router.get('/email/verify/bylink/:linkId' , profileController.editEmailByLink);
router.put('/email/verify/bycode/', profileController.editEmailByCode)

module.exports = router;
