const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const Booking = require('../models/Booking');
const path = require('path'); // Make sure to require path for file serving
const Admin = require('../models/admin'); // Ensure correct relative path

const router = express.Router();

// Google OAuth login route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); // Redirect to home after successful login
    }
);

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body; // Accept role in the request

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/login?error=Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'user' }); // Assign role
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.redirect(`/login?error=Server error during signup: ${error.message}`);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is an admin
        const existingAdmin = await Admin.findOne({ useremail: email });
        if (existingAdmin) {
            const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
            if (isPasswordValid) {
                req.session.userId = existingAdmin._id; // Set admin ID in session
                return res.redirect("/events"); // Redirect admin to events page
            } else {
                return res.redirect("/login?error=Invalid email or password");
            }
        }

        // If not an admin, check for regular user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (isPasswordValid) {
                req.session.userId = existingUser._id; // Set user ID in session
                return res.redirect("/seats"); // Redirect regular user to seats page
            }
        }

        return res.redirect("/login?error=Invalid email or password");
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect(`/login?error=Server error during login: ${error.message}`);
    }
});

// Admin signup route
router.post('/admin/signup', async (req, res) => {
    const { useremail, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newAdmin = new Admin({ useremail, password: hashedPassword });
        await newAdmin.save();
        res.status(201).send('Admin created successfully!');
    } catch (error) {
        res.status(400).send('Error creating admin: ' + error.message);
    }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId || req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login?error=Please log in to continue');
    }
}

function isAdmin(req, res, next) {
    if (req.session.userId && req.body.email === ADMIN_EMAIL) {
        return next();
    }
    res.redirect('/login?error=Access denied');
}

// Protect the event page route
router.get('/events', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'events.html')); // Ensure correct path
});

// Book seats route
router.post('/api/bookSeats', isAuthenticated, async (req, res) => {
    const { date, seats } = req.body;

    try {
        const userId = req.session.userId || req.user.id; // Get user ID from session or OAuth

        // Check if seats are already booked
        const existingBooking = await Booking.findOne({ date, seats: { $in: seats } });
        if (existingBooking) {
            return res.status(400).json({ message: 'One or more seats are already booked.' });
        }

        const newBooking = new Booking({ userId, date, seats });
        await newBooking.save();
        res.status(200).json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error during booking' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.redirect('/seats?error=Logout failed');
        }
        res.redirect('/');
    });
});

module.exports = router;
