const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User'); // Ensure the path is correct
const Admin = require('../models/admin'); // Ensure the path is correct
const Event = require('../models/event'); // Adjust the path if needed
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
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/login?error=Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'user' });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.redirect(`/login?error=Server error during signup: ${error.message}`);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        if (role === 'admin') {
            const existingAdmin = await Admin.findOne({ useremail: email });
            if (existingAdmin) {
                const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
                if (isPasswordValid) {
                    req.session.userId = existingAdmin._id;
                    return res.redirect("/admin");
                } else {
                    console.log("Invalid password for admin:", email);
                    return res.redirect("/login?error=Invalid email or password");
                }
            }
        } else {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                const isPasswordValid = await bcrypt.compare(password, existingUser.password);
                if (isPasswordValid) {
                    req.session.userId = existingUser._id;
                    return res.redirect("/event");
                }
            }
        }

        console.log("Admin/User not found with email:", email);
        return res.redirect("/login?error=Invalid email or password");
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect(`/login?error=Server error during login: ${error.message}`);
    }
});

// Event availability route
router.post('/check-event', async (req, res) => {
    const { eventName, eventDate, location } = req.body;

    if (!eventName || !eventDate || !location) {
        return res.status(400).json({ message: "Invalid input: eventName, eventDate, and location are required." });
    }

    try {
        const eventDateObject = new Date(eventDate);
        if (isNaN(eventDateObject)) {
            return res.status(400).json({ available: false, message: "Invalid date format." });
        }

        const event = await Event.findOne({
            eventName: eventName,
            eventDate: eventDateObject,
            location: location
        });

        if (!event) {
            return res.json({ available: false, message: "Event is not available." });
        }

        const currentTime = new Date();
        const endTime = new Date(`${event.eventDate.toISOString().split('T')[0]}T${event.endTime}`);

        if (currentTime > endTime) {
            return res.json({ available: false, message: "Event has already ended and is not available at the moment." });
        }

        res.json({ 
            available: true, 
            redirectUrl: `/seats?eventName=${encodeURIComponent(event.eventName)}`, // Pass the eventName
            eventDetails: { 
                name: event.eventName,
                date: event.eventDate,
                location: event.location,
                endTime: event.endTime
            }
        });
    } catch (error) {
        console.error("Error checking event:", error);
        res.status(500).json({ available: false, message: "An error occurred while checking the event." });
    }
});

// Fetch event details by eventName for the seats page
router.get('/seats', async (req, res) => {
    const { eventName } = req.query; // Get the event name from the query string
    console.log("Event Name:", eventName); // Log the event name for debugging

    try {
        // Find the event by eventName
        const eventDetails = await Event.findOne({ eventName: eventName });

        if (!eventDetails) {
            return res.status(404).send('Event not found');
        }

        // Render the seats.ejs file with event details
        res.render('seats', { event: eventDetails });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).send('An error occurred while fetching event details: ' + error.message);
    }
});

// Protect the admin route
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
