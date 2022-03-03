const autoBind = require("auto-bind");
const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");
// MODESL
const Users = require("../../../../models/users");

class registerController {
  constructor() {
    autoBind(this);
  }
  async register(req, res, next) {
    const { username, password } = req.body;
    const filterFiled = this.emailOrPhone(username);
    const findUser = await Users.findOne(filterFiled);
    if(findUser){
        return next(httpErrors(400 , "چنین کاربری در سامانه موجوداست"))
    }
    const hashPassword = bcrypt.hashSync(password , bcrypt.genSaltSync(10));
    const addUser = new Users({
        password : hashPassword,
        ...filterFiled
    })
    // return console.log(addUser);
    addUser.save((err , data)=>{
        if(err){
            console.log(err);
            return next(httpErrors(500 , "ثبت نام با موفقیت انجام نشد"))
        }else{
            return res.json({
                status : true ,
                statusCode : 200,
                message : "ثبت نام با موفقیت انجام شد"
            })
        }
    })
  } 

  emailOrPhone(value) {
    if (value.includes("@")) {
      return { email: value };
    } else if (value.includes("+") && !value.includes("@")) {
      return { phoneNumber: value };
    }
  }
}

module.exports = new registerController();
