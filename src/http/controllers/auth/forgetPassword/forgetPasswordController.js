const httpErrors = require("http-errors");
const randomNumber = require("random-number");
const bcrypt = require("bcrypt");
// MODELS
const Users = require("../../../../models/users");
const ForgetPassword = require("../../../../models/forgetPassword");

// UTILS
const forgetPasswordVerify = require("../../../../utils/smsSender");
class forgetPasswordController {
  async sendCodeForUser(req, res, next) {
    const { phoneNumber } = req.body;
    const findUser = await Users.findOne({ phoneNumber });
    if (!findUser) {
      return next(httpErrors(404, "کاربر مورد نظر یافت نشد"));
    }
    const randomCode = randomNumber.generator({ min: 10000, max: 99999, integer: true });
    const useCode = randomCode();
    const addForgetPassword = new ForgetPassword({
      userId: findUser.id,
      used: false,
      code: useCode,
    });
    addForgetPassword.save((err, data) => {
      if (err) {
        console.log(err);
      }
    });
    // send sms
    const sendSms = await forgetPasswordVerify(
      phoneNumber,
      "soex",
      useCode,
      process.env.FORGET_PASSWORD_VERIFY_TEMPLATE_NAME
    );
    if (!sendSms) {
      return next(httpErrors(500, "خطا در ارسال کد به شماره تلفن"));
    }
    return res.json({
      status: true,
      message: "کد تایید به شماره تلفن وارد شده ارسال شد",
      statusCode: 200,
    });
  }

  async verifyCodeAndChangePassword(req, res, next) {
    const { code, password, phoneNumber } = req.body;
    const findForgetPassword = await ForgetPassword.findOne({
      phoneNumber,
      used: false,
    });
    if (!findForgetPassword) {
      return next(
        httpErrors(404, "کاربر مورد نظر یافت نشد یا مد منقضی شده است")
      );
    }
    if (findForgetPassword.code != code) {
      return next(httpErrors(400, "کد ارسال شده صحیح نمی باشد"));
    }
    const hashPassword = await bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(10)
    );
    const updatePassword = await Users.findByIdAndUpdate(
      findForgetPassword.userId,
      { $set: { password: hashPassword } }
    );
    if (!updatePassword) {
      return next(httpErrors(404, "کاربری یافت نشد"));
    }
    return res.json({
      status: true,
      message: "رمز عبور با موفقیت ویرایش شد",
      statusCode: 200,
    });
  }
}

module.exports = new forgetPasswordController();
