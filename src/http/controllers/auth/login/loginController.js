const httpErrors = require("http-errors");
const jwt = require("jsonwebtoken");
const randomNumber = require("random-number");
// MODELS
const Users = require("../../../../models/users");
const phoneNumberCodes = require("../../../../models/phoneNumberCodes");

// UTILS
const phoneNumberVerify = require("../../../../utils/smsSender");
const autoBind = require("auto-bind");

class loginController {
  constructor() {
    autoBind(this);
  }
  async login(req, res, next) {
    const { phoneNumber, password } = req.body;
    const findUser = await Users.findOne({ phoneNumber });
    if (!findUser) {
      return next(
        httpErrors(404, "کاربری با این اطلاعات در سامانه موجود نیست")
      );
    }
    const passwordChecking = await findUser.comparePassword(
      findUser.password,
      password
    );
    if (!passwordChecking) {
      return next(httpErrors(400, "اطلاعات وارد شده صحیح نمی باشد"));
    }

    const token = await jwt.sign(
      {
        id: findUser.id,
        role: findUser.role,
      },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: "24h",
      }
    );
    if (!findUser.phoneNumberVerify) {
      const sms = await this.createPhoneNumberVerification(findUser);
      console.log(sms);
      if (!sms) {
        return next(
          httpErrors(500, "مشکل در ارسال پیامک کاربر لطفا دوباره وارد شوید")
        );
      }
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: findUser.phoneNumberVerify
        ? "ورود با موفقیت انجام شد"
        : "ورود با موفقیت انجام شد و کد تایید شماره تلفن ارسال شد",
      data: token,
    });
  }
  async createPhoneNumberVerification(user) {
    const code = randomNumber.generator({
      min: 10000,
      max: 99999,
      integer: true,
    });
    const smsSending = await phoneNumberVerify(
      user.phoneNumber,
     "soex",
      code(),
      process.env.PHONE_NUMBER_VERIFY_TEMPLATE_NAME
    );
    if (!smsSending) {
      return false;
    }
    const addCode = new phoneNumberCodes({
      code : code(),
      userId: user.id,
      used: false,
    });
    addCode.save((err, data) => {
      if (err) {
        console.log(err);
        return false;
      }
    });
    return true
  }
}

module.exports = new loginController();
