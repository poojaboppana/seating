const leftHalf = document.querySelector('.left-half');
const rightHalf = document.querySelector('.right-half');
const availableCount = document.getElementById('availableCount');
const successMessage = document.getElementById('successMessage');
const seatCountInput = document.getElementById('seatCount');
const bookButton = document.getElementById('bookButton');
const notAvailableMessage = document.getElementById('notAvailableMessage');

// Use the dynamically passed totalSeats value from the server-side
let bookedSeats = 0;

// Initialize seats
async function initSeats() {
    // Get booked seats from localStorage
    const bookedSeatsFromStorage = JSON.parse(localStorage.getItem('bookedSeats')) || [];
    bookedSeats = bookedSeatsFromStorage.length; // Update bookedSeats count

    // Loop through the number of available seats
    for (let i = 0; i < totalSeats; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.dataset.seatNumber = i + 1; // Assign a unique seat number
        seat.innerHTML = `<span class="seat-number">${i + 1}</span><img src="/css/chair.jpeg" alt="Chair" style="width: 30px;">`; // Adjust chair image size
        seat.addEventListener('click', () => selectSeat(seat));

        // Check if the seat is booked
        if (bookedSeatsFromStorage.includes(i + 1)) {
            seat.classList.add('booked'); // Mark as booked
        }

        // Add seats to left or right half based on index
        if (i < totalSeats / 2) {
            leftHalf.appendChild(seat);
        } else {
            rightHalf.appendChild(seat);
        }
    }

    updateAvailableCount();
}

// Select a seat
function selectSeat(seat) {
    if (seat.classList.contains('booked')) {
        return; // Prevent selecting a booked seat
    }
    seat.classList.toggle('selected'); // Toggle selected state
    updateAvailableCount(); // Update available count when seat selection changes
}

// Update available seat count
function updateAvailableCount() {
    const availableSeats = totalSeats - bookedSeats;
    const selectedSeats = document.querySelectorAll('.seat.selected').length;
    availableCount.textContent = availableSeats - selectedSeats; // Show available seats after selection
}

// Show alert for validation errors
function showAlert(message) {
    alert(message); // Simple alert for demonstration
}

// Book selected seats
bookButton.addEventListener('click', bookSeats);
function bookSeats() {
    const requestedSeats = parseInt(seatCountInput.value);
    const selectedSeats = document.querySelectorAll('.seat.selected');

    if (isNaN(requestedSeats) || requestedSeats < 1) {
        showAlert("Please enter a valid number of seats.");
        return;
    }

    // Check if requested seats exceed available seats
    if (requestedSeats > (totalSeats - bookedSeats)) {
        // Display not available message
        notAvailableMessage.textContent = "Not available"; // Show the not available message
        notAvailableMessage.style.display = 'block'; // Make it visible
        setTimeout(() => {
            notAvailableMessage.style.display = 'none'; // Hide after 3 seconds
        }, 3000);
        return;
    }

    // Check if selected seats match the requested number
    if (selectedSeats.length !== requestedSeats) {
        showAlert(`Please select exactly ${requestedSeats} seats.`); // Corrected string interpolation
        return;
    }

    // Book selected seats
    selectedSeats.forEach(seat => {
        bookSeat(seat);
    });

    // Clear selection after booking
    selectedSeats.forEach(seat => {
        seat.classList.remove('selected');
    });

    // Corrected success message to include booked seats and available seats
    const availableSeatsAfterBooking = totalSeats - bookedSeats; // Calculate available seats after booking
    successMessage.textContent = `Successfully booked ${requestedSeats} seat(s)! Available Seats: ${availableSeatsAfterBooking}`;
    successMessage.style.display = 'block'; // Show success message
    setTimeout(() => {
        successMessage.style.display = 'none'; // Hide after 3 seconds
    }, 3000);

    // Update available seat count
    updateAvailableCount();
}

// Function to book a seat
function bookSeat(seat) {
    const seatNumber = parseInt(seat.dataset.seatNumber);
    bookedSeats += 1; // Increment booked seats count
    seat.classList.add('booked'); // Mark seat as booked
    // Store booked seat number in localStorage
    const currentBookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || [];
    localStorage.setItem('bookedSeats', JSON.stringify([...currentBookedSeats, seatNumber]));
}

// Initialize seats when the page loads
document.addEventListener('DOMContentLoaded', initSeats);
