const autoBind = require("auto-bind");
const httpErrors = require("http-errors");
const {v4 : uuid} = require("uuid");
// UTILS
const estimateCrypto = require("../../../utils/estimate");
const redisRequester = require("../../../utils/redisRequester");

class ordersController {
  constructor() {
    autoBind(this);
  }
  async estimate(req, res, next) {
    let { from, to, amount } = req.params;
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
    const result = await estimateCrypto(from, to, amount, symbols, next);
    return res.json({
      status: true,
      statusCode: 200,
      message: "مسیر یابی انجام شد",
      data: result,
    });
  }

  async tradeTest(req, res, next) {
    let { from, to, amount } = req.params;
    from = from.toUpperCase();
    to = to.toUpperCase();
    const symbols = from + "-" + to;
    const estimated = await estimateCrypto(from, to, amount, symbols, next);
    if (!estimated.main) {
      console.log("1");
    } else {
      console.log("2");
    }
  }

  tradeOneStep(from, to, amount) {
    const params = {
      clientOid: uuid(),
      side: 'buy',
      symbol: string,
      price: string,
      size: string,
    }
  }
  tradeTwoStep(from, to, amount) {}
}

module.exports = new ordersController();
