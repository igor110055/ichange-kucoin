const httpErrors = require("http-errors");

module.exports = (needRoles) => async (req, res, next) => {
  if (needRoles.includes(req.user.role)) {
    return next();
  }
  return next(httpErrors(401, "شما سطح مورد نیاز برای درخواست رو ندارید"));
};
