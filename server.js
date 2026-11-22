
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const deliveryRoutes = require("./routes/delivery");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// SERVE WEBSITE FILES
app.use(express.static(__dirname));

// HOMEPAGE TEST
app.get("/api", (req, res) => {
    res.send("GREENBRO AGRO API is running successfully!");
});

// CUSTOMER REGISTRATION AND LOGIN
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/orders", orderRoutes);

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("GREENBRO AGRO connected to MongoDB successfully!");

        app.listen(PORT, () => {
            console.log(`GREENBRO AGRO server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
