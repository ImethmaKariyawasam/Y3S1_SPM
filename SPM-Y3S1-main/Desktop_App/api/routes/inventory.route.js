import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  downloadProductReport,
  sendOrder,
} from "../controller/inventory.controller.js";
const router = express.Router();

router.post("/create-inventory-item", createProduct);
router.get("/get-inventory-items", getProducts);
router.put("/update-inventory-item/:id", updateProduct);
router.delete("/delete-inventory-item/:id", deleteProduct);
router.post("/download-inventory-items", downloadProductReport);
router.post("/send-order-email", sendOrder);

export default router;
