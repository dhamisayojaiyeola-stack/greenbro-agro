const express = require("express");
const jwt = require("jsonwebtoken");
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
                message: "Only customers can manage delivery details."
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


// GET SAVED DELIVERY DETAILS
router.get("/", verifyCustomer, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("deliveryDetails");

        if (!user) {
            return res.status(404).json({
                message: "Customer account not found."
            });
        }

        res.status(200).json({
            deliveryDetails: user.deliveryDetails || {}
        });

    } catch (error) {
        console.error("Get delivery details error:", error.message);

        res.status(500).json({
            message: "Unable to load delivery details."
        });
    }
});


// SAVE OR UPDATE DELIVERY DETAILS
router.put("/", verifyCustomer, async (req, res) => {
    try {
        const {
            recipientName,
            deliveryPhone,
            state,
            lga,
            address,
            landmark
        } = req.body;

        if (!recipientName || !deliveryPhone || !state || !lga || !address) {
            return res.status(400).json({
                message: "Please complete all required delivery fields."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "Customer account not found."
            });
        }

        user.deliveryDetails = {
            recipientName: recipientName.trim(),
            deliveryPhone: deliveryPhone.trim(),
            state: state.trim(),
            lga: lga.trim(),
            address: address.trim(),
            landmark: (landmark || "").trim()
        };

        await user.save();

        res.status(200).json({
            message: "Delivery details saved successfully.",
            deliveryDetails: user.deliveryDetails
        });

    } catch (error) {
        console.error("Save delivery details error:", error.message);

        res.status(500).json({
            message: "Unable to save delivery details. Please try again."
        });
    }
});

module.exports = router;