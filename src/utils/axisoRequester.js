const axios = require("axios").default;

module.exports = async (method, url, query, data) => {
  console.log("requesting to api...");
  let result;
  method = method.toUpperCase();
  if (method == "GET") {
    result = await axios({
      method: "get",
      url,
      params: { ...query },
      headers: {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": process.env.BINANCE_PRIVATE_KEY,
        "User-Agent": `@binance/connector-node/1.6.0`,
      },
    });
  } else if (method == "POST") {
    result = await axios({
      method: "post",
      url,
      params: { ...query },
      headers: {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": process.env.BINANCE_PRIVATE_KEY,
        "User-Agent": `@binance/connector-node/1.6.0`,
      },
    });
  }
  console.log("request to api finished");
  return result.data;
};
