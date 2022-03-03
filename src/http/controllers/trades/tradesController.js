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

    async fetchSingleTrades(req,res,next){
       const {id} = req.params;
        const fetchSingleTrades = await Trade.findById(id);
        return res.json({
            status : true,
            statusCode : 200,
            message : "دریافت  ترید",
            data : fetchSingleTrades
        })
    }
}

module.exports = new tradesController();