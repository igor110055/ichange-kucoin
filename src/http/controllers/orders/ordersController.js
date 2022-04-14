const autoBind = require("auto-bind");
const httpErrors = require("http-errors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
// UTILS
const estimateCrypto = require("../../../utils/estimate");
const redisRequester = require("../../../utils/redisRequester");
const chanins = require("../../../utils/chains");
const percentor = require("../../../utils/math/percentor");
const decimalRemover = require("../../../utils/math/removeDecimal");
// MODELS
const Trade = require("../../../models/trade");
const Comission = require("../../../models/commission");

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
    const { from, to, depositId, fromNetwork, toNetwork, withdrawAddress } =
      req.body;
    const addTeade = new Trade({
      from,
      to,
      fromNetwork,
      toNetwork,
      withdrawAddress,
      depositId,
      status: "deposited",
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
    let { to, tradeId } = req.body;
    to = to.toUpperCase();
    const findTrade = await Trade.findById(tradeId).populate([
      { path: "depositId" },
    ]);
    if (!findTrade) {
      return next(httpErrors(404, "تریدی با شناسه ی ارسال شده پیدا نشد"));
    }
    const from = findTrade.depositId.currency;
    const amount = findTrade.depositId.amount;
    const symbols = from + "-" + to;

    // update the trade
    const updateTrade = await Trade.findByIdAndUpdate(findTrade.id, {
      $set: {
        status: "trading",
        from,
      },
    });
    IO.emit("tradeStatus", "درحال مسیر یابی برای ترید");
    const estimate = await estimateCrypto(
      from,
      to,
      amount,
      symbols,
      findTrade.toNetwork.toUpperCase(),
      next
    );
    IO.emit("tradeStatus", "درحال تبدیل دارایی");
    if (estimate.main.crypto) {
      const trade = await this.tradeTwoSecend(
        from,
        to,
        estimate,
        amount,
        tradeId,
        next
      );
    } else {
      const trade = await this.tradeOneSecend(
        from,
        to,
        findTrade.toNetwork.toUpperCase(),
        findTrade.withdrawAddress,
        estimate,
        amount,
        tradeId,
        res,
        next
      );
      return trade;
    }
  }
  async tradeOneSecend(
    from,
    to,
    toNetwork,
    withdrawAddress,
    estimate,
    amount,
    tradeId,
    res,
    next
  ) {
    const commissionPercent = await Comission.findOne({});
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
    console.log("transfer to trade", innerTransferToTrade);
    if (innerTransferToTrade.code == "230003") {
      return next(httpErrors(400, "موجودی کافی نیست"));
    }
    if (innerTransferToTrade.code != "200000") {
      return next(httpErrors(400, "درخواست با موفقیت انجام نشد"));
    }
    const params = {
      clientOid: tradeId + "Tardeing",
      side: "sell",
      symbol: `${from}-${to}`,
      type: "market",
      price: estimate.basePrice,
      size: await percentor(amount, commissionPercent.percent || 1),
    };
    const trade = await kucoin.placeOrder(params);
    console.log("trading ", trade);
    if (trade.code != "200000") {
      return next(httpErrors(400, "درخواست با موفقیت انجام نشد"));
    }
    const order = await kucoin.getOrderById({ id: trade.data.orderId });
    console.log("order", order);
    if (order.code != "200000") {
      return next(httpErrors(400, "عملیات با موفقیت انجام نشد"));
    }
    const transferParamsToMain = {
      clientOid: tradeId + "transfer",
      currency: to,
      from: "trade",
      to: "main",
      amount: order.data.dealFunds,
    };
    const innerTransferToMain = await kucoin.innerTransfer(
      transferParamsToMain
    );
    console.log("transfer to main", innerTransferToMain);
    if (innerTransferToMain.code != "200000") {
      return next(httpErrors(400, "درخواست با موفقیت انجام نشد"));
    }
    if (innerTransferToMain.msg == "repeated requests") {
      await kucoin.innerTransfer(transferParamsToMain);
    }
    IO.emit("tradeStatus", "تبدیل با موفقیت انجام شد");
    await this.withdrawaing(next, to, withdrawAddress, "");
    return res.json({
      status: true,
      statusCode: 200,
      message: "ترید با موفقیت انجام شد",
      data: trade.data,
    });
  }
  async tradeTwoSecend(from, to, estimate, amount, tradeId, next) {
    const commissionPercent = await Comission.findOne({});
    const symbolsKucoin = await kucoin.getSymbols();
    const cryptoSymbolsFromToMain = symbolsKucoin.data.filter((symbol) => {
      return symbol.symbol == `${from}-${estimate.main.crypto}`;
    });
    const cryptoSymbolsMainToTO = symbolsKucoin.data.filter((symbol) => {
      return symbol.symbol == `${to}-${estimate.main.crypto}`;
    });
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
    if (innerTransferToTrade.code == "230003") {
      return next(httpErrors(400, "موجودی کافی نیست"));
    }
    if (innerTransferToTrade.code != "200000") {
      return next(httpErrors(400, "جابجایی از اکانت با موفقیت انجام نشد"));
    }
    const sellParams = {
      clientOid: tradeId,
      side: "sell",
      symbol: `${from}-${estimate.main.crypto}`,
      type: "market",
      size: percentor(amount, commissionPercent.percent || 1),
      timeInForce: "FOK",
    };
    const sellTrade = await kucoin.placeOrder(sellParams);
    console.log(sellTrade);
    if (sellTrade.code != "200000") {
      return next(
        httpErrors(
          400,
          `ترید ${
            from + "=>" + estimate.main.crypto
          } با تایب فروش با موفقیت انجام نشد`
        )
      );
    }
    const sellOrder = await kucoin.getOrderById({ id: sellTrade.data.orderId });
    if (sellOrder.code != "200000") {
      return next(
        httpErrors(
          400,
          "عملیات دریافت وضعیت ترید مرحله ی فروش با موفقیت انجام نشد"
        )
      );
    }
    const buySize = decimalRemover(
      sellOrder.data.dealFunds - sellOrder.data.fee,
      cryptoSymbolsFromToMain[0].quoteIncrement
    );
    const buyParams = {
      clientOid: tradeId,
      side: "buy",
      symbol: `${to}-${estimate.main.crypto}`,
      type: "market",
      funds: buySize,
      timeInForce: "FOK",
    };
    const buyTrade = await kucoin.placeOrder(buyParams);
    if (buyTrade.code != "200000") {
      return next(
        httpErrors(
          400,
          `ترید ${
            to + "=>" + estimate.main.crypto
          } با تایپ خرید با موفقیت انجام نشد`
        )
      );
    }
    const buyOrder = await kucoin.getOrderById({ id: buyTrade.data.orderId });
    if (buyOrder.code != "200000") {
      return next(
        httpErrors(
          400,
          "عملیات دریافت وضعیت ترید مرحله ی خرید با موفقیت انجام نشد"
        )
      );
    }
    // transfer from trade account to main account
    const transferParamsToMain = {
      clientOid: tradeId + "transfer",
      currency: to,
      from: "trade",
      to: "main",
      amount: percentor(buyTrade.data.sizeFunds),
    };
    const innerTransferToMain = await kucoin.innerTransfer(
      transferParamsToMain
    );
    if (innerTransferToMain.code == "230003") {
      return next(httpErrors(400, "موجودی کافی نیست"));
    }
    if (innerTransferToMain.code != "200000") {
      return next(httpErrors(400, "جابجایی از اکانت با موفقیت انجام نشد"));
    }
    if (innerTransferToMain.msg == "repeated requests") {
      await kucoin.innerTransfer(transferParamsToMain);
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "ترید با موفقیت انجام شد",
      data: buyTrade.data,
    });
  }

  async withdrawaing(next, currency, address, amount, memo, chain) {
    const params = {
      currency,
      address,
      amount,
      memo,
      chain,
    };
    IO.emit("tradeStatus", "درحال ارسال دارایی");
    const withdrawaing = await kucoin.applyForWithdrawal(params);
    if (withdrawaing.code != "200000") {
      return next(httpErrors(400, "در ارسال دارایی ها به مشکل بر خوردیم"));
    }
  }
}

module.exports = new ordersController();
