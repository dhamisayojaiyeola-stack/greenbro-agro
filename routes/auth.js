
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);
const router = express.Router();


// GOOGLE SIGN-IN
router.get("/google", (req, res) => {
    try {
        const state = crypto.randomBytes(32).toString("hex");

        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000
        });

        const url = googleClient.generateAuthUrl({
            access_type: "online",
            scope: ["openid", "email", "profile"],
            state,
            prompt: "select_account"
        });

        res.redirect(url);

    } catch (error) {
        console.error("Google sign-in error:", error.message);
        res.status(500).send("Unable to start Google sign-in.");
    }
});


// GOOGLE SIGN-IN CALLBACK
router.get("/google/callback", async (req, res) => {
    try {
        const { code, state } = req.query;
        const savedState = req.cookies.oauth_state;

        res.clearCookie("oauth_state");

        if (!code || !state || !savedState || state !== savedState) {
            return res.status(400).send("Google sign-in session is invalid. Please try again.");
        }

        const { tokens } = await googleClient.getToken(code);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const googleUser = ticket.getPayload();

        if (!googleUser.email || !googleUser.email_verified) {
            return res.status(400).send("Your Google email must be verified.");
        }

        let user = await User.findOne({
            googleId: googleUser.sub
        });

        if (!user) {
            const existingUser = await User.findOne({
                email: googleUser.email.toLowerCase()
            });

            if (existingUser) {
                return res.status(409).send(
                    "An account already exists with this email. Please sign in using your existing email and password."
                );
            }

            user = await User.create({
                fullName: googleUser.name || "GREENBRO Customer",
                email: googleUser.email.toLowerCase(),
                googleId: googleUser.sub,
                authProvider: "google",
                isVerified: true
            });
        }

       const token = jwt.sign(
    {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ""
    },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.redirect("/google-auth-success.html#token=" + token);

    } catch (error) {
        console.error("Google callback error:", error.message);
        res.status(500).send("Google sign-in failed. Please try again.");
    }
});

// CUSTOMER REGISTRATION
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, phone, password, confirmPassword } = req.body;

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { phone: phone.trim() }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email or phone number already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            fullName,
            email,
            phone,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Your GREENBRO AGRO account has been created successfully.",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

// CUSTOMER LOGIN
router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                message: "Please enter your email or phone number and password."
            });
        }

        const user = await User.findOne({
            $or: [
                { email: login.toLowerCase().trim() },
                { phone: login.trim() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid login details."
            });
        }

        if (user.authProvider === "google" || !user.password) {
    return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google."
    });
}

const passwordMatch = await bcrypt.compare(
    password,
    user.password
);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid login details."
            });
        }

     const token = jwt.sign(
    {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ""
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

res.status(200).json({
    message: "Login successful.",
    token: token,
    user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
    }
});
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

module.exports = router;
