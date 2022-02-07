const httpErrors = require("http-errors");
const { v4: uuid } = require("uuid");

// UTILS
const axiosRequester = require("../../../utils/axisoRequester");
class accountController {
  async listAccount(req, res, next) {
    const accounts = await kucoin.getAccounts();
    if (accounts.code !== "200000") {
      return next(httpErrors(500, "درخواست با موفقیت انجام نشد"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت اکانت ها",
      data: accounts.data,
    });
  }

  async createAccount(req, res, next) {
    const { currency } = req.params;
    const params = {
      currency : currency.toUpperCase(),
      type: "main",
    };
    const createAccount = await kucoin.createAccount(params);
    if(createAccount.code == "230005"){
        return next(httpErrors(400 , "اکانت برای ارز وارد شده موجود است"))
    }
    if (createAccount.code !== "200000") {
      return next(httpErrors(400, "مشکل در ایجاد اکانت"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "اکانت ایجاد شد",
      data: createAccount.data,
    });
  }
}

module.exports = new accountController();
