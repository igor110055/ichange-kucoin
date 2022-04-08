const httpErrors = require("http-errors");

// MODELS
const Users = require("../../../../models/users");
const ChangeEmail = require('../../../../models/changeEmail');
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
    const { firstName, lastName, nationalIdNumber, birthDay } = req.body;
    const findUserWithNationalId = await Users.findOne({
      id: req.user.id,
      nationalIdNumber,
    });
    if (findUserWithNationalId) {
      return next(httpErrors(400, "کاربری با این کد ملی در سامانه موجود است"));
    }
    const updateUser = await Users.findByIdAndUpdate(req.user.id, {
      $set: { firstName, lastName, nationalIdNumber, birthDay },
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
    if (findUserWithNewEmail && findUserWithNewEmail.id != req.user.id) {
      return next(
        httpErrors(400, "کاربری با ایمیل ارسال شده در سامانه موجود است")
      );
    }

    const findUser = await Users.findById(req.user.id);
    if(!findUser){
        return next(httpErrors(404 , "چنین کاربری در سامانه موحود نیست"))
    }
    const addChangeEmail = new ChangeEmail({
        newEmail : email ,
        lastEmail : findUser.email,
        user : findUser.id
    })
    addChangeEmail.save((err, data)=>{
        if(err){
            console.log(err);
            return next(httpErrors(500 , "عملیات با شکست مواجه شد"));
        }
    })
    //   send link to email
  }

  async editEmailByLink(req,res,next){

  }
}

module.exports = new profileController();
