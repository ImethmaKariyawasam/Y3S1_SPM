const Order = require("../models/Order");
const router = require("express").Router();

router.route("/Add").post((req,res) =>{
    const{
        CustomerID,
        Date,
        Location,
        ProductArrays,
        Status,
    } = req.body;

    const newcart = new Order({
        CustomerID,
        Date,
        Location,
        ProductArrays,
        Status,
    })
    newcart.save().then(()=>{
        res.json("Order Added t the cart")
    }) .catch((err)=>{
        console.log(err);
        res.status(500).json("Error adding new Order");
    }) 


})


module.exports = router; // Export the router
 