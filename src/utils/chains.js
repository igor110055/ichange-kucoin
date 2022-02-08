const axios = require("axios");
// UTILS

module.exports = async (to , toNetwork) => {
  let toCryptoDetail = await axios.get(
    `${process.env.KUCOIN_BASE_URL}/api/v2/currencies/${to}`
  );
  const result = {};
  toCryptoDetail.data.data.chains.forEach((net) => {
    result[net.chainName] = net;
  });
  return result[toNetwork];
};
