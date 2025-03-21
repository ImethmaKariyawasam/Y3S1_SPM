import express from "express";
import Order from "../models/Order.js"; // Use 'import' instead of 'require'

const router = express.Router();

// Add a new order
router.post("/Add", async (req, res) => {
  const { CustomerID, Date, Location, ProductArrays, Status } = req.body;
  const newOrder = new Order({
    CustomerID,
    Date,
    Location,
    ProductArrays,
    Status
  });

  try {
    await newOrder.save();
    res.json("Order Added to the cart");
  } catch (err) {
    console.log(err);
    res.status(500).json("Error adding new Order");
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error fetching orders");
  }
});

// Update an order by ID
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { CustomerID, Date, Location, ProductArrays, Status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, {
      CustomerID,
      Date,
      Location,
      ProductArrays,
      Status,
    }, { new: true });

    res.status(200).send({ status: "Order Updated", updatedOrder });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with Update" });
  }
});

// Delete an order by ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Order.findByIdAndDelete(id);
    res.status(200).send({ status: "Order Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with delete order" });
  }
});

// Export the router using ES module syntax
export default router;
