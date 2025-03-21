import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
    isPromotions: {
      type: Boolean,
      default: false,
    },
    promotions: {
      type: String,
      default: "",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ProductCategory", productCategorySchema);
