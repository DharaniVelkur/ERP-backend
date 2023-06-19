const mongoose = require('mongoose');
const Product = require('./productSchema');
const rentedproductSchema=mongoose.Schema({
    product:{
        type:Product,
        required: true
    },
    user:{
        type:String,
        required:true
    },
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        required:true
    }
});
const rentedProduct=mongoose.model('RentedProducts', rentedproductSchema);
module.exports = rentedProduct;