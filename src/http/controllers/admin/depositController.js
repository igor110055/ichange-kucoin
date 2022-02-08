const httpErrors = require("http-errors");

class depositController {
  async fetchAllDeposit(req, res, next) {
    const depostiList = await kucoin.getDepositList();
    console.log(depostiList);
    if(depostiList.code != "200000"){
        return next(httpErrors(400 , "عملیات با موفقیت انجام نشد"))
    }
    return res.json({
      status: true,
      statusCode: 200,
      message: "دریافت کل دپوزیت ها برای ادمین",
      data: depostiList.data.items,
    });
  }
}

module.exports = new depositController();
