const router = require("express").Router();


// ROUTES
const register = require('../../routes/auth/register/index')

// ROUTER
router.use('/register' , register)

module.exports = router;
