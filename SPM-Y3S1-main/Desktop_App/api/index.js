import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import inquiryRoutes from "./routes/inquiry.route.js";
import productCategory from "./routes/productCategory.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import supplierOrderRoutes from "./routes/supplierOrder.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to VisionSpot database 🚀");
  })
  .catch(() => {
    console.log("Connection failed");
  });

const app = express();

app.use(express.json());
app.use(cookieParser());
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/productCategory", productCategory);
app.use("/api/supplier", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplierOrder", supplierOrderRoutes);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
