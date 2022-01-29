// MODELS
const Users = require("../../../models/users");

// NPM MODULES
const bcrypt = require("bcrypt");
const httpErrors = require("http-errors");
const jwt = require("jsonwebtoken");

class authController {
  async login(req, res, next) {
    const { password, email } = req.body;

    //   Find user in db
    const user = await Users.findOne({ email });
    if (!user) {
      return next(httpErrors(404, "Not Found user with email"));
    }

    // check the password
    const checkPassword = await user.comparePassword(user.password, password);
    if (checkPassword == false) {
      return next(httpErrors(400, "password is incroectt"));
    }

    const token = await jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: "24h" }
    );

    return res.json({
      status: true,
      message: {
        en: "Login successfully",
        fa: "ورود با موفقیت انجام شد",
      },
      data: {
        token,
      },
    });
  }

  async register(req, res, next) {
    let { username, password, email } = req.body;

    // Find user by this email
    const user = await Users.findOne({ email });
    if (user) {
      return next(
        httpErrors(400, "user with this email is available in the system")
      );
    }
    ////
    password = await bcrypt.hashSync(password, 6);

    const addUser = new Users({ username, password, email, role: "admin" });
    addUser.save((err) => {
      if (err) {
        console.log(err);
        return next(httpErrors(500, "server Error"));
      }
    });

    // create token
    const token = await jwt.sign(
      {
        id: addUser.id,
        role: addUser.role,
        email: addUser.email,
      },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      status: true,
      message: {
        en: "User successfully registered",
        fa: "کاربر با موفقیت ثبت نام شد",
      },
      data: {
        token,
      },
    });
  }
}

module.exports = new authController();
