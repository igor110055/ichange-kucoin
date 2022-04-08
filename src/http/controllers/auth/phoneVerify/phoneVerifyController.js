const httpErrors = require("http-errors");

// MODELS
const Users = require("../../../../models/users");

const phoneNumberCodes = require("../../../../models/phoneNumberCodes");
// UTILS

class phoneVerifyController {
  async verify(req, res, next) {
    const { code } = req.body;
    const user = await Users.findById(req.user.id);
    if (user && user.phoneNumberVerify) {
      return next(400, "شماره تلفن کاربر مورد نظر تایید شده است");
    }
    const findUserCode = await phoneNumberCodes.findOne({
      userId: req.user.id,
      used: false,
    });
    if (!findUserCode) {
      return next(
        404,
        "کدی برای کاربر یافت نشد یا مدت زمان یا کد استفاده شده است"
      );
    }
    if (findUserCode.code != code) {
      return next(400, "کد ارسال شده صحیح نمی باشد");
    }

    const updateUser = await Users.findByIdAndUpdate(req.user.id, {
      $set: { phoneNumberVerify: true },
    });

    return res.json({
      status: true,
      statusCode: 200,
      message: "شماره تلفن کاربر مورد نظر تایید شد",
    });
  }
}

module.exports = new phoneVerifyController();
