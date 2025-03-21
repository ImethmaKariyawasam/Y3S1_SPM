const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const order = new Schema({

   CustomerID :{
    type:String,
    required:true
  }, 
  Date: {
    type: String,
    required: true
  },
  Location: {
    type: String,
    required: true
  },
  ProductArrays: {
    type: String,
    required: false
  },
  Status:{
    type: Boolean,
    required: true
  },
  Price:{
    type: String,
    required: false
  }
 
 
});

const orderitems = mongoose.model("Order",order )

module.exports =orderitems;

//module.exports = mongoose.model('Employer', EmployerSchema);