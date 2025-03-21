import productCategoryModel from "../models/productCategory.model.js";
import { errorHandler } from "../utils/error.js";
import generatePdfFromHtml from "../utils/pdfGenerator.js";

// Create a new product category
export const createProductCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const categoryExist = await productCategoryModel.findOne({ name });
    if (categoryExist) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const productCategory = new productCategoryModel({
      name,
      description,
      status,
    });
    await productCategory.save();
    res.status(201).json(productCategory);
  } catch (error) {
    next(error);
  }
};

// Get all product categories
export const getProductCategories = async (req, res, next) => {
  try {
    const productCategories = await productCategoryModel
      .find()
      .populate("products");
    const totalCategories = await productCategoryModel.countDocuments();
    const activeCategories = productCategories.filter(
      (category) => category.status === "Active"
    ).length;
    const inactiveCategories = productCategories.filter(
      (category) => category.status === "Deactive"
    ).length;
    const promotions = productCategories.filter(
      (category) => category.isPromotions === true
    ).length;
    const noPromotions = productCategories.filter(
      (category) => category.isPromotions === false
    ).length;
    res.status(200).json({
      productCategories,
      totalCategories,
      activeCategories,
      inactiveCategories,
      promotions,
      noPromotions,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product category
export const deleteProductCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productCategoryModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Product Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update a product category
export const updateProductCategory = async (req, res, next) => {
  try {
    const { name, description, status, promotions, isPromotions } = req.body;
    const id = req.params.id;

    // Convert isPromotions to boolean
    const isPromotionsBool = isPromotions === "Active";

    // Find the product category by ID
    const productCategory = await productCategoryModel.findById(id);

    if (!productCategory) {
      return res.status(404).json({ message: "Product Category not found" });
    }

    // Update the fields if they are provided
    if (name) productCategory.name = name;
    if (description) productCategory.description = description;
    if (status) productCategory.status = status;
    if (promotions) productCategory.promotions = promotions;
    if (isPromotions !== undefined)
      productCategory.isPromotions = isPromotionsBool;

    // Save the updated product category
    await productCategory.save();

    res.status(200).json({ message: "Product Category updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Download product category with products report as PDF
export const downloadProductCategoryReport = async (req, res) => {
  const categoryID = req.body.categoryID;

  try {
    // Fetch the specific product category by ID with associated products
    const productCategory = await productCategoryModel
      .findById(categoryID)
      .populate("products");

    if (!productCategory) {
      return res.status(404).json({ message: "Product category not found" });
    }

    // Generate the HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Category Report</title>
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
            .category-info {
                background-color: #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            .category-info h2 {
                color: #007bff;
                margin-top: 0;
            }
            .status-label {
                font-weight: bold;
                padding: 5px 10px;
                border-radius: 20px;
                display: inline-block;
            }
            .status-active { background-color: #d4edda; color: #155724; }
            .status-deactive { background-color: #f8d7da; color: #721c24; }
            .promotion-true { background-color: #cce5ff; color: #004085; }
            .promotion-false { background-color: #e2e3e5; color: #383d41; }
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
                <h1>Product Category Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            <div class="category-info">
                <h2>Category: ${productCategory.name}</h2>
                <p><strong>Description:</strong> ${
                  productCategory.description || "N/A"
                }</p>
                <p><strong>Status:</strong> <span class="status-label ${
                  productCategory.status.toLowerCase() === "active"
                    ? "status-active"
                    : "status-deactive"
                }">${productCategory.status}</span></p>
                <p><strong>Promotions:</strong> <span class="status-label ${
                  productCategory.isPromotions
                    ? "promotion-true"
                    : "promotion-false"
                }">${
      productCategory.isPromotions ? "Active" : "Inactive"
    }</span></p>
            </div>
            <h2>Products</h2>
            ${
              productCategory.products.length > 0
                ? `
                <div class="product-list">
                    ${productCategory.products
                      .map(
                        (product) => `
                        <div class="product-card">
                            <img src="${product.productImage}" alt="${
                          product.name
                        }" class="product-image">
                            <h3>${product.name}</h3>
                            <p><strong>Description:</strong> ${
                              product.description
                            }</p>
                            <p><strong>Price:</strong> $${product.price.toFixed(
                              2
                            )}</p>
                            <p><strong>Status:</strong> <span class="status-label ${
                              product.status.toLowerCase() === "active"
                                ? "status-active"
                                : "status-deactive"
                            }">${product.status}</span></p>
                            <p><strong>Sale:</strong> <span class="status-label ${
                              product.isSale
                                ? "promotion-true"
                                : "promotion-false"
                            }">${
                          product.isSale ? "On Sale" : "Regular"
                        }</span></p>
                            <p><strong>Quantity:</strong> ${
                              product.quantity
                            }</p>
                            <p><strong>Minimum Quantity:</strong> ${
                              product.itemMinimumQTY
                            }</p>
                            <p><strong>Expiry Date:</strong> ${new Date(
                              product.expiaryDate
                            ).toLocaleDateString()}</p>
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
                    <p>There are currently no products in this category.</p>
                </div>
            `
            }
        </div>
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

// Downloat product category details report as PDF
export const downloadCategoryDetailsReport = async (req, res) => {
  const categoryID = req.body.categoryID;

  try {
    // Fetch the specific product category by ID without populating products
    const productCategory = await productCategoryModel.findById(categoryID);

    if (!productCategory) {
      return res.status(404).json({ message: "Product category not found" });
    }

    try {
      // Start building the HTML content
      let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Category Details Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
            }
            .section h2 {
                color: #555;
                margin-bottom: 10px;
            }
            .section p {
                color: #666;
                margin-bottom: 5px;
            }
            .section p strong {
                color: #333;
            }
            .status-active {
                color: green;
            }
            .status-deactive {
                color: red;
            }
            .status-pending {
                color: orange;
            }
            .promotion-true {
                color: blue;
            }
            .promotion-false {
                color: gray;
            }
        </style>
    </head>
    <body>
  `;

      // Build HTML content for the specific product category details
      const categoryStatusClass =
        productCategory.status.toLowerCase() === "active"
          ? "status-active"
          : "status-deactive";
      const categoryPromotionClass = productCategory.isPromotions
        ? "promotion-true"
        : "promotion-false";

      htmlContent += `
    <div class="section">
      <h2>Category: ${productCategory.name}</h2>
      <p><strong>Description:</strong> ${
        productCategory.description || "N/A"
      }</p>
      <p><strong>Status:</strong> <span class="${categoryStatusClass}">${
        productCategory.status
      }</span></p>
      <p><strong>Promotions:</strong> <span class="${categoryPromotionClass}">${
        productCategory.isPromotions ? "Active" : "Inactive"
      }</span></p>
    </div>
  `;

      htmlContent += `</body></html>`;

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadCategoryReportPromoStatus = async (req, res) => {
  let status = req.body.promoStatus;
  let isPromotionsBool = status === "Active";
  if (status == "Active") {
    isPromotionsBool = true;
  } else {
    isPromotionsBool = false;
  }
  try {
    // Fetch categories with promotions
    const categories = await productCategoryModel.find({
      isPromotions: isPromotionsBool,
    });

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Category Promotion Report</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
              }
              .section {
                  margin-bottom: 20px;
                  border: 1px solid #ccc;
                  padding: 15px;
                  border-radius: 10px;
              }
              .section h2 {
                  color: #555;
                  margin-bottom: 10px;
              }
              .section p {
                  color: #666;
                  margin-bottom: 5px;
              }
              .status-active {
                  color: green;
              }
              .status-inactive {
                  color: red;
              }
          </style>
      </head>
      <body>
        <h1>Categories with Promotions</h1>
    `;

    // Check if there are categories with promotions
    if (categories.length === 0) {
      htmlContent += `
        <div class="section">
          <p>No categories found with active promotions.</p>
        </div>
      `;
    } else {
      // Build HTML content for each category
      categories.forEach((category) => {
        const categoryStatusClass = category.isPromotions
          ? "status-active"
          : "status-inactive";
        htmlContent += `
          <div class="section">
            <h2>Category: ${category.name}</h2>
            <p><strong>Description:</strong> ${
              category.description || "N/A"
            }</p>
            <p><strong>Status:</strong> <span class="${categoryStatusClass}">${
          category.isPromotions ? "Active" : "Inactive"
        }</span></p>
          <p><strong>Promotion Description:</strong> ${
            category.promotions || "N/A"
          }</p>
          </div>
        `;
      });
    }

    htmlContent += `</body></html>`;

    // Generate PDF from the HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
};
