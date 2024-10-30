// models/admin.js

const mongoose = require('mongoose');

// Define the schema for the admin collection
const adminSchema = new mongoose.Schema({
    useremail: {
        type: String,
        required: true,
        unique: true, // Ensure that each email is unique
    },
    password: {
        type: String,
        required: true,
    },
});

// Create the Admin model


module.exports = mongoose.model('admin', adminSchema);
