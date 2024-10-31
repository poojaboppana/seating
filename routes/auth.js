const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User'); // Ensure this path is correct
const Admin = require('../models/admin'); // Ensure this path is correct
const path = require('path');

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
        res.redirect(`/login?error=Server error during signup: ${error.message}`); // Corrected with backticks
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        if (role === 'admin') {
            // Check if the user is an admin
            const existingAdmin = await Admin.findOne({ useremail: email });
            if (existingAdmin) {
                const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
                if (isPasswordValid) {
                    req.session.userId = existingAdmin._id; // Set admin ID in session
                    return res.redirect("/admin"); // Redirect admin to events page
                } else {
                    console.log("Invalid password for admin:", email); // Debug log
                    return res.redirect("/login?error=Invalid email or password");
                }
            }
        } else {
            // If not an admin, check for regular user
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                const isPasswordValid = await bcrypt.compare(password, existingUser.password);
                if (isPasswordValid) {
                    req.session.userId = existingUser._id; // Set user ID in session
                    return res.redirect("/seats"); // Redirect regular user to seats page
                }
            }
        }

        console.log("Admin/User not found with email:", email); // Debug log
        return res.redirect("/login?error=Invalid email or password");
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect(`/login?error=Server error during login: ${error.message}`); // Corrected with backticks
    }
});

// Protect the event page route
router.get('/admin', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
    } else {
        res.redirect('/login?error=Please log in to continue');
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
