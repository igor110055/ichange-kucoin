const Trade = require('../../../models/trade');


class tradesController {
   async fetchAllTrades(req,res,next){
        const fetchAllTrades = await Trade.find({});
        return res.json({
            status : true,
            statusCode : 200,
            message : "دریافت تمامی ترید ها",
            data : fetchAllTrades
        })
    }
}

module.exports = new tradesController();