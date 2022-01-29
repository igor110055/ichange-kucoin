const httpErrors = require("http-errors");
const comission = require("../models/commission");
// UTILS
const percentCahnge = require("../utils/math/percentor");
module.exports = async (from, to, amount, symbols, next) => {
  const comissionPrecent = await comission.findOne({});
  let result;
  const bestPrice = [];
  const reverseSymbol = to + "-" + from;
  const allTikcers = await kucoin.getAllTickers();
  if (allTikcers.code !== "200000") {
    return next(httpErrors(400, "مشکل در دریافت symbols ها"));
  }
  // one step
  const findSymbolTikcer = allTikcers.data.ticker.filter((tikcer) => {
    return tikcer.symbol == symbols;
  });
  if (findSymbolTikcer.length != 0) {
    result = {
      main: false,
      price:
        percentCahnge(findSymbolTikcer[0].last, comissionPrecent.percent) *
        amount,
    };
    return result;
  }
  //   reverse symbols
  const reverseSymbolTicker = allTikcers.data.ticker.filter((ticker) => {
    return ticker.symbol == reverseSymbol;
  });
  if (reverseSymbolTicker.length != 0) {
    return {
      main: false,
      price:
        percentCahnge(
          1 / reverseSymbolTicker[0].last,
          comissionPrecent.percent
        ) * amount,
    };
  }
  const fromCoinConvert = [];
  const findFromCryptoConvert = allTikcers.data.ticker.forEach((ticker) => {
    const symbolSplit = ticker.symbol.split("-");
    if (symbolSplit[0] == from) {
      fromCoinConvert.push(symbolSplit[1]);
    }
  });
  const toCoinConvert = [];
  const findToCryptoConvert = allTikcers.data.ticker.filter((ticker) => {
    const symbolSplit = ticker.symbol.split("-");
    if (symbolSplit[0] == to) {
      toCoinConvert.push(symbolSplit[1]);
    }
  });
  const findCommonCrypto = [];
  if (fromCoinConvert.length > toCoinConvert.length) {
    fromCoinConvert.forEach((crypto) => {
      if (toCoinConvert.includes(crypto)) {
        findCommonCrypto.push(crypto);
      }
    });
  } else {
    toCoinConvert.forEach((crypto) => {
      if (fromCoinConvert.includes(crypto)) {
        findCommonCrypto.push(crypto);
      }
    });
  }
  const fromToConvertor = [];
  const toToConvert = [];
  findCommonCrypto.forEach((crypto) => {
    // find in all tikerPrice
    allTikcers.data.ticker.forEach((ticker) => {
      if (ticker.symbol == from + "-" + crypto) {
        fromToConvertor.push(ticker);
      } else if (ticker.symbol == to + "-" + crypto) {
        toToConvert.push(ticker);
      }
    });
  });
  fromToConvertor.forEach((ticker, index) => {
    const fromToConvertorPrice = ticker.last;
    const toToConvertorPrice = 1 / toToConvert[index].last;
    const price = fromToConvertorPrice * toToConvertorPrice;
    bestPrice[ticker.symbol.split("-")[1]] = price;
  });
  let price = {
    crypto: "",
    value: 0,
  };
  fromToConvertor.forEach((symbol) => {
    let crypto = symbol.symbol.split("-")[1];
    if (price.value < bestPrice[crypto]) {
      price.crypto = crypto;
      price.value = bestPrice[crypto];
    }
  });
  return {
    main: {
      crypto: price.crypto,
    },
    price: percentCahnge(price.value, comissionPrecent.percent) * amount,
  };
};
