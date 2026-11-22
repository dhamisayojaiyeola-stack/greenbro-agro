const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            productName: {
                type: String,
                required: true
            },

            brand: {
                type: String,
                default: ""
            },

            unit: {
                type: String,
                required: true
            },

            size: {
                type: String,
                default: ""
            },

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],

    deliveryDetails: {
        recipientName: String,
        deliveryPhone: String,
        state: String,
        lga: String,
        address: String,
        landmark: String
    },

    totalAmount: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        default: "Pending"
    },

    paymentStatus: {
        type: String,
        default: "Unpaid"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);