
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function adminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please log in to continue."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired login session."
        });
    }
}

module.exports = adminAuth;
