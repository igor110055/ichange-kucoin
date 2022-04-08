const router = require("express").Router();

// ROUTES
const profile = require("./profile/index");


// ROUTERING
router.use('/profile/' , profile)
module.exports = router;
