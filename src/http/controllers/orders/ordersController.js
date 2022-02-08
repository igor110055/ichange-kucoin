const autoBind = require("auto-bind");
const httpErrors = require("http-errors");
const { v4: uuid } = require("uuid");
// UTILS
const estimateCrypto = require("../../../utils/estimate");
const redisRequester = require("../../../utils/redisRequester");
const chanins = require("../../../utils/chains");
const percentor = require("../../../utils/math/percentor");
// MODELS
const Trade = require("../../../models/trade");
const Comission = require("../../../models/commission");
const { default: axios } = require("axios");
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
  async trade(req, res, next) {
    let { transationId, to, tradeId } = req.params;
    to = to.toUpperCase();
    const transatcionValidation = await this.walletTxId(transationId, next);
    if (transatcionValidation.length == 0) {
      return next(httpErrors(400, "ایدی تراکنش ارسال شده معتبر نمی باشد"));
    }
    const findTrade = await Trade.findById(tradeId);
    if (!findTrade) {
      return next(httpErrors(404, "تریدی با شناسه ی ارسال شده پیدا نشد"));
    }
    const from = transatcionValidation[0].currency;
    const amount = transatcionValidation[0].amount;
    const symbols = from + "-" + to;
    let fetchFromNetwork = await axios.get(
      `http://localhost:3000/api/v1/deposit/address/${from}`
    );
    fetchFromNetwork = fetchFromNetwork.data.data.filter((chain) => {
      return chain.address == transatcionValidation[0].address;
    });
    if (fetchFromNetwork.length == 0) {
      return next(httpErrors(404, "شبکه ی ارز مبدا پیدا نشد"));
    }
    // update the trade
    const updateTrade = await Trade.findByIdAndUpdate(findTrade.id, {
      $set: {
        status: "deposited",
        from,
        fromNetwork: fetchFromNetwork[0].chain,
        deposit: true,
      },
    });
    const chaninsData = await chanins(to, findTrade.toNetwork.toUpperCase());
    if (chaninsData == undefined) {
      return next(httpErrors(404, "شبکه ی ارسال شده یافت نشد"));
    }
    console.log(from, to);
    const estimate = await estimateCrypto(
      from,
      to,
      amount,
      symbols,
      chaninsData,
      next
    );
    if (estimate.main.crypto) {
      return res.json("dsdasd322");
    } else {
      const trade = await this.tradeOneSecend(
        from,
        to,
        estimate,
        amount,
        tradeId
      );
    }
  }
  async tradeOneSecend(from, to, estimate, amount, tradeId, next) {
    const transferParamsToTrade = {
      clientOid: tradeId + "transfer",
      currency: from,
      from: "main",
      to: "trade",
      amount: percentor(amount, commissionPercent.percent || 1),
    };
    const innerTransferToTrade = await kucoin.innerTransfer(
      transferParamsToTrade
    );
    console.log("transfered");
    const commissionPercent = await Comission.findOne({});
    const params = {
      clientOid: tradeId,
      side: "sell",
      symbol: `${from}-${to}`,
      type: "limit",
      price: estimate.priceWithOutWithdrawFee,
      size: percentor(amount, commissionPercent.percent || 1),
      timeInForce: "FOK",
    };
    const trade = await kucoin.placeOrder(params);
    console.log("traded");
    const transferParamsToMain = {
      clientOid: tradeId + "transfer",
      currency: to,
      from: "trade",
      to: "main",
      amount: percentor(amount, commissionPercent.percent || 1),
    };
    const innerTransferToMain = await kucoin.innerTransfer(
      transferParamsToMain
    );
    console.log("trasfred to main for withdraw");
    return trade;
  }
  async tradeTwoSecend(from, to, estimate, amount, tradeId, next) {
    const commissionPercent = await Comission.findOne({});
    const sellParams = {
      clientOid: tradeId,
      side: "sell",
      symbol: `${from}-${estimate.main.crypto}`,
      type: "limit",
      price: estimate.priceWithWithdrawFee,
      size: percentor(amount, commissionPercent.percent || 1),
      timeInForce: "FOK",
    };
    const sellTrade = await kucoin.placeOrder(sellParams);
    const buyParams = {
      clientOid: tradeId,
      side: "buy",
      symbol: `${estimate.main.crypto}-${to}`,
      type: "limit",
      price: estimate.priceWithOutWithdrawFee,
      size: percentor(amount, commissionPercent.percent || 1),
      timeInForce: "FOK",
    };

    const buyTraide = await kucoin.placeOrder();
  }
}

module.exports = new ordersController();
