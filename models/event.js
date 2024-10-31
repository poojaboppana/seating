const mongoose = require('mongoose');

// Define the event schema
const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    chairsAvailable: {
        type: Number,
        required: true,
    },
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
