const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const Admin = require('./models/admin'); // Adjust path to your admin model
const Event = require('./models/event'); // Ensure this is correct

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change to a secure secret
    resave: false,
    saveUninitialized: false,
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/arrangement')
    .then(() => {
        console.log("Connected to MongoDB");
        // Initialize admin user if needed
        initializeAdmin(); // Call the function to initialize the admin user
    })
    .catch(err => console.error("MongoDB connection error:", err));

// Function to initialize the admin
async function initializeAdmin() {
    const email = 'admin@gmail.com'; // Admin email
    const plainPassword = 'admin@123'; // Admin password

    try {
        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ useremail: email });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            const newAdmin = new Admin({
                useremail: email,
                password: hashedPassword,
            });
            await newAdmin.save();
            console.log("Admin user created successfully in arrangement database");
        } else {
            console.log("Admin already exists in arrangement database.");
        }
    } catch (error) {
        console.error("Error creating admin:", error);
    }
}

// POST endpoint to create an event
app.post('/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET endpoint to retrieve events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Use the auth routes for login and signup
app.use(authRoutes);

// Route for booking seats
app.get('/seats', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'seats.html'));
});

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Other routes
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
