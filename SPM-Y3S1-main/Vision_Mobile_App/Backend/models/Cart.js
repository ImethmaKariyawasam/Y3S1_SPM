const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cart = new Schema({

   CustomerID :{
    type:String,
    required:true
  }, 
  Pname: {
    type: String,
    required: true
  },
  Price: {
    type: String,
    required: true
  },
  Date: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: false
  },
  Count:{
    type: String,
    required: false
  }
 
});

const ProductItems = mongoose.model("Cart",cart)

module.exports =ProductItems;

//module.exports = mongoose.model('Employer', EmployerSchema);