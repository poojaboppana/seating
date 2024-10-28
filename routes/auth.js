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

// Endpoint to send email
router.post("/send", (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email, // sender address
        to: "info@vignan.ac.in", // receiver address
        subject: `Message from ${name}`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ success: false, message: "Failed to send message." });
        }
        res.status(200).send({ success: true, message: "Message sent successfully!" });
    });
});







// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword });

        // Save the user to the database
        await newUser.save();
        console.log('User registered:', newUser);
        
        // Redirect to login page after successful signup
        res.redirect('/login');
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Server error during signup');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        // Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send('Invalid credentials');

        // Successful login
        console.log('User logged in:', user);
        res.redirect('/seats'); // Redirect to your desired page after login
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Server error during login');
    }
});





module.exports = router;
