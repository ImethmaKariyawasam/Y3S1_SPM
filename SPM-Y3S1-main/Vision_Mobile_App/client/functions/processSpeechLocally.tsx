import React, { useEffect, useState } from "react";

// Define the Product interface
interface IProduct {
  name: string;
  description: string;
  price: number;
  isSale: boolean;
  salePrice: number;
  quantity: number;
  itemMinimumQTY: number;
  expiaryDate: Date;
  batchNumber: string;
  productImage: string;
  productBarcode: string;
  ProductQrCode: string;
  category: string; // Assuming you will reference ProductCategory by ID
  supplier: string; // Assuming you will reference Supplier by ID
  status: string;
  isOrder: boolean;
}

export const processSpeechLocally = async (
  speechTranscript: string,
  productData: { products: IProduct[] }
): Promise<string> => {
  if (!productData || !productData.products)
    return "Product data not available.";

  const lowerCaseTranscript = speechTranscript.toLowerCase();

  // Check for the specific product name in the transcript
  const matchingProducts = productData.products.filter((product) =>
    product.name.toLowerCase().includes(lowerCaseTranscript)
  );

  if (matchingProducts.length > 0) {
    const productDetails = matchingProducts
      .map((product) => {
        // Check if the product is on sale
        if (product.isSale) {
          const discountPercentage =
            ((product.price - product.salePrice) / product.price) * 100;
          return `${product.name} (Sale!) - Original Price: LKR ${
            product.price
          }, Sale Price: LKR ${product.salePrice} (${discountPercentage.toFixed(
            2
          )}% off). ${product.quantity} available.`;
        } else {
          return `${product.name} - Price: LKR ${product.price}. ${product.quantity} available.`;
        }
      })
      .join("\n");

    return `Found the following products:\n${productDetails}`;
  }

  // Check if the user is asking for total product count
  if (lowerCaseTranscript.includes("how many products")) {
    return `There are ${productData.products.length} products available.`;
  }

  // Check if the user is asking for products on sale
  if (lowerCaseTranscript.includes("products on sale")) {
    const productsOnSale = productData.products.filter(
      (product) => product.isSale
    );

    if (productsOnSale.length > 0) {
      const saleDetails = productsOnSale
        .map((product) => {
          const discountPercentage =
            ((product.price - product.salePrice) / product.price) * 100;
          return `${product.name} is on sale! Original Price: LKR ${
            product.price
          }, Sale Price: LKR ${product.salePrice} (${discountPercentage.toFixed(
            2
          )}% off).`;
        })
        .join("\n");

      return `Here are the products on sale:\n${saleDetails}`;
    } else {
      return "There are no products currently on sale.";
    }
  }

  // Simple greeting check
  if (lowerCaseTranscript.includes("hello")) {
    return "Hi!";
  }

  return "I couldn't understand your request.";
};
