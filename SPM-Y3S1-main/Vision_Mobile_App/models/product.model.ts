// src/models/Product.ts
import mongoose, { Document, Schema } from "mongoose";

// Define the Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  isSale: boolean;
  salePrice: number;
  quantity: number;
  itemMinimumQTY: number;
  expiaryDate: Date;
  batchNumber: string;
  productImage: string;
  productBarcode: string;
  ProductQrCode: string;
  category: mongoose.Types.ObjectId; // Assuming you will reference ProductCategory
  supplier: mongoose.Types.ObjectId; // Assuming you will reference Supplier
  status: string;
  isOrder: boolean;
}

// Create the product schema
const productSchema: Schema<IProduct> = new Schema(
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
    salePrice: {
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

// Create the Product model
export const ProductModel = mongoose.model<IProduct>("Product", productSchema);
