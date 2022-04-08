const monngoose =require('mongoose');
const phoneNumberCode = monngoose.Schema({
    code : {
        type : Number ,
        required : true
    },
    used : {
        type : Boolean,
        default : false
    },
    userId : {
        type : monngoose.Schema.Types.ObjectId , 
        ref : 'users'
    }
})
module.exports = monngoose.model('phoneNumberCodes' , phoneNumberCode)