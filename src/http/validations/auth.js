const {body} = require('express-validator');

class authValidatior {
    register(){
        return [
            body('username').notEmpty().withMessage('نام کاربری خود را وارد کنید'),
            body('password').notEmpty().withMessage('رمز عبور خود را وارد کنید'),
            body('email').notEmpty().withMessage('ایمیل خود را وارد کنید'),
        ]
    }

    login(){
        return [
            body('email').notEmpty().withMessage('ایمیل خود را وارد کنید'),
            body('password').notEmpty().withMessage('رمز عبور خود را وارد کنید'),
        ]
    }
}
module.exports = new authValidatior();