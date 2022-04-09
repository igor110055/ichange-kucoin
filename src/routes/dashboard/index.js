const router = require("express").Router();

// ROUTES
const profile = require("./profile/index");
const invitation = require('./invitation/index');

// ROUTERING
router.use('/profile/' , profile);
router.use('/invitation' , invitation)
module.exports = router;
