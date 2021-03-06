const httpErrors = require("http-errors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
// UTILS
const redisRequester = require("../../../utils/redisRequester");
const queryObjectGenerator = require("../../../utils/queryObjectGenerator");
class currenciesController {
  async fetchAllAvailable(req, res, next) {
    const querys = queryObjectGenerator(
      ["isDepositEnabled", "isWithdrawEnabled", "logo"],
      req.query
    );
    let data;
    let findInRedis = await redisRequester.get("currencies");
    const logoNames = fs.readdirSync(
      path.resolve("./public/images/CryptoLogo")
    );
    findInRedis = JSON.parse(findInRedis);
    findInRedis.data = findInRedis.data.map((crypto) => {
      const cryptoLogoIndex = logoNames.indexOf(crypto.name + ".png");
      if (cryptoLogoIndex != -1) {
        crypto["logo"] =
          req.hostname == "localhost"
            ? `http://localhost:3000/public/images/CryptoLogo/${crypto.name}.png`
            : `http://51.210.225.161:3000/public/images/CryptoLogo/${crypto.name}.png`;
      } else {
        crypto["logo"] = false;
      }
      return crypto;
    });
    findInRedis = JSON.stringify(findInRedis);
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
    // return res.json(data);
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
      message: "???????????? ?????????? ?????? ?????? ???????? ?????????? ???? ????????????",
      data: result,
    });
  }
  async fetchSingleAvailable(req, res, next) {
    let { currency } = req.params;
    currency = currency.toUpperCase();
    const request = await axios.get(
      `${process.env.KUCOIN_BASE_URL}/api/v2/currencies/${currency}`
    );
    if (request.data.code !== "200000") {
      return next(httpErrors(404, "???????? ???????? ???? ???????????? ?????????? ??????????????"));
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "???????????? ?????? ???????? ?????? ???? ????????????",
      data: request.data.data,
    });
  }
}

module.exports = new currenciesController();
