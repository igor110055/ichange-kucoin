const httpErrors = require("http-errors");
const { v4: uuidv4 } = require("uuid");
const randomNumber = require("random-number");
// MODELS
const Users = require("../../../../models/users");
const ChangeEmail = require("../../../../models/changeEmail");
class profileController {
  async index(req, res, next) {
    const findUser = await Users.findById(req.user.id);
    if (!findUser) {
      return next(httpErrors(404, "کاربر مورد نظر یافت نشد"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت اطلاعات کاربر",
      data: findUser,
    });
  }

  async edit(req, res, next) {
    const findUser = await Users.findById(req.user.id);
    if (!findUser) {
      return next(httpErrors(404, "کاربر مورد نظر یافت نشد "));
    }
    const updateUser = await Users.findByIdAndUpdate(req.user.id, {
      $set: { ...req.body },
    });
    if (!updateUser) {
      return next(httpErrors(500, "درخواست با موفقیت انجام نشد"));
    }
    const newUserData = await Users.findById(req.user.id);
    return res.json({
      status: true,
      statusCode: 200,
      message: "اطلاعات کاربر مورد نظر ویرایش شد",
      data: newUserData,
    });
  }
  async editEmail(req, res, next) {
    const { email } = req.body;
    const findUserWithNewEmail = await Users.findOne({ email });
    if (findUserWithNewEmail) {
      return next(
        httpErrors(400, "کاربری با ایمیل ارسال شده در سامانه موجود است")
      );
    }
    const findUser = await Users.findById(req.user.id);
    if (!findUser) {
      return next(httpErrors(404, "چنین کاربری در سامانه موحود نیست"));
    }
    const randomcode = await randomNumber.generator({
      min: 10000,
      max: 99999,
      integer: true,
    });
    const useCode = randomcode();
    const addChangeEmail = new ChangeEmail({
      newEmail: email,
      lastEmail: findUser.email || "example@gmail.com",
      userId: findUser.id,
      linkId: uuidv4(),
      code: useCode,
    });
    addChangeEmail.save((err, data) => {
      if (err) {
        console.log(err);
        return next(httpErrors(500, "عملیات با شکست مواجه شد"));
      }
    });
    //   send link to email
    const sendEmail = "sended";
    return res.json({
      status: true,
      message: "به ایمیل ارسال شده ایمیلی ارسال شده",
      statusCode: 200,
    });
  }

  async editEmailByLink(req, res, next) {
    const { linkId } = req.params;
    const findEmailChange = await ChangeEmail.findOne({
      linkId,
      userId: req.user.id,
    });
    if (!findEmailChange) {
      return next(httpErrors(404, "لینک معتبر نمی باشد"));
    }
    if (findEmailChange.used) {
      return next(httpErrors(400, "لینک منقضی شده است"));
    }
    const findUser = await Users.findById(findEmailChange.userId);
    if (!findUser) {
      return next(httpErrors(404, "کاربری برای تغییر ایمیل یافت نشد"));
    }
    const updateUserEmail = await Users.findByIdAndUpdate(
      findEmailChange.userId,
      { $set: { email: findEmailChange.newEmail, emailVeryfied: true } }
    );
    if (!updateUserEmail) {
      return next(httpErrors(500, "مشکلی در ویرایش ایمیل به وجود امده "));
    }
    const updateChangeEmail = await ChangeEmail.findByIdAndUpdate(
      findEmailChange.id,
      { $set: { used: true } }
    );
    return res.json({
      status: true,
      message: "ایمیل کاربر با موفقیت ویرایش شد",
      statusCode: 200,
    });
  }

  async editEmailByCode(req, res, next) {
    const { code } = req.body;
    const findEmailChange = await ChangeEmail.findOne({
      code,
      userId: req.user.id,
    });
    if (!findEmailChange) {
      return next(httpErrors(404, "کد معتبر نمی باشد"));
    }
    if (findEmailChange.used) {
      return next(httpErrors(400, "کد منقضی شده است"));
    }
    const findUser = await Users.findById(findEmailChange.userId);
    if (!findUser) {
      return next(httpErrors(404, "کاربری برای تغییر ایمیل یافت نشد"));
    }
    const updateUserEmail = await Users.findByIdAndUpdate(
      findEmailChange.userId,
      { $set: { email: findEmailChange.newEmail, emailVeryfied: true } }
    );
    if (!updateUserEmail) {
      return next(httpErrors(500, "مشکلی در ویرایش ایمیل به وجود امده "));
    }
    const updateChangeEmail = await ChangeEmail.findByIdAndUpdate(
      findEmailChange.id,
      { $set: { used: true } }
    );
    return res.json({
      status: true,
      message: "ایمیل کاربر با موفقیت ویرایش شد",
      statusCode: 200,
    });

  }
}

module.exports = new profileController();
