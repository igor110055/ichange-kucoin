const httpErrors = require("http-errors");

// UTILS
const redisRequester = require("../../../utils/redisRequester");
class depositController {
  async fetchAddress(req, res, next) {
    let { currency } = req.params;
    currency = currency.toUpperCase();
    const params = {
      currency,
    };
    const data = await kucoin.getDepositAddress(params);
    if (data.code !== "200000") {
      return next(httpErrors(400, "آدرس دپوزیتی برای ارز وارد شده موجود نیست"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت آدرس دپوزیت ارز مورد نظر در سامانه",
      data: data.data,
    });
  }
  async createDepositAddress(req, res, next) {
    let { currency } = req.params;
    currency = currency.toUpperCase();
    const params = {
      currency,
    };
    const data = await kucoin.createDepositAddress(params);
    if (data.code !== "200000") {
      return next(httpErrors(400, "آدرس دپوزیت برای ارز ارسال شده موجود است"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: `ایجاد آدرس دپوزیت برای ارز ${currency} انجام شد`,
      data: data.data,
    });
  }
}

module.exports = new depositController();
