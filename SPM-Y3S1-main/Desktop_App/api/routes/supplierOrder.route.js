import express from "express";
import { fullSupplierOrder, getSupplierOrders,generateSupplierOrderReport ,cancelSupplierOrder,generateSupplierOrderStatusReport} from "../controller/supplierOrder.controller.js";

const router = express.Router();

router.get("/get-supplier-orders", getSupplierOrders);
router.post("/full-fill-supplier-order/:id", fullSupplierOrder);
router.post("/generate-supplier-order-report",generateSupplierOrderReport);
router.post("/generate-supplier-order-status-report",generateSupplierOrderStatusReport)
router.post("/cancel-supplier-order/:id", cancelSupplierOrder); 
export default router;
