const leftHalf = document.querySelector('.left-half');
const rightHalf = document.querySelector('.right-half');
const availableCount = document.getElementById('availableCount');
const message = document.getElementById('message');
const seatCountInput = document.getElementById('seatCount');
const bookButton = document.getElementById('bookButton');

const totalSeats = 100; // Total number of seats
let bookedSeats = 0;

// Initialize seats
function initSeats() {
    for (let i = 0; i < totalSeats; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.innerHTML = `<span class="seat-number">${i + 1}</span><img src="css/chair.jpeg" alt="Chair">`; // Update the path if needed
        seat.addEventListener('click', () => selectSeat(seat));

        // Add seats to left or right half based on index
        if (i < totalSeats / 2) {
            leftHalf.appendChild(seat); // First half to left
        } else {
            rightHalf.appendChild(seat); // Second half to right
        }
    }
    updateAvailableCount();
}

// Function to select seats based on user input
function selectSeat(seat) {
    if (!seat.classList.contains('booked')) {
        seat.classList.toggle('selected'); // Toggle selected state
    } else {
        showAlert("Sorry, this seat is already booked."); // Alert message for already booked seat
    }
}

// Book selected seats
function bookSeats() {
    const requestedSeats = parseInt(seatCountInput.value);
    const selectedSeats = document.querySelectorAll('.seat.selected');

    if (isNaN(requestedSeats) || requestedSeats < 1) {
        showAlert("Please enter a valid number of seats.");
        return;
    }

    // Check if requested seats exceed available seats
    if (requestedSeats > (totalSeats - bookedSeats)) {
        showAlert("Not enough seats available!"); // Not enough seats available
        return;
    }

    // Check if selected seats match the requested number
    if (selectedSeats.length !== requestedSeats) {
        showAlert(`Please select exactly ${requestedSeats} seats.`);
        return;
    }

    // Book selected seats
    selectedSeats.forEach(seat => {
        bookSeat(seat);
    });

    // Clear selection after booking
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
}

// Book a single seat
function bookSeat(seat) {
    if (!seat.classList.contains('booked')) {
        seat.classList.add('booked');
        bookedSeats++;
        showAlert("Seat booked successfully!"); // Alert message
        updateAvailableCount();
    }
}

// Show alert message temporarily
function showAlert(msg) {
    message.textContent = msg; // Display the message
    setTimeout(() => {
        message.textContent = ""; // Clear the message after 3 seconds
    }, 3000);
}

// Update available seat count
function updateAvailableCount() {
    const availableSeats = totalSeats - bookedSeats;
    availableCount.textContent = availableSeats;
    if (availableSeats === 0) {
        message.textContent = "No available seats!";
    } else {
        message.textContent = ""; // Clear the message if seats are available
    }
}

// Event listener for the book button
bookButton.addEventListener('click', bookSeats);

// Initialize the seat map
initSeats();
