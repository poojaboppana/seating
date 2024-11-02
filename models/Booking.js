const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    bookingDate: { 
        type: Date, 
        required: true 
    },
    seats: { 
        type: [Number], 
        required: true, 
        min: 1 
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
