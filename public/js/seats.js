const leftHalf = document.querySelector('.left-half');
const rightHalf = document.querySelector('.right-half');
const availableCount = document.getElementById('availableCount');
const successMessage = document.getElementById('successMessage');
const seatCountInput = document.getElementById('seatCount');
const bookButton = document.getElementById('bookButton');
const notAvailableMessage = document.getElementById('notAvailableMessage');

const totalSeats = 100; // Total number of seats
let bookedSeats = 0;

// Initialize seats
function initSeats() {
    for (let i = 0; i < totalSeats; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        
        // Assign seat number with HTML markup
        seat.innerHTML = `<span class="seat-number">${i + 1}</span><img src="/css/chair.jpeg" alt="Chair">`;
        
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

    // Display success message
    showSuccessMessage(`Successfully booked ${requestedSeats} seats! Available Seats: ${totalSeats - bookedSeats}`);
}

// Book a single seat
function bookSeat(seat) {
    if (!seat.classList.contains('booked')) {
        seat.classList.add('booked');
        bookedSeats++;
        updateAvailableCount();
    }
}

// Show a success message in the designated area
function showSuccessMessage(msg) {
    successMessage.textContent = msg;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none'; // Hide the message after 3 seconds
    }, 3000);
}

// Update available seat count
function updateAvailableCount() {
    const availableSeats = totalSeats - bookedSeats;
    availableCount.textContent = availableSeats;
}

// Show alert for user messages
function showAlert(message) {
    alert(message);
}

// Event listener for the book button
bookButton.addEventListener('click', bookSeats);

// Initialize the seat map
initSeats();
