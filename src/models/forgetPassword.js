const mongoose = require('mongoose');

const forgetPassword = mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId , ref : 'users'},
    code : {
        type : Number , required : true,
    },
    used : {type : Boolean , default : false}
})

module.exports = mongoose.model('forgetpassword' , forgetPassword);