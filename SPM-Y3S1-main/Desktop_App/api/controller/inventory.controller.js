import { Product } from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import SupplierOrder from "../models/supplierOrder.model.js";
import ProductCategory from "../models/productCategory.model.js";
import bwipjs from "bwip-js"; // For barcode generation
import QRCode from "qrcode"; // For QR code generation
import productCategoryModel from "../models/productCategory.model.js";
import generatePDFFromHtml from "../utils/pdfGenerator.js";
import { sendEmail } from "../utils/email.js";
import GoogleSendMail from "../utils/GoogleEmail.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      itemMinimumQTY,
      expiaryDate,
      batchNumber,
      productImage,
      category,
      supplier,
      status,
    } = req.body;

    const productExists = await Product.findOne({ name, supplier });
    if (productExists) {
      return res.status(400).json({ message: "Product already exists" });
    }
    if (
      !name ||
      !description ||
      !price ||
      !quantity ||
      !itemMinimumQTY ||
      !expiaryDate ||
      !productImage ||
      !category ||
      !supplier ||
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
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: name, // You can use a unique identifier or product ID instead
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });
    const productBarcode = `data:image/png;base64,${barcodeBuffer.toString(
      "base64"
    )}`;

    // Data to be encoded in the QR code

    let supplierName = Supplier.findOne({ _id: supplier }).supplierName;
    let categoryName = ProductCategory.findOne({ _id: category }).name;
    let isSale = false;
    let salePrice = 0;

    const qrData = `
  Product Name: ${name || "N/A"}, 
  Description: ${description || "N/A"}, 
  Price: LKR ${price}, 
  Quantity: ${quantity || 0}, 
  Sale: ${isSale ? "Yes" : "No"}, 
  Sale Price:   LKR ${isSale ? salePrice?.toFixed(2) : "N/A"}, 
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
      name,
      description,
      price,
      quantity,
      itemMinimumQTY,
      expiaryDate,
      batchNumber,
      productImage,
      productBarcode,
      ProductQrCode,
      category,
      supplier,
      status,
    });

    // Save the product
    const savedProduct = await newProduct.save();

    // Update the Supplier's products array (Assuming you have a 'products' array in your Supplier model)
    await Supplier.findByIdAndUpdate(supplier, {
      $push: { products: savedProduct._id },
    });

    // Update the Category's products array (Assuming you have a 'products' array in your Category model)
    await ProductCategory.findByIdAndUpdate(category, {
      $push: { products: savedProduct._id },
    });

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(409).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("supplier");
    const totalProducts = products.length;
    const expireProducts = products.filter(
      (product) => product.expiaryDate < new Date()
    );
    const totalProductsInStock = products.filter(
      (product) => product.quantity > 0
    ).length;
    const totalExpireProducts = expireProducts.length;
    const outOfStockProducts = products.filter(
      (product) => product.quantity === 0
    );
    const totalOutOfStockProducts = outOfStockProducts.length;
    res.status(200).json({
      products,
      totalProducts,
      totalProductsInStock,
      totalOutOfStockProducts,
      totalExpireProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      isSale,
      salePrice,
      quantity,
      itemMinimumQTY,
      expiaryDate,
      batchNumber,
      productImage,
      category,
      supplier,
      status,
    } = req.body;
    const product = await Product.findById(id);
    let previousSupplierID = product.supplier;
    let previousCategoryID = product.category;
    const isSaleBoolean = isSale ? isSale === "true" : false;
    if (name) {
      if (name.length < 3) {
        return res
          .status(400)
          .json({ message: "Name must be at least 3 characters" });
      }
      if (name.length > 50) {
        return res
          .status(400)
          .json({ message: "Name must be at most 50 characters" });
      }
      if (supplier) {
        const productExists = await Product.findOne({ name, supplier });
        if (productExists) {
          return res.status(400).json({ message: "Product already exists" });
        }
      }
    }
    if (description) {
      if (description.length < 10) {
        return res
          .status(400)
          .json({ message: "Description must be at least 10 characters" });
      }
      if (description.length > 200) {
        return res
          .status(400)
          .json({ message: "Description must be at most 200 characters" });
      }
    }
    if (price) {
      if (price < 0) {
        return res
          .status(400)
          .json({ message: "Price must be greater than 0" });
      }
    }
    if (quantity) {
      if (quantity < 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be greater than 0" });
      }
    }
    if (itemMinimumQTY) {
      if (itemMinimumQTY < 0) {
        return res
          .status(400)
          .json({ message: "Item Minimum Quantity must be greater than 0" });
      }
    }
    if (expiaryDate) {
      if (new Date(expiaryDate) < new Date()) {
        return res
          .status(400)
          .json({ message: "Expiary date must be greater than today" });
      }
    }
    if (batchNumber) {
      if (batchNumber.length < 3) {
        return res
          .status(400)
          .json({ message: "Batch Number must be at least 3 characters" });
      }
    }
    if (isSale) {
      if (salePrice < 0) {
        return res
          .status(400)
          .json({ message: "Sale Price must be greater than 0" });
      }
      if (salePrice > price) {
        return res
          .status(400)
          .json({ message: "Sale Price must be less than the original price" });
      }
      if (salePrice === price) {
        return res.status(400).json({
          message: "Sale Price must be different from the original price",
        });
      }
      if (salePrice === 0) {
        return res
          .status(400)
          .json({ message: "Sale Price must be greater than 0" });
      }
    }

    if (supplier) {
      // Remove the item from the previous supplier
      await Supplier.findByIdAndUpdate(previousSupplierID, {
        $pull: { products: id },
      });

      // Add the item to the new supplier
      await Supplier.findByIdAndUpdate(supplier, {
        $push: { products: id },
      });
    }

    if (category) {
      // Remove the item from the previous category
      await ProductCategory.findByIdAndUpdate(previousCategoryID, {
        $pull: { products: id },
      });

      // Add the item to the new category
      await ProductCategory.findByIdAndUpdate(category, {
        $push: { products: id },
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          description,
          price,
          isSale: isSaleBoolean,
          salePrice,
          quantity,
          itemMinimumQTY,
          expiaryDate,
          batchNumber,
          productImage,
          category,
          supplier,
          status,
        },
      },
      { new: true }
    );

    //Generate Barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: updatedProduct.name, // You can use a unique identifier or product ID instead
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });
    const productBarcode = `data:image/png;base64,${barcodeBuffer.toString(
      "base64"
    )}`;

    let categoryName = await ProductCategory.findById({
      _id: updateProduct?.category,
    }).name;
    let supplierName = await Supplier.findById({ _id: updateProduct?.supplier })
      .supplierName;
    //Generate QR Code
    const qrData = `
    Product Name: ${updatedProduct.name}, 
    Description: ${updatedProduct.description}, 
    Price: LKR ${updatedProduct.price.toFixed(2)}, 
    Quantity: ${updatedProduct.quantity}, 
    Sale: ${updatedProduct.isSale ? "Yes" : "No"}, 
    Sale Price: LKR ${
      updatedProduct.isSale ? updatedProduct.salePrice.toFixed(2) : "N/A"
    }, 
    Minimum Quantity: ${updatedProduct.itemMinimumQTY}, 
    Expiry Date: ${new Date(updatedProduct.expiaryDate).toLocaleDateString()}, 
    Batch Number: ${updatedProduct.batchNumber}, 
    Status: ${updatedProduct.status}, 
    Category: ${categoryName || "N/A"}, 
    Supplier: ${supplierName || "N/A"}
    `
      .replace(/\s+/g, " ")
      .trim();

    // Generate the QR code
    const ProductQrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
    });

    // Update the product with the new barcode and QR code
    updatedProduct.productBarcode = productBarcode;
    updatedProduct.ProductQrCode = ProductQrCode;
    await updatedProduct.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("category")
      .populate("supplier");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const { supplier, category } = product;
    await Product.findByIdAndDelete(id);
    await Supplier.findByIdAndUpdate(supplier, {
      $pull: { products: id },
    });
    await ProductCategory.findByIdAndUpdate(category, {
      $pull: { products: id },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const downloadProductReport = async (req, res) => {
  const { selectedCriteria } = req.body;

  let products = [];
  let criteriaDescription = "";

  try {
    // Fetch products based on selected criteria
    if (selectedCriteria.value === "outOfStock") {
      products = await Product.find({ quantity: 0 })
        .populate("category", "name")
        .populate("supplier", "supplierName");
      criteriaDescription = "Out of Stock Products";
    } else if (selectedCriteria.value === "expireProducts") {
      products = await Product.find({ expiaryDate: { $lt: new Date() } })
        .populate("category", "name")
        .populate("supplier", "supplierName");
      criteriaDescription = "Expired Products";
    } else if (selectedCriteria.value === "inStock") {
      products = await Product.find({
        $expr: { $gt: ["$quantity", "$itemMinimumQTY"] },
      })
        .populate("category", "name")
        .populate("supplier", "supplierName");
      criteriaDescription = "In Stock Products";
    } else if (selectedCriteria.value === "lowStock") {
      products = await Product.find({
        $expr: { $lt: ["$quantity", "$itemMinimumQTY"] },
      })
        .populate("category", "name")
        .populate("supplier", "supplierName");
      criteriaDescription = "Low Stock Products";
    }

    // Generate the HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Report</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 30px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 2.5em;
            }
            .header p {
                color: #666;
                margin-top: 10px;
            }
            .section {
                margin-bottom: 30px;
            }
            .section h2 {
                color: #007bff;
                border-bottom: 2px solid #eee;
                padding-bottom: 10px;
            }
            .product-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            .product-card {
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .product-info p {
                margin: 10px 0;
            }
            .product-status {
                font-weight: bold;
                padding: 5px 10px;
                border-radius: 20px;
                display: inline-block;
            }
            .status-active { background-color: #d4edda; color: #155724; }
            .status-deactive { background-color: #f8d7da; color: #721c24; }
            .promotion-true { background-color: #cce5ff; color: #004085; }
            .promotion-false { background-color: #e2e3e5; color: #383d41; }
            .stock-out { background-color: #f8d7da; color: #721c24; }
            .stock-low { background-color: #fff3cd; color: #856404; }
            .stock-in { background-color: #d4edda; color: #155724; }
            .product-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            .barcode-qr img {
                max-width: 100%;
                height: auto;
                margin-top: 10px;
            }
            .no-products {
                text-align: center;
                padding: 20px;
                background-color: #f8d7da;
                color: #721c24;
                border-radius: 8px;
                margin-top: 20px;
            }
            @media (max-width: 768px) {
                .product-list {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Product Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p><strong>Criteria:</strong> ${criteriaDescription}</p>
            </div>
            <div class="section">
                <h2>Products</h2>
                ${
                  products.length > 0
                    ? `
                    <div class="product-list">
                        ${products
                          .map(
                            (product) => `
                            <div class="product-card">
                                <img src="${product.productImage}" alt="${
                              product.name
                            }" class="product-image">
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p><strong>Description:</strong> ${
                                      product.description
                                    }</p>
                                    <p><strong>Price:</strong> LKR ${product.price.toFixed(
                                      2
                                    )}</p>
                                    <p><strong>Status:</strong> <span class="product-status ${
                                      product.status.toLowerCase() === "active"
                                        ? "status-active"
                                        : "status-deactive"
                                    }">${product.status}</span></p>
                                    <p><strong>Sale:</strong> <span class="product-status ${
                                      product.isSale
                                        ? "promotion-true"
                                        : "promotion-false"
                                    }">${
                              product.isSale ? "On Sale" : "Regular"
                            }</span></p>
                                    ${
                                      product.isSale
                                        ? `<p><strong>Sale Price:</strong> LKR ${product.salePrice.toFixed(
                                            2
                                          )}</p>`
                                        : ""
                                    }
                                    <p><strong>Quantity:</strong> <span class="product-status ${
                                      product.quantity === 0
                                        ? "stock-out"
                                        : product.quantity <
                                          product.itemMinimumQTY
                                        ? "stock-low"
                                        : "stock-in"
                                    }">${product.quantity}</span></p>
                                    <p><strong>Minimum Quantity:</strong> ${
                                      product.itemMinimumQTY
                                    }</p>
                                    <p><strong>Expiry Date:</strong> ${new Date(
                                      product.expiaryDate
                                    ).toLocaleDateString()}</p>
                                    <p><strong>Batch Number:</strong> ${
                                      product.batchNumber
                                    }</p>
                                    <p><strong>Category:</strong> ${
                                      product.category?.name || "N/A"
                                    }</p>
                                    <p><strong>Supplier:</strong> ${
                                      product.supplier?.supplierName || "N/A"
                                    }</p>
                                </div>
                                <div class="barcode-qr">
                                    <p><strong>Barcode:</strong></p>
                                    <img src="${
                                      product.productBarcode
                                    }" alt="Barcode">
                                    <p><strong>QR Code:</strong></p>
                                    <img src="${
                                      product.ProductQrCode
                                    }" alt="QR Code">
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="no-products">
                        <h3>No Products Found</h3>
                        <p>There are no products matching the selected criteria: ${criteriaDescription}</p>
                    </div>
                `
                }
            </div>
        </div>
    </body>
    </html>
    `;

    // Generate PDF from the HTML content
    const pdfBuffer = await generatePDFFromHtml(htmlContent);

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

export const sendOrder = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const productItem = await Product.findOne({ _id: itemId })
      .populate("category")
      .populate("supplier");
    const email = productItem.supplier.supplierEmail;
    const supplierName = productItem.supplier.supplierName;
    const itemName = productItem.name;
    // Send the email
    try {
      const emailData = {
        supplierName: productItem.supplier.supplierName,
        itemName: productItem.name,
        email: productItem.supplier.supplierEmail,
        quantity: quantity, // Add quantity to the email data
      };
      await GoogleSendMail({
        email: productItem.supplier.supplierEmail,
        subject: `Order Request for ${productItem.name}`,
        template: "itemOrderRequest.ejs", // The path to your template
        data: emailData,
      });
      productItem.isOrder = true;
      await productItem.save();
      const response = new SupplierOrder({
        product: itemId,
        productName: productItem.name,
        quantity,
        supplier: productItem.supplier._id,
        orderDate: new Date(),
        status: "Pending",
      });
      await response.save();
      return res.status(200).json({
        message: "Email is succesfully sent and order has been placed",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
