const httpErrors = require('http-errors');
class orderListController {
   async fetchAllOrders(req,res,next){
        const fetchAllOrders = await kucoin.getOrders();
        if(fetchAllOrders.code != "200000"){
            return next(httpErrors(400 , "عملیات با موفقیت انجام نشد"))
        }
        return res.json({
            status : true,
            statusCode : 200,
            message : "دریافت تمامی سفارشات",
            data : fetchAllOrders.data
        })
    }
}

module.exports = new orderListController();