const router = require('express').Router();

// CONTROLLERS
const phoneVerifyController = require('../../../http/controllers/auth/phoneVerify/phoneVerifyController');


router.put('/' , phoneVerifyController.verify)

module.exports = router;