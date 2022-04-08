const router = require("express").Router();


// ROUTES
const register = require('./register/index')
const login = require('./login/index');
const phoneNumberVerify = require('./phoneVerify/index')

// MIDDLWARES
const hasToken = require('../../http/middlewares/hasToken');

// ROUTER
router.use('/register' , register);
router.use('/login' , login);
router.use('/phoneVerify' , hasToken , phoneNumberVerify);
module.exports = router;
