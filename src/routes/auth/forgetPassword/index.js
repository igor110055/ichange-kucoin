const router = require('express').Router();


// CONTROLLERS
const forgetPasswordController = require('../../../http/controllers/auth/forgetPassword/forgetPasswordController');


router.post('/' , forgetPasswordController.sendCodeForUser);
router.put('/verifyandchangePassword' ,forgetPasswordController.verifyCodeAndChangePassword )

module.exports = router;