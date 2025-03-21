import Supplier from "../models/supplier.model.js";
import { errorHandler } from "../utils/error.js";
import QRCode from "qrcode";
import generatePdfFromHtml from "../utils/pdfGenerator.js";

//Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const name = req.body.supplierName;
    const email = req.body.supplierEmail;
    const personIncharge = req.body.personIncharge;
    const personInchargeIdentification = req.body.personInchargeIdentification;
    const phone = req.body.supplierPhone;
    const address = req.body.supplierAddress;
    const city = req.body.supplierCity;
    if (
      name == null ||
      email == null ||
      phone == null ||
      address == null ||
      city == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (phone.length < 10) {
      return res.status(400).json({ message: "Phone number is too short" });
    }
    if (email.match(/\S+@\S+\.\S+/) == null) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (personInchargeIdentification.length < 10) {
      return res
        .status(400)
        .json({ message: "Identification number is too short" });
    }
    if (address.length < 10) {
      return res.status(400).json({ message: "Address is too short" });
    }
    //Check if supplier already exists
    const supplierExist = await Supplier.findOne({
      supplierEmail: email,
      supplierName: name,
    });

    if (supplierExist) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    //Generate QR code
    const qrData = {
      supplierName: name,
      personIncharge: personIncharge,
      personInchargeIdentification: personInchargeIdentification,
      supplierEmail: email,
      supplierPhone: phone,
      supplierAddress: address,
      supplierCity: city,
    };

    // Create the QR code in a proper format (URL format)
    const supplierQrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "H", // High error correction
      type: "image/png", // PNG format
      quality: 0.92, // Image quality
    });

    const supplier = new Supplier({
      supplierName: req.body.supplierName,
      personIncharge: req.body.personIncharge,
      personInchargeIdentification: req.body.personInchargeIdentification,
      supplierEmail: req.body.supplierEmail,
      supplierPhone: req.body.supplierPhone,
      supplierAddress: req.body.supplierAddress,
      supplierCity: req.body.supplierCity,
      supplierQrCode: supplierQrCode,
    });
    const newSupplier = await supplier.save();
    return res.status(201).json(newSupplier);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Delete a supplier
export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (supplier.products.length > 0) {
      return res
        .status(400)
        .json({ message: "Supplier has products, cannot delete" });
    }
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await Supplier.findByIdAndDelete(id);
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

//Get all suppliers
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().populate("products");
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(
      (supplier) => supplier.status === "Active"
    ).length;
    const inactiveSuppliers = suppliers.filter(
      (supplier) => supplier.status === "Deactive"
    ).length;
    res
      .status(200)
      .json({ totalSuppliers, activeSuppliers, inactiveSuppliers, suppliers });
  } catch (error) {
    return next(error);
  }
};

