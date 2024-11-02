const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const authRoutes = require('./routes/auth');
const Admin = require('./models/admin');
const Event = require('./models/event');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

mongoose.connect('mongodb://localhost:27017/arrangement')
    .then(() => {
        console.log("Connected to MongoDB");
        initializeAdmin();
    })
    .catch(err => console.error("MongoDB connection error:", err));

async function initializeAdmin() {
    const email = 'admin@gmail.com';
    const plainPassword = 'admin@123';

    try {
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

app.post('/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.use(authRoutes);

app.get('/seats', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'seats.html'));
});
app.get('/details', (req, res) => {
    res.render('details');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
