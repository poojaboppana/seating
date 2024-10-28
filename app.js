// app.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Import Mongoose
const authRoutes = require('./routes/auth');
const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email
        pass: process.env.EMAIL_PASS,   // Use environment variable for password
    },
});

// Endpoint to handle sending emails
app.post("/send", (req, res) => {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
        return res.status(400).send({ success: false, message: "All fields are required." });
    }

    const mailOptions = {
        from: email,
        to: 'info@vignan.ac.in',
        subject: `Message from ${name}`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).send({ success: false, message: "Failed to send message." });
        }
        res.status(200).send({ success: true, message: "Message sent successfully!" });
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arrangement', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Use the auth routes for login and signup
app.use(authRoutes);

// Define routes
app.get('/seats', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'seats.html'));
});

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Home.html'));
});

// Route for login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); // Assuming login.html is in views
});

// Route for about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html')); // Assuming about.html is in views
});

// Route for contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html')); // Assuming contact.html is in views
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
