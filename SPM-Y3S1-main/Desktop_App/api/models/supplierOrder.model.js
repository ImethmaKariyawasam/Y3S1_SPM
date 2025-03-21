import mongoose from "mongoose";

const supplierOrderSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  productName:{
    type: String,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const SupplierOrder = mongoose.model("SupplierOrder", supplierOrderSchema);
export default SupplierOrder;
