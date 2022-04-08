const router = require("express").Router();


// ROUTES
const register = require('../../routes/auth/register/index')
const login = require('../../routes/auth/login/index');



// ROUTER
router.use('/register' , register);
router.use('/login' , login);
module.exports = router;
