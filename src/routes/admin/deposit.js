const router = require('express').Router();


// CONTROLLERS
const depositController = require('../../http/controllers/admin/depositController');


router.get('/', depositController.fetchAllDeposit)

module.exports = router;