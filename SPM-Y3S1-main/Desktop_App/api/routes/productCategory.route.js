import express from "express";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
  downloadProductCategoryReport,
  downloadCategoryDetailsReport,
  downloadCategoryReportPromoStatus,
} from "../controller/productCategory.controller.js";

const router = express.Router();
router.post("/publish-category", createProductCategory);
router.get("/get-categories", getProductCategories);
router.delete("/delete-category/:id", deleteProductCategory);
router.put("/update-category/:id", updateProductCategory);
router.post("/download-category/:id", downloadProductCategoryReport);
router.post("/download-promo-status",downloadCategoryReportPromoStatus);

export default router;