//Update a supplier
export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    let status = supplier.status;
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    if (req.body.supplierPhone) {
      if (req.body.supplierPhone.length < 10) {
        return res.status(400).json({ message: "Phone number is too short" });
      }
    }
    if (req.body.personInchargeIdentification) {
      if (req.body.personInchargeIdentification.length < 10) {
        return res
          .status(400)
          .json({ message: "Identification number is too short" });
      }
    }
    if (req.body.supplierAddress) {
      if (req.body.supplierAddress.length < 10) {
        return res.status(400).json({ message: "Address is too short" });
      }
    }
    if (req.body.supplierEmail) {
      if (req.body.supplierEmail.match(/\S+@\S+\.\S+/) == null) {
        return res.status(400).json({ message: "Invalid email" });
      }
      const supplierExist = await Supplier.findOne({
        suppplierEmail: req.body.supplierEmail,
      });
      if (supplierExist) {
        return res
          .status(400)
          .json({ message: "Supplier already exists. Use alternate email" });
      }
    }
    if (req.body.supplierName) {
      const supplierExist = await Supplier.findOne({
        supplierName: req.body.supplierName,
      });
      if (supplierExist) {
        return res
          .status(400)
          .json({ message: "Supplier already exists. Use alternate name" });
      }
    }
    if (req.body.status) {
      if (supplier.products.length > 0) {
        return res
          .status(400)
          .json({ message: "Supplier has products, cannot change status" });
      }
      if (req.body.status !== "Active" && req.body.status !== "Deactive") {
        return res.status(400).json({ message: "Invalid status" });
      }
    }
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          supplierName: req.body.supplierName,
          personIncharge: req.body.personIncharge,
          personInchargeIdentification: req.body.personInchargeIdentification,
          supplierEmail: req.body.supplierEmail,
          supplierPhone: req.body.supplierPhone,
          supplierAddress: req.body.supplierAddress,
          supplierCity: req.body.supplierCity,
          status: req.body.status,
        },
      }
    );
    const QRData = {
      supplierName: updatedSupplier.supplierName,
      personIncharge: updatedSupplier.personIncharge,
      personInchargeIdentification:
        updatedSupplier.personInchargeIdentification,
      supplierEmail: updatedSupplier.supplierEmail,
      supplierPhone: updatedSupplier.supplierPhone,
      supplierAddress: updatedSupplier.supplierAddress,
      supplierCity: updatedSupplier.supplierCity,
    };
    const supplierQrCode = await QRCode.toDataURL(JSON.stringify(QRData), {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
    });
    await Supplier.findByIdAndUpdate({ _id: id }, { $set: { supplierQrCode } });
    res.status(200).json({ message: "Supplier updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Generate a report for a specific supplier
export const generatesSupplierReport = async (req, res, next) => {
  const { supplierID } = req.body;

  try {
    const supplier = await Supplier.findById(supplierID).populate("products");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Supplier Report</title>
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
              .section p strong {
                  color: #333;
              }
              .status-active {
                  color: green;
                  font-weight: bold;
              }
              .status-deactive {
                  color: red;
                  font-weight: bold;
              }
              .status-pending {
                  color: orange;
                  font-weight: bold;
              }
              .promotion-true {
                  color: blue;
                  font-weight: bold;
              }
              .promotion-false {
                  color: gray;
                  font-weight: bold;
              }
              .product-list {
                  margin-top: 20px;
              }
              .product-list ul {
                  list-style: none;
                  padding: 0;
              }
              .product-list li {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 1px solid #eee;
              }
              .barcode-qr {
                  text-align: center;
                  margin-top: 20px;
              }
              .barcode-qr img {
                  width: 200px;
                  height: auto;
                  margin-top: 10px;
                  margin-bottom: 20px;
                  border: 1px solid #ddd;
                  padding: 5px;
                  background: #f9f9f9;
              }
              .product-image img {
                  width: 300px;
                  height: auto;
                  margin-top: 10px;
                  margin-bottom: 20px;
                  border: 1px solid #ddd;
                  padding: 5px;
                  background: #f9f9f9;
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Supplier Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
              <h2>Supplier Details</h2>
              <p><strong>Name:</strong> ${supplier.supplierName}</p>
              <p><strong>Status:</strong> <span class="categoryStatusClass">${
                supplier.status
              }</span></p>
              <p><strong>Email:</strong> ${supplier.supplierEmail || "N/A"}</p>
              <p><strong>Phone No:</strong> ${
                supplier.supplierPhone || "N/A"
              }</p>
              <p><strong>Person In-Charge:</strong> ${
                supplier.personIncharge || "N/A"
              }</p>
              <p><strong>Identification:</strong> ${
                supplier.personInchargeIdentification || "N/A"
              }</p>
              <p><strong>City:</strong> ${supplier.supplierCity || "N/A"}</p>
              <p><strong>Address:</strong> ${
                supplier.supplierAddress || "N/A"
              }</p>
          </div>
    `;

    // Check if there are any products
    if (supplier.products.length > 0) {
      htmlContent += `
          <div class="section product-list">
              <h2>Products</h2>
              <ul>
      `;

      // Iterate through each product within the supplier
      supplier.products.forEach((product) => {
        const productStatusClass =
          product.status.toLowerCase() === "active"
            ? "status-active"
            : "status-deactive";
        const productPromotionClass = product.isSale
          ? "promotion-true"
          : "promotion-false";

        htmlContent += `
              <li>
                  <p><strong>Name:</strong> ${product.name}</p>
                  <p><strong>Description:</strong> ${product.description}</p>
                  <p><strong>Price:</strong> LKR ${product.price}</p>
                  <p><strong>Status:</strong> <span class="${productStatusClass}">${
          product.status
        }</span></p>
                  <p><strong>Sale:</strong> <span class="${productPromotionClass}">${
          product.isSale ? "On Sale" : "Regular"
        }</span></p>
                  <p><strong>Quantity:</strong> ${product.quantity}</p>
                  <p><strong>Expiry Date:</strong> ${new Date(
                    product.expiaryDate
                  ).toLocaleDateString()}</p>
                  <div class="barcode-qr">
                      <p><strong>Product Image:</strong></p>
                      <img src="${
                        product.productImage
                      }" alt="Product Image" class="product-image">
                      <p><strong>Barcode:</strong></p>
                      <img src="${product.productBarcode}" alt="Barcode">
                      <p><strong>QR Code:</strong></p>
                      <img src="${product.ProductQrCode}" alt="QR Code">
                  </div>
              </li>
        `;
      });

      htmlContent += `
              </ul>
          </div>
      `;
    } else {
      // No products available
      htmlContent += `
          <div class="section">
              <h2>Products</h2>
              <p>No products available for this supplier.</p>
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

//Generate a report based on the supplier's status
export const generateSupplierStatusReport = async (req, res, next) => {
  const { status } = req.body;
  try {
    // Validate status input
    if (!status || (status !== "Active" && status !== "Deactive")) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Fetch suppliers based on status
    const suppliers = await Supplier.find({ status }).populate("products");
    console.log(suppliers);

    // Check if suppliers are found
    if (suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Supplier Report</title>
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
              .section p strong {
                  color: #333;
              }
              .status-active {
                  color: green;
                  font-weight: bold;
              }
              .status-deactive {
                  color: red;
                  font-weight: bold;
              }
              .total-suppliers {
                  font-size: 1.2rem;
                  font-weight: bold;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Supplier Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
              <h2>Total Suppliers</h2>
              <p class="total-suppliers">${
                suppliers.length
              } suppliers found with status: <span class="${
      status === "Active" ? "status-active" : "status-deactive"
    }">${status}</span></p>
          </div>
    `;

    // Iterate through each supplier
    suppliers.forEach((supplier) => {
      htmlContent += `
        <div class="section">
            <h2>Supplier Details</h2>
            <p><strong>Name:</strong> ${supplier.supplierName}</p>
            <p><strong>Status:</strong> <span class="${
              supplier.status === "Active" ? "status-active" : "status-deactive"
            }">${supplier.status}</span></p>
            <p><strong>Email:</strong> ${supplier.supplierEmail || "N/A"}</p>
            <p><strong>Phone No:</strong> ${supplier.supplierPhone || "N/A"}</p>
            <p><strong>Person In-Charge:</strong> ${
              supplier.personIncharge || "N/A"
            }</p>
            <p><strong>Identification:</strong> ${
              supplier.personInchargeIdentification || "N/A"
            }</p>
            <p><strong>City:</strong> ${supplier.supplierCity || "N/A"}</p>
            <p><strong>Address:</strong> ${
              supplier.supplierAddress || "N/A"
            }</p>
        </div>
      `;
    });

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
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
