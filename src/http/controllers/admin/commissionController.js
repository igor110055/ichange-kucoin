const httpErrors = require("http-errors");

// MODELS
const Commissions = require("../../../models/commission");

class commissionController {
  async index(req, res, next) {
    try {
      const commission = await Commissions.find({});
      return res.json({
        status: true,
        message: "fetch the admin commission",
        data: commission,
      });
    } catch (error) {
      return next(500, "server Error");
    }
  }

 async update(req, res, next) {
    try {
      const { percent } = req.body;
      const commissionUpdate = await Commissions.findOneAndUpdate(
        {},
        { $set: { percent } }
      );
      return res.json({
        status: true,
        message: "update the commission",
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(500, "server error");
    }
  }
}

module.exports = new commissionController();
