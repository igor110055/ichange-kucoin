const { body } = require("express-validator");

class commissionValidator {
  update() {
    return [body("percent").notEmpty().withMessage("درصد کمیسون را وارد کنید")];
  }
}

module.exports = new commissionValidator();
