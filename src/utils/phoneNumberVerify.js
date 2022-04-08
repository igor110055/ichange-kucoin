
const axios = require("axios");

module.exports = async (receptor, param1, param2, templateName) => {
  const data = { receptor, param1, param2, template: templateName , type : 1};
  const request = await axios({
    method: "POST",
    url: "http://api.ghasedaksms.com/v2/send/verify",
    data,
    headers: { apikey: process.env.GHASEDAK_API_KEY },
  });
  console.log(request);
  return request.data.result == "success" ? true : false
};
