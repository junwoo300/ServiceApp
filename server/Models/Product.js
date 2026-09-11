const mongoose = require('mongoose')

const productSchema = mongoose.Schema({

    name:String,
    detail:{
        type:String
    },
    price: {
        type: Number
    },
    income: {
        type: Number
    },
    balance: {
        type: Number
    },
    outcome: {
        type: Number
    },
    borrowed: {
        type: Number
    },
    unit:String,

},{ timestamps: true } )

module.exports = mongoose.model('products', productSchema)


//table ใคร table มัน
