const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
require("dotenv").config();
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password", // Use app password if 2FA is enabled
    },
});

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Signup route
// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/login?error=Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword });

        // Save the user to the database
        await newUser.save();

        // Redirect or render success message
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.redirect(`/login?error=Server error during signup: ${error.message}`);
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email }); // Find user by email
        if (existingUser) {
            const isPasswordValid = await bcrypt.compare(password, existingUser.password); // Compare hashed password
            if (isPasswordValid) {
                return res.redirect("/seats"); // Redirect to dashboard on successful login
            }
        }
        // If user not found or password is incorrect
        return res.redirect("/login?error=Invalid email or password");
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect(`/login?error=Server error during login: ${error.message}`);
    }
});

module.exports = router;
