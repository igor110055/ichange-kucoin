const mongoose = require('mongoose');

const Invitation = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,ref : 'users'
    },
    referralCode : {
        type : String , required : true
    },
    userShare : {
        type : Number , default : 50
    },
    friendShare : {
        type : Number , default : 50
    },
    friendShared : [{type : mongoose.Schema.Types.ObjectId , ref : 'users'}]
})

module.exports = mongoose.model('invitation' , Invitation);