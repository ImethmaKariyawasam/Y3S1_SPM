import SupplierOrder from "../models/supplierOrder.model.js";
import Supplier from "../models/supplier.model.js";
import { Product } from "../models/product.model.js";
import ProductCategory from "../models/productCategory.model.js";
import BwipJs from "bwip-js";
import QRCode from "qrcode"; // For QR code generation
import generatePdfFromHtml from "../utils/pdfGenerator.js";
// Get All Supplier Orders
export const getSupplierOrders = async (req, res) => {
  try {
    const supplierOrders = await SupplierOrder.find()
      .populate("supplier")
      .populate("product");
    const totalSupplierOrders = supplierOrders.length;
    const pendingSupplierOrders = supplierOrders.filter(
      (order) => order.status === "Pending"
    ).length;
    const completedSupplierOrders = supplierOrders.filter(
      (order) => order.status === "Completed"
    ).length;
    const cancelledSupplierOrders = supplierOrders.filter(
      (order) => order.status === "Cancelled"
    ).length;
    res.status(200).json({
      totalSupplierOrders,
      pendingSupplierOrders,
      completedSupplierOrders,
      cancelledSupplierOrders,
      supplierOrders,
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Full Fill Supplier Order
export const fullSupplierOrder = async (req, res) => {
  const supplierOrderID = req.params.id;
  const { formData, supplierOrder } = req.body;
  const oldProductID = supplierOrder.product._id;
  const supplierID = supplierOrder.supplier._id;
  const categoryID = supplierOrder.product.category;
  const productName = supplierOrder.product.name;
  try {
    // Get the product details from the form data
    const {
      description,
      price,
      quantity,
      itemMinimumQTY,
      expiaryDate,
      batchNumber,
      productImage,
    } = req.body.formData;
    // Validations
    if (
      !description ||
      !price ||
      !quantity ||
      !itemMinimumQTY ||
      !expiaryDate ||
      !productImage ||
      !batchNumber
    ) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (quantity < 0 || itemMinimumQTY < 0) {
      return res.status(400).json({
        message: "Quantity and Item Minimum Quantity must be greater than 0",
      });
    }
    if (new Date(expiaryDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Expiary date must be greater than today" });
    }
    if (price < 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }
    if (batchNumber.length < 3) {
      return res
        .status(400)
        .json({ message: "Batch Number must be at least 3 characters" });
    }

    // Generate Barcode
    const barcodeBuffer = await BwipJs.toBuffer({
      bcid: "code128",
      text: productName, // You can use a unique identifier or product ID instead
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const productBarcode = `data:image/png;base64,${barcodeBuffer.toString(
      "base64"
    )}`;

    // Data to be encoded in the QR code
    let name = productName;
    let supplierName = Supplier.findOne({ _id: supplierID }).supplierName;
    let categoryName = ProductCategory.findOne({ _id: categoryID }).name;
    let isSale = false;
    let salePrice = 0;
    let status = "Active";

    const qrData = `
  Product Name: ${name || "N/A"}, 
  Description: ${description || "N/A"}, 
  Price: LKR ${price}, 
  Quantity: ${quantity || 0}, 
  Sale: ${isSale ? "Yes" : "No"}, 
  Sale Price: LKR ${isSale ? salePrice?.toFixed(2) : "N/A"}, 
  Minimum Quantity: ${itemMinimumQTY || 0}, 
  Expiry Date: ${new Date(expiaryDate).toLocaleDateString() || "N/A"}, 
  Batch Number: ${batchNumber || "N/A"}, 
  Status: ${status || "N/A"}, 
  Category: ${categoryName || "N/A"}, 
  Supplier: ${supplierName || "N/A"}
`
      .replace(/\s+/g, " ")
      .trim();

    // Generate the QR Code
    const ProductQrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H", // High error correction
      type: "image/png", // PNG format
      quality: 0.92, // Image quality
    });

    // Create the product
    const newProduct = new Product({
      name: productName,
      description,
      price,
      quantity,
      itemMinimumQTY,
      expiaryDate,
      batchNumber,
      productImage,
      productBarcode,
      ProductQrCode,
      category: categoryID,
      supplier: supplierID,
      status: "Active",
    });

    // Save the product
    const savedProduct = await newProduct.save();
    if (savedProduct) {
      // Remove the old product from the Supplier and Category products array
      await Supplier.findByIdAndUpdate(supplierID, {
        $pull: { products: oldProductID },
      });
      await ProductCategory.findByIdAndUpdate(categoryID, {
        $pull: { products: oldProductID },
      });

      await Product.findByIdAndDelete(oldProductID);

      // Update the Supplier's products array (Assuming you have a 'products' array in your Supplier model)
      await Supplier.findByIdAndUpdate(supplierID, {
        $push: { products: savedProduct._id },
      });

      // Update the Category's products array (Assuming you have a 'products' array in your Category model)
      await ProductCategory.findByIdAndUpdate(categoryID, {
        $push: { products: savedProduct._id },
      });

      // Update the Supplier Order status to 'Completed'
      await SupplierOrder.findByIdAndUpdate(supplierOrderID, {
        $set: {
          status: "Completed",
          product: savedProduct._id,
          productName: savedProduct.name,
        },
      });
      return res.status(200).json({ message: "Successfull" });
    } else {
      console.log("Not Successfull");
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Generate Supplier Order Report
export const generateSupplierOrderReport = async (req, res) => {
  const { selectedSupplierID } = req.body;

  try {
    // Fetch the supplier details
    const supplier = await Supplier.findById(selectedSupplierID);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Fetch orders for the supplier
    const orders = await SupplierOrder.find({
      supplier: selectedSupplierID,
    }).populate("product");

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Supplier Order Report</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  color: #333;
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #444;
              }
              .header p {
                  margin: 5px 0 0;
                  font-size: 14px;
                  color: #666;
              }
              .section {
                  margin-bottom: 30px;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .section h2 {
                  color: #555;
                  font-size: 20px;
                  border-bottom: 2px solid #eee;
                  padding-bottom: 10px;
                  margin-bottom: 20px;
              }
              .section p {
                  color: #666;
                  margin-bottom: 10px;
              }
              .status-pending {
                  color: orange;
                  font-weight: bold;
              }
              .status-completed {
                  color: green;
                  font-weight: bold;
              }
              .status-cancelled {
                  color: red;
                  font-weight: bold;
              }
              .order-list ul {
                  list-style: none;
                  padding: 0;
              }
              .order-list li {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 1px solid #eee;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Supplier Order Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
              <h2>Supplier Details</h2>
              <p><strong>Name:</strong> ${supplier.supplierName}</p>
              <p><strong>Email:</strong> ${supplier.supplierEmail || "N/A"}</p>
              <p><strong>Phone:</strong> ${supplier.supplierPhone || "N/A"}</p>
              <p><strong>City:</strong> ${supplier.supplierCity || "N/A"}</p>
              <p><strong>Address:</strong> ${
                supplier.supplierAddress || "N/A"
              }</p>
          </div>
    `;

    if (orders.length > 0) {
      htmlContent += `
        <div class="section order-list">
            <h2>Orders</h2>
            <ul>
      `;

      // Iterate through each order
      orders.forEach((order) => {
        let statusClass = "";
        switch (order.status.toLowerCase()) {
          case "completed":
            statusClass = "status-completed";
            break;
          case "pending":
            statusClass = "status-pending";
            break;
          case "cancelled":
            statusClass = "status-cancelled";
            break;
          default:
            statusClass = "";
        }

        htmlContent += `
          <li>
              <p><strong>Order Date:</strong> ${new Date(
                order.orderDate
              ).toLocaleDateString()}</p>
              <p><strong>Product Name:</strong> ${
                order.productName || order.product?.name
              }</p>
              <p><strong>Quantity:</strong> ${order.quantity} units</p>
              <p><strong>Status:</strong> <span class="${statusClass}">${
          order.status
        }</span></p>
          </li>
        `;
      });

      htmlContent += `
            </ul>
        </div>
      `;
    } else {
      htmlContent += `
        <div class="section">
            <h2>Orders</h2>
            <p>No orders available for this supplier.</p>
        </div>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    // Generate PDF from the HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Generate Supplier Order Status Report
export const generateSupplierOrderStatusReport = async (req, res) => {
  const { selectedStatus } = req.body;

  try {
    // Fetch orders based on the selected status (no supplier filter)
    const orders = await SupplierOrder.find({
      status: selectedStatus,
    })
      .populate("supplier")
      .populate("product");

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Supplier Order Status Report - ${selectedStatus}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  color: #333;
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #444;
              }
              .header p {
                  margin: 5px 0 0;
                  font-size: 14px;
                  color: #666;
              }
              .section {
                  margin-bottom: 30px;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .section h2 {
                  color: #555;
                  font-size: 20px;
                  border-bottom: 2px solid #eee;
                  padding-bottom: 10px;
                  margin-bottom: 20px;
              }
              .section p {
                  color: #666;
                  margin-bottom: 10px;
              }
              .status-pending {
                  color: orange;
                  font-weight: bold;
              }
              .status-completed {
                  color: green;
                  font-weight: bold;
              }
              .status-cancelled {
                  color: red;
                  font-weight: bold;
              }
              .order-list ul {
                  list-style: none;
                  padding: 0;
              }
              .order-list li {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 1px solid #eee;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Supplier Order Status Report - ${selectedStatus}</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
    `;

    if (orders.length > 0) {
      htmlContent += `
        <div class="section order-list">
            <h2>Orders (${selectedStatus})</h2>
            <ul>
      `;

      // Iterate through each order
      orders.forEach((order) => {
        htmlContent += `
          <li>
              <p><strong>Order Date:</strong> ${new Date(
                order.orderDate
              ).toLocaleDateString()}</p>
              <p><strong>Supplier Name:</strong> ${
                order.supplier?.supplierName || "N/A"
              }</p>
              <p><strong>Product Name:</strong> ${
                order.productName || order.product?.name
              }</p>
              <p><strong>Quantity:</strong> ${order.quantity} units</p>
              <p><strong>Status:</strong> <span class="status-${selectedStatus.toLowerCase()}">${
          order.status
        }</span></p>
          </li>
        `;
      });

      htmlContent += `
            </ul>
        </div>
      `;
    } else {
      htmlContent += `
        <div class="section">
            <h2>Orders</h2>
            <p>No ${selectedStatus.toLowerCase()} orders available.</p>
        </div>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    // Generate PDF from the HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Supplier Order
export const cancelSupplierOrder = async (req, res) => {
  const supplierOrderID = req.params.id;
  console.log(supplierOrderID);
  try {
    const order = await SupplierOrder.findById(supplierOrderID).populate(
      "product"
    );
    const productID = order.product._id;
    await Product.findByIdAndUpdate(productID, {
      $set: { isOrder: false },
    });
    await SupplierOrder.findByIdAndUpdate(supplierOrderID, {
      $set: { status: "Cancelled" },
    });
    return res.status(200).json({ message: "Successfull" });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const filterSupplierOrders = async (req, res) => {
  const { selectedCriteria } = req.body;
  try {
    const supplierOrders = await SupplierOrder.find({
      status: selectedCriteria,
    })
      .populate("supplier")
      .populate("product");
    res.status(200).json({
      supplierOrders,
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
