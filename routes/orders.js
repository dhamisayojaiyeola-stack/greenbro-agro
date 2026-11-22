const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// VERIFY CUSTOMER LOGIN
async function verifyCustomer(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please log in to continue."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "customer") {
            return res.status(403).json({
                message: "Only customers can place orders."
            });
        }

        req.userId = decoded.id;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Your session has expired. Please log in again."
        });
    }
}

// CREATE CUSTOMER ORDER
router.post("/", verifyCustomer, async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "Customer account not found."
            });
        }

        const delivery = user.deliveryDetails;

        if (
            !delivery ||
            !delivery.recipientName ||
            !delivery.deliveryPhone ||
            !delivery.state ||
            !delivery.lga ||
            !delivery.address
        ) {
            return res.status(400).json({
                message: "Please save your delivery details before placing an order."
            });
        }

        let verifiedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product || !product.isAvailable) {
                return res.status(400).json({
                    message: "One or more products are unavailable."
                });
            }

            let variant;

const variantIndex = Number(item.variantIndex);

if (
    Number.isInteger(variantIndex) &&
    variantIndex >= 0 &&
    variantIndex < product.variants.length
) {
    variant = product.variants[variantIndex];
} else {
    // Fallback for older cart items
    variant = product.variants.find((v) =>
        v.unit === item.unit &&
        String(v.size || "") === String(item.size || "") &&
        Number(v.price) === Number(item.price)
    );
}

            const actualUnit = variant
    ? (variant.unit || product.unit || "unit")
    : "";

const actualSize = variant ? String(variant.size || "") : "";

if (
    !variant ||
    Number(variant.price) !== Number(item.price) ||
    actualUnit !== item.unit ||
    actualSize !== String(item.size || "")
) {
    return res.status(400).json({
        message: `${product.name} has an invalid or updated variant or price. Please refresh your cart.`
    });
}

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: "Invalid product quantity."
                });
            }

            const price = Number(variant.price);

            verifiedItems.push({
                productId: product._id,
                productName: product.name,
                brand: product.brand || "",
                unit: actualUnit,
                size: variant.size || "",
                price,
                quantity
            });

            totalAmount += price * quantity;
        }

        const order = await Order.create({
            customer: user._id,
            items: verifiedItems,
            deliveryDetails: delivery,
            totalAmount
        });

        res.status(201).json({
            message: "Your order has been placed successfully.",
            order
        });

    } catch (error) {
        console.error("Create order error:", error.message);

        res.status(500).json({
            message: "Unable to place your order. Please try again."
        });
    }
});

// GET CUSTOMER ORDER HISTORY
router.get("/my-orders", verifyCustomer, async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Fetch orders error:", error.message);

        res.status(500).json({
            message: "Unable to load your orders."
        });
    }
});

module.exports = router;