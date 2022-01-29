const httpErrors = require("http-errors");
const axios = require("axios");
// UTILS
const redisRequester = require("../../../utils/redisRequester");
const queryObjectGenerator = require("../../../utils/queryObjectGenerator");
class currenciesController {
  async fetchAllAvailable(req, res, next) {
    const querys = queryObjectGenerator(
      ["isDepositEnabled", "isWithdrawEnabled"],
      req.query
    );
    let data;
    const findInRedis = await redisRequester.get("currencies");
    if (findInRedis != null) {
      data = JSON.parse(findInRedis);
    } else {
      data = await kucoin.getCurrencies();
      await redisRequester.set(
        "currencies",
        JSON.stringify(data),
        60 * 60 * 60
      );
    }
    const result = [];
    data.data.forEach((currencie) => {
      if (Object.keys(querys).length == 0) {
        result.push(currencie);
      } else {
        let canPush = [];
        Object.keys(querys).forEach((query) => {
          if (currencie[query] == JSON.parse(querys[query])) {
            canPush.push(true);
          } else {
            canPush.push(false);
          }
        });
        if (!canPush.includes(false)) {
          result.push(currencie);
        }
      }
    });
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت تمامی ارز های قابل تبدیل در سامانه",
      data: result,
    });
  }
  async fetchSingleAvailable(req, res, next) {
    let { currency } = req.params;
    currency = currency.toUpperCase();
    const request = await axios.get(`${process.env.KUCOIN_BASE_URL}/api/v2/currencies/${currency}`);
    if (request.data.code !== "200000") {
      return next(httpErrors(404, "چنین ارزی در سامانه موجود نمیباشد"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت ارز مورد نظر در سامانه",
      data: request.data.data,
    });
  }
}

module.exports = new currenciesController();
