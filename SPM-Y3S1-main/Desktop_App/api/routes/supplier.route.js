import express from "express";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
  generatesSupplierReport,
  generateSupplierStatusReport
} from "../controller/supplier.controller.js";


const router = express.Router();

router.post("/create-supplier", createSupplier);
router.put("/update-supplier/:id", updateSupplier);
router.delete("/delete-supplier/:id", deleteSupplier);
router.post("/generate-supplier-report", generatesSupplierReport);
router.post("/generate-supplier-status-report", generateSupplierStatusReport);
router.get("/get-suppliers", getSuppliers);

export default router;
