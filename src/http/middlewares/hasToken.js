const httpErrors = require("http-errors");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  if (req.headers["authorization"] == undefined) {
    return next(httpErrors(401, "ورود بدون مجار توکن یافت نشد"));
  }
  let Token = req.headers["authorization"].split(" ")[1];
  if (Token) {
    try {
      const tokenValue = jwt.verify(Token, process.env.JWT_PRIVATE_KEY);
      req.user = tokenValue;
      next();
    } catch (error) {
      res.status = 401;
      return res.json({
        error: {
          message: "توکن ارسال شده منقضی شده است",
          status: res.status,
        },
      });
    }
  } else {
    return next(httpErrors(401, "ورود بدون مجار توکن یافت نشد"));
  }
};
