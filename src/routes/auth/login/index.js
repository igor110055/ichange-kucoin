const router = require('express').Router();

// CONTROLLERS
const loginController = require('../../../http/controllers/auth/login/loginController');


router.post('/' , loginController.login)

module.exports = router;