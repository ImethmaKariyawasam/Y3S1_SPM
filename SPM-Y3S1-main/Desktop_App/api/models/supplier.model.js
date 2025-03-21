import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
    },
    personIncharge: {
      type: String,
      required: true,
    },
    personInchargeIdentification:{
        type: String,
        required: true,
    },
    supplierEmail: {
      type: String,
      required: true,
      unique: true,
    },
    supplierPhone: {
      type: String,
      required: true,
    },
    supplierAddress: {
      type: String,
      required: true,
    },
    supplierCity: {
      type: String,
      required: true,
    },
    supplierQrCode: {
        type: String,
        required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
