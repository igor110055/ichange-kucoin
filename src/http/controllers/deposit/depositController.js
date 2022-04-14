const httpErrors = require("http-errors");
const Trade = require("../../../models/trade");
const Deposit = require("../../../models/deposit");
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
    const { transatctionId, currency, tradeId } = req.body;
    const transatctionIdRealValue = (transatctionId) => {
      if (transatctionId.includes("http")) {
        const transatctionIdUrlContent = transatctionId.split("/");
        return transatctionIdUrlContent[transatctionIdUrlContent.length - 1];
      }
      return transatctionId;
    };
    const depostiList = await kucoin.getDepositList();
    if (depostiList.code !== "200000") {
      return next(httpErrors(400, "درخواست با شکست مواجه شد"));
    }
    const depostiListValue = depostiList.data.items;
    const haveTranstactionId = depostiListValue.filter((deposit) => {
      return (
        deposit.walletTxId !== null &&
        deposit.walletTxId.slice(0, deposit.walletTxId.indexOf("@")) ==
          transatctionIdRealValue(transatctionId) &&
        deposit.currency == currency.toUpperCase()
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
    let result = null;
    const findDeposit = await Deposit.findOne({
      walletTxId: transatctionIdRealValue(transatctionId),
    });
    if (!findDeposit) {
      const addDeposit = new Deposit({
        ...haveTranstactionId[0],
        walletTxId: transatctionIdRealValue(transatctionId),
      });
      addDeposit.save((err, data) => {
        if (err) {
          console.log(err);
        }
        result = data;
      });
    }else {
      result = findDeposit
    }
    
    return res.json({
      status: true,
      statusCode: 200,
      message: "دپوزیت انجام شده",
      data : result,
    });
  }
}

module.exports = new depositController();
