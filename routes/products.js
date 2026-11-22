
const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();


// GET ALL AVAILABLE PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({
            isAvailable: true
        }).sort({ createdAt: -1 });

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: "Unable to load products."
        });
    }
});

// GET ALL PRODUCTS FOR ADMIN
router.get("/admin/all", adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: "Unable to load admin products."
        });
    }
});

// ADD A NEW PRODUCT - ADMIN ONLY
router.post("/", adminAuth, async (req, res) => {
    try {
        const {
            name,
            brand,
            category,
            description,
            image,
            unit,
            variants,
            isAvailable
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                message: "Product name and category are required."
            });
        }

        const product = await Product.create({
            name,
            brand,
            category,
            description,
            image,
            unit,
            variants,
            isAvailable
        });

        res.status(201).json({
            message: "Product added successfully.",
            product
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to add product.",
            error: error.message
        });
    }
});


// UPDATE A PRODUCT - ADMIN ONLY
router.put("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID."
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.status(200).json({
            message: "Product updated successfully.",
            product
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to update product.",
            error: error.message
        });
    }
});


// DELETE A PRODUCT - ADMIN ONLY
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID."
            });
        }

        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.status(200).json({
            message: "Product deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to delete product."
        });
    }
});

module.exports = router;
