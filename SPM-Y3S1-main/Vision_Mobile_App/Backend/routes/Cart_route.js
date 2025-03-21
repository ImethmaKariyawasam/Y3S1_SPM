const Cart = require("../models/Cart");
const router = require("express").Router();

router.route("/Add").post((req,res) =>{
    const{
        CustomerID,
        Pname,
        Price,
        Date,
        batchNumber,
        Count,
    } = req.body;

    const newcart = new Cart({
        CustomerID,
        Pname,
        Price,
        Date,
        batchNumber,
        Count,
    })
    newcart.save().then(()=>{
        res.json("Product Added t the cart")
    }) .catch((err)=>{
        console.log(err);
        res.status(500).json("Error adding new product");
    }) 


})

router.route("/").get(async (req, res) => {

    try {
        const productItems = await Cart.find({}, "Pname Price");
        const productNames = productItems.map((cart) => ({
            Pname: cart.Pname,
            Price: cart.Price
          }));      res.json(productNames);
    } catch (err) {
      console.log(err);
      res.status(500).json("Error fetching cart names");
    }

});


router.route("/delete/:id").delete(async (req, res) => {
    
  const customerID = req.params.id;

  try {
      // Find and delete the product based on the `CustomerID` field
      const product = await Cart.findOneAndDelete({ _id: customerID }); 
      
      if (!product) {
          return res.status(404).send({ status: "Product not found" });
      }
      
      res.status(200).send({ status: "Product Deleted" });
  } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).send({ status: "Product deletion unsuccessful" });
  }
});

router.route("/get/:id").get(async (req, res) => {
    const productName = decodeURIComponent(req.params.id); // Assuming you're passing product name in the URL

    try {
        // Find the product by its Pname, not by _id
        const product = await Cart.findOne({ Pname: productName }); 
        if (!product) {
            return res.status(404).send({ status: "Product not found" });
        }
        res.status(200).send({ status: "Product fetched", data: product });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error fetching product" });
    }
});


// PUT route to update product Count
router.put('/update/:id', async (req, res) => {
    const { Count1 } = req.body; // Extract Count1 from the request body
    const productId = req.params.id;
    
    // Ensure Count1 is a number and valid
    if (typeof Count1 !== 'number' || isNaN(Count1)) {
        return res.status(400).send({ status: "Invalid Count value" });
    }
    try {
        // Use $set to only update the Count field
        const updatedProduct = await Cart.findByIdAndUpdate(
            productId, 
            { $set: { Count: Count1 } },
            { new: true } // Return the updated document
        );

        if (updatedProduct) {
            res.status(200).send({ status: "Product count updated successfully", data: updatedProduct });
        } else {
            res.status(404).send({ status: "Product not found" });
        }
    } catch (err) {
        console.log("Error during update:", err);
        res.status(500).json({ status: "Error with update" });
    }
});




  

module.exports = router;