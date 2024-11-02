const leftHalf = document.querySelector('.left-half');
const rightHalf = document.querySelector('.right-half');
const availableCount = document.getElementById('availableCount');
const successMessage = document.getElementById('successMessage');
const seatCountInput = document.getElementById('seatCount');
const bookButton = document.getElementById('bookButton');
const notAvailableMessage = document.getElementById('notAvailableMessage');

let bookedSeats = 0;

async function initSeats() {
    const bookedSeatsFromStorage = JSON.parse(localStorage.getItem('bookedSeats')) || [];
    bookedSeats = bookedSeatsFromStorage.length;

    for (let i = 0; i < totalSeats; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.dataset.seatNumber = i + 1;
        seat.innerHTML = `<span class="seat-number">${i + 1}</span><img src="/css/chair.jpeg" alt="Chair" style="width: 30px;">`;
        seat.addEventListener('click', () => selectSeat(seat));

        if (bookedSeatsFromStorage.includes(i + 1)) {
            seat.classList.add('booked');
        }

        if (i < totalSeats / 2) {
            leftHalf.appendChild(seat);
        } else {
            rightHalf.appendChild(seat);
        }
    }

    updateAvailableCount();
}

function selectSeat(seat) {
    if (seat.classList.contains('booked')) {
        return;
    }
    seat.classList.toggle('selected');
    updateAvailableCount();
}

function updateAvailableCount() {
    const availableSeats = totalSeats - bookedSeats;
    const selectedSeats = document.querySelectorAll('.seat.selected').length;
    availableCount.textContent = availableSeats - selectedSeats;
}

function showAlert(message) {
    alert(message);
}

bookButton.addEventListener('click', bookSeats);
function bookSeats() {
    const requestedSeats = parseInt(seatCountInput.value);
    const selectedSeats = document.querySelectorAll('.seat.selected');

    if (isNaN(requestedSeats) || requestedSeats < 1) {
        showAlert("Please enter a valid number of seats.");
        return;
    }

    if (requestedSeats > (totalSeats - bookedSeats)) {
        notAvailableMessage.textContent = "Not available";
        notAvailableMessage.style.display = 'block';
        setTimeout(() => {
            notAvailableMessage.style.display = 'none';
        }, 3000);
        return;
    }

    if (selectedSeats.length !== requestedSeats) {
        showAlert(`Please select exactly ${requestedSeats} seats.`);
        return;
    }

    selectedSeats.forEach(seat => {
        bookSeat(seat);
    });

    selectedSeats.forEach(seat => {
        seat.classList.remove('selected');
    });

    const availableSeatsAfterBooking = totalSeats - bookedSeats;
    successMessage.textContent = `Successfully booked ${requestedSeats} seat(s)! Available Seats: ${availableSeatsAfterBooking}`;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);

    updateAvailableCount();
}

function bookSeat(seat) {
    const seatNumber = parseInt(seat.dataset.seatNumber);
    bookedSeats += 1;
    seat.classList.add('booked');
    const currentBookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || [];
    localStorage.setItem('bookedSeats', JSON.stringify([...currentBookedSeats, seatNumber]));
}

document.addEventListener('DOMContentLoaded', initSeats);
