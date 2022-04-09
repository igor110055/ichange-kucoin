const router = require('express').Router();

// CONTROLLER
const invitationController = require('../../../http/controllers/dashboard/invitation/invitationController');


router.post('/' ,invitationController.addInvitation)
router.get('/' , invitationController.getInvationUserList)
module.exports = router;