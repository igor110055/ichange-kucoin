const axios = require("axios");
// UTILS

module.exports = async (to , toNetwork) => {
  const toCryptoDetail = await axios.get(
    `${process.env.KUCOIN_BASE_URL}/api/v2/currencies/${to}`
  );
  console.log()
  const result = {};
  toCryptoDetail.data.data.chains.forEach((net) => {
    result[net.chainName.toUpperCase()] = net;
  });
  return await result[toNetwork];
};
