
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        brand: {
            type: String,
            trim: true,
            default: ""
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        // OLD PRODUCT UNIT FIELD - KEPT FOR EXISTING PRODUCTS
        unit: {
            type: String,
            enum: ["", "kg", "carton", "unit", "tubers", "basket", "bag", "litres", "pack"],
            default: ""
        },

        variants: [
            {
                // NEW UNIT FIELD
                unit: {
                    type: String,
                    enum: ["kg", "unit", "carton", "tubers", "basket", "bag", "litres", "pack"],
                    default: ""
                },

                // OLD SIZE FIELD - KEPT FOR EXISTING PRODUCTS
                size: {
                    type: String,
                    default: ""
                },

                price: {
                    type: Number,
                    default: null,
                    min: 0
                },

                // OLD STOCK FIELD - KEPT FOR EXISTING PRODUCTS
                stock: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ],

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
