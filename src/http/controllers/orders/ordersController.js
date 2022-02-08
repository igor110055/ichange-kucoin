const autoBind = require("auto-bind");
const httpErrors = require("http-errors");
const { v4: uuid } = require("uuid");
// UTILS
const estimateCrypto = require("../../../utils/estimate");
const redisRequester = require("../../../utils/redisRequester");
const chanins = require("../../../utils/chains");
// MODELS
const Trade = require("../../../models/trade");
class ordersController {
  constructor() {
    autoBind(this);
  }
  async estimate(req, res, next) {
    let { from, to, amount, toNetwork } = req.params;
    from = from.toUpperCase();
    to = to.toUpperCase();
    const symbols = from + "-" + to;
    let allCrypto;
    const findInRedisAllCrypto = await redisRequester.get("currencies");
    if (findInRedisAllCrypto != null) {
      allCrypto = JSON.parse(findInRedisAllCrypto);
    } else {
      allCrypto = await kucoin.getCurrencies();
      await redisRequester.set(
        "currencies",
        JSON.stringify(allCrypto),
        60 * 60 * 60
      );
    }
    const fromAndToCrypto = allCrypto.data.filter((crypto) => {
      return crypto.currency == from || crypto.currency == to;
    });
    if (fromAndToCrypto.length != 2) {
      return next(httpErrors(404, "ارز های انتخاب شده در سامانه موجود نیست"));
    }
    const chaninsData = await chanins(to, toNetwork.toUpperCase());
    if (chaninsData == undefined) {
      return next(httpErrors(404, "شبکه ی ارسال شده یافت نشد"));
    }
    // const cryptoNetworks = redisRequester.get('')
    const result = await estimateCrypto(
      from,
      to,
      amount,
      symbols,
      chaninsData,
      next
    );
    return res.json({
      status: true,
      statusCode: 200,
      message: "مسیر یابی انجام شد",
      data: result,
    });
  }
  async addTrade(req, res, next) {
    const {
      from,
      to,
      depositAddress,
      fromNetwork,
      toNetwork,
      estimate,
      withdrawAddress,
    } = req.body;
    const addTeade = new Trade({
      from,
      to,
      fromNetwork,
      toNetwork,
      estimate,
      withdrawAddress,
      deposit: false,
      depositAddress,
      status: "wating",
    });
    addTeade.save((err, data) => {
      if (err) {
        console.log(err);
      } else {
        return res.json({
          status: true,
          statusCode: 200,
          message: "add trade to api",
          data,
        });
      }
    });
  }
  async trade(req, res, next) {
    const { transationId, from, to } = req.params;
    const transatcionValidation = await this.walletTxId(transationId, next);
    if (transatcionValidation.length == 0) {
      return next(httpErrors(400, "ایدی تراکنش ارسال شده معتبر نمی باشد"));
    }
  }
  async walletTxId(id, next) {
    const depostiList = await kucoin.getDepositList();
    if (depostiList.code !== "200000") {
      return next(httpErrors(400, "درخواست با شکست مواجه شد"));
    }
    const depostiListValue = depostiList.data.items;
    const haveTranstactionId = depostiListValue.filter((deposit) => {
      return deposit.walletTxId !== null && deposit.walletTxId == id;
    });
    return haveTranstactionId;
  }
}

module.exports = new ordersController();
