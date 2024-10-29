// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/login?error=Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.redirect(`/login?error=Server error during signup: ${error.message}`);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (isPasswordValid) {
                req.session.userId = existingUser._id; // Set user ID in session
                return res.redirect("/seats");
            }
        }
        return res.redirect("/login?error=Invalid email or password");
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect(`/login?error=Server error during login: ${error.message}`);
    }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login?error=Please log in to continue');
    }
}

// Protect the booking route
router.post('/api/bookSeats', isAuthenticated, async (req, res) => {
    const { seats } = req.body;

    try {
        const userId = req.session.userId; // Get user ID from session
        const newBooking = new Booking({ userId, seats });
        await newBooking.save();
        res.status(200).json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error during booking' });
    }
});

module.exports = router;
