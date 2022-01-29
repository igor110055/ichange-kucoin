const { body, query , param } = require("express-validator");

class ordersValidatior {
  estimate() {
    return [
      param("from").notEmpty().withMessage("ارز مبدا را وارد کنید"),
      //   query("from_net").notEmpty().withMessage("شبکه ی ارز مبدا را وارد کنید"),
      param("to").notEmpty().withMessage("ارز مقصد را وارد کنید"),
      //   query("to_net").notEmpty().withMessage("شبکه ی ارز مقصد را وارد کنید"),
      param("amount").notEmpty().withMessage("تعداد مورد نیاز را وارد کنید"),
    ];
  }
}

module.exports = new ordersValidatior();
