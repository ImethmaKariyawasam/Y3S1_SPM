const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8000;
const URL = process.env.MONGODB_URL;

// Connect to MongoDB without deprecated options
mongoose.connect(URL)
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const productRoute = require("./routes/Product_route");
app.use("/fetchproduct", productRoute);

const CartRoute = require("./routes/Cart_route");
app.use("/Cart",CartRoute);

const OrderRoute = require("./routes/Order_route");
app.use("/Order",OrderRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
