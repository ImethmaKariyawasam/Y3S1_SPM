// src/services/productService.ts
import { Request, Response } from "express";
import { ProductModel } from '../models/product.model'; // Adjust the import path based on your structure

// Define the getProducts function with proper TypeScript types
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await ProductModel.find(); // Populate if needed
    res.status(200).json(products); // Send the products back as a JSON response
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products: ' + error.message }); // Send an error response
  }
};
