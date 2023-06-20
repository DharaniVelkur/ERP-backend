const express = require("express");
const router = new express.Router();
const products = require('../models/productSchema');
const dotenv = require("dotenv");
const users = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
dotenv.config();

//get all the products
router.get('/getProducts', async (req, res) => {
    try {
        const productsdata = await products.find({});
        if (productsdata) {
            res.status(200).json(productsdata);
        } else {
            res.status(400).json({ error: "No products available" });
        }
    } catch (error) {
        res.status(404).json({ error: "Some error occured" });
    }
});

//get a single product
// router.get('/getProductOne/:id', async (req, res) => {
//     let id = req.params.id;
//     try {
//         let findoneproduct = await products.findOne({ _id: id });
//         if (findoneproduct) {
//             res.status(200).json(findoneproduct);
//         } else {
//             res.status(400).json({ status: 400, error: "No product found!!" });
//         }

//     } catch (error) {
//         res.status(404).json({ status: 404, error: "Some error occured" });
//     }
// })

//register a user
router.post('/register', async (req, res) => {
    if (
        req.body.name === "" ||
        req.body.email == "" ||
        req.body.password == "" ||
        req.body.cpassword == ""
    ) {
        res.status(400).json({ error: "All fields are mandatory!!" });
    }
    try {
        const preuser = await users.findOne({ email: req.body.email });
        if (preuser) {
            res.status(400).json({ error: "Email already exists!!" });
        } else if (req.body.password !== req.body.cpassword) {
            res
                .status(400)
                .json({ error: "Password and confirm password does not match" });
        } else {
            const newuser = await new users({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword
            })
            //password hashing
            let user = await newuser.save();
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//login user
router.post("/login", async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({ error: "Empty fields are not allowed!!" });
    } else {
        try {
            const finduser = await users.findOne({ email: req.body.email });
            if (finduser) {
                const ismatch = await bcrypt.compare(req.body.password, finduser.password);
                if (ismatch) {
                    const token = await finduser.generateAuthtoken();
                    res.status(200).json({ finduser, token });
                }
                else {
                    res.status(400).json({ error: "Incorrect Password!" });
                }
            } else {
                res.status(400).json({ error: "Invalid details!!" });
            }
        } catch (error) {
            res.status(400).json({ error: "Some error occurred" })
        }
    }

});

//valid user
router.get('/validuser', authenticate, async (req, res) => {
    try {
        const validuserone = await users.findOne({ _id: req.userId });
        if (validuserone) {
            res.status(200).json({ status: 200, validuserone })
        } else {
            res.status(401).json({ status: 401, error });
        }

    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
})

//user logout
router.get('/logout', authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter(e => {
            return e.token !== req.token
        })
        req.rootUser.save();
        res.status(200).json({ status: 200 })
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
})

//adding the data into the cart
router.post('/addcart/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    try {
        // const product = await products.findOne({ _id: id });
        const cartuser = await users.findOne({ _id: req.userId });
        if (cartuser) {
            console.log(req.body)
            const cartData = await cartuser.addcartdata(req.body);
            await cartuser.save();
            res.status(200).json({ status: 200, cartuser });
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: "error occurred" });
    }
});

//get cart details
router.get('/cartdetails',authenticate, async(req, res) => {
    try {
        const buyuser=await users.findOne({ _id: req.userId });
        res.status(200).json({ status: 200, buyuser });
    } catch (error) {
        console.log(error)
    }
})


//complete checkout process
router.post('/checkout',authenticate, async(req, res) => {
    try {
        // const product = await products.findOne({ _id: id });
        const cartuser = await users.findOne({ _id: req.userId });
        if (cartuser) {
            console.log(req.body)
            const orderData = await cartuser.addorderdata(req.body.orders);
            await cartuser.save();
            res.status(200).json({ status: 200, cartuser });
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: "error occurred" });
    }
})

//delete a product from the cart user
router.delete('/deleteproduct/:id',authenticate,async (req,res)=>{
    let id=req.params.id;
    try {
        let user=await users.findOne({_id:req.userId});
        if(user){
        for(let i=0;i<user.carts.length;i++){
            if(user.carts[i]._id===id){
               user.carts.splice(i,1);
               break;
            }
        }
        user.save();
    }
    await res.status(200).json({status:200,user})

    } catch (error) {
        res.status(400).json({ error: "error occurred" });
    }
})


//get all users
router.get('/getallusers',authenticate,async (req,res)=>{
    let allusers=await users.find();
    if(allusers){
        res.status(200).json({status:200,allusers});
    }else{
        res.status(400).json({error: "not found"});
    }
});

//get all orders of all users
router.get('/getallorders/:userId',authenticate,async (req,res)=>{
    let userId=req.params.userId;
    if(userId==="undefined"){
        let allusers=await users.find();
        let orders=[];
        for(let i=0;i<allusers?.length;i++){
        orders= orders.concat(allusers[i].orders);
        }
        res.status(200).json({status:200,orders});
    }else{
    let finduser=await users.findOne({_id:userId});
    if(finduser){
        let userorders=finduser.orders;
        res.status(200).json({status:200,orders:userorders});
    }
  }
    
})

module.exports = router;