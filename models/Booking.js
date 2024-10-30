const mongoose = require('mongoose');
// Define the booking schema
const bookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Reference to the User model
        required: true // User ID is required
    },
    bookingDate: { 
        type: Date, 
        required: true // Date of booking is required
    },
    seats: { 
        type: [Number], // Store an array of booked seat numbers
        required: true, // Seats array is required
        min: 1 // Ensure at least one seat is booked
    }
});

// Create the Booking model using the schema
module.exports = mongoose.model('Booking', bookingSchema);
