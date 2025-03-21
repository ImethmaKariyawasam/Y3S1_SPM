// const productItems = require("../models/product");
// const router = require("express").Router();



// router.route("/").get((req,res) => {
//     Employer.find()
//         .then((productItems)=> {
//             res.json(productItems)
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(500).json("Error fetching product");
//         })
// });



// router.route("/get/:id").get(async(req,res) => {
//     const empid = req.params.id;
//     try{
//         const product = await productItems.find({RID:empid});
//         res.status(200).send({ status: "product fetch", data: product });
//     }catch (err) {
//         console.log(err);
//         res.status(500).send({ status: "Error product fetch" });
//       }
// })


const express = require("express");
const router = express.Router(); 
const ProductItems = require("../models/product");

router.route("/").get(async (req, res) => {
  try {
    const productItems = await ProductItems.find({}, "name")
    const productNames = productItems.map((product) => product.name);
    res.json(productNames);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error fetching product names");
  }
});


router.route("/get/:id").get(async (req, res) => {
  const serviceid = decodeURIComponent(req.params.id); 
  try {
      const services = await ProductItems.find({ name: serviceid }); 
      res.status(200).send({ status: "product fetch", data: services });
  } catch (err) {
      console.log(err);
      res.status(500).send({ status: "Error with product " });
  }
});


// router.route("/:pname").get(async (req, res) => {
//     const serviceid = req.params.pname;

//     try {
//         const serices = await ProductItems.find({ name: serviceid });
//         if (serices.length > 0) {
//             res.status(200).send({ status: "product fetch", data: serices });
//         } else {
//             res.status(404).send({ status: "No products found" });
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ status: "Error with product " });
//     }
// });




module.exports = router; // Export the router
