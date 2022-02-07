const httpErrors = require("http-errors");
const Trade = require("../../../models/trade");

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
  async checkDeposit(req, res, next) {
    const { transatctionId , currency } = req.params;
    const depostiList = await kucoin.getDepositList();
    if (depostiList.code !== "200000") {
      return next(httpErrors(400, "درخواست با شکست مواجه شد"));
    }
    const depostiListValue = depostiList.data.items;
    const haveTranstactionId = depostiListValue.filter((deposit) => {
      return (
        deposit.walletTxId !== null && deposit.walletTxId == transatctionId && deposit.currency == currency.toUpperCase()
      );
    });
    if (haveTranstactionId.length == 0) {
      return next(
        httpErrors(
          400,
          "ایدی شناسه ی ارسال شده صحیح نمی باشد یا دپوزیت انجام نشده"
        )
      );
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دپوزیت انجام شده",
      data: null,
    });
  }
}

module.exports = new depositController();
