import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    salePrice:{
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
    },
    itemMinimumQTY: {
        type: Number,
        required: true,
    },
    expiaryDate: {
      type: Date,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
    productBarcode: {
      type: String,
      required: true,
    },
    ProductQrCode: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    isOrder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
