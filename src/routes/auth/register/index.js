const router = require('express').Router();


// CONTROLLER
const registerController = require('../../../http/controllers/auth/register/registerController');



router.post('/' , registerController.register)

module.exports = router;