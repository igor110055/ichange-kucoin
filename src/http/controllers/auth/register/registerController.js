const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomNumber = require("random-number");
// MODESL
const Users = require("../../../../models/users");
const phoneNumberCodes = require("../../../../models/phoneNumberCodes");
const Invitation = require("../../../../models/invitation");
// UTILS
const phoneNumberVerify = require("../../../../utils/smsSender");
const autoBind = require("auto-bind");
class registerController {
  constructor() {
    autoBind(this);
  }
  async register(req, res, next) {
    const { phoneNumber, password } = req.body;
    const { invitation } = req.query;
    const findUser = await Users.findOne({ phoneNumber });
    if (findUser) {
      return next(httpErrors(400, "چنین کاربری در سامانه موجوداست"));
    }
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const addUser = new Users({
      password: hashPassword,
      phoneNumber,
    });
    const token = await jwt.sign(
      {
        id: addUser.id,
        role: addUser.role,
      },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: "24h",
      }
    );
    addUser.save(async (err, data) => {
      if (err) {
        console.log(err);
        return next(httpErrors(500, "ثبت نام با موفقیت انجام نشد"));
      } else {
        const sms = await this.createPhoneNumberVerification(data);
        if (!sms) {
          const removeUser = await Users.findByIdAndRemove(data.id);
          return next(
            httpErrors(500, "مشکل در ثبت نام کاربر لطفا دوباره ثبت نام کنید")
          );
        }

        if (invitation.length != 0) {
          await this.invitationUser(invitation , data.id)
        }
        return res.json({
          status: true,
          statusCode: 200,
          message: "ثبت نام با موفقیت انجام شد و کد تایید شماره تلفن ارسال شد",
          data: token,
        });
      }
    });
  }
  async createPhoneNumberVerification(user) {
    const code = randomNumber.generator({
      min: 10000,
      max: 99999,
      integer: true,
    });
    const useCode = code();
    const smsSending = await phoneNumberVerify(
      user.phoneNumber,
      "soex",
      useCode,
      process.env.PHONE_NUMBER_VERIFY_TEMPLATE_NAME
    );
    if (!smsSending) {
      return false;
    }
    const addCode = new phoneNumberCodes({
      code: useCode,
      userId: user.id,
      used: false,
    });
    addCode.save((err, data) => {
      if (err) {
        console.log(err);
        return false;
      }
    });
    return true;
  }

  async invitationUser(code, userId) {
    const findInvationCode = await Invitation.findOneAndUpdate(
      { referralCode: code },
      { $push: { friendShared: userId } }
    );
  }
}

module.exports = new registerController();
