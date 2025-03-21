const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Product = new Schema({

    name:{
    type:String,
    required:true
  }, 
  price: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  productBarcode: {
    type: String,
    required: false
  },
  ProductQrCode: {
    type: String,
    required: true
  },
});

const ProductItems = mongoose.model("products",Product)

module.exports =ProductItems;

//module.exports = mongoose.model('Employer', EmployerSchema);