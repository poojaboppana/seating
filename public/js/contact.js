document.getElementById("send-button").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Basic validation (ensure fields are not empty)
    if (name === "" || email === "" || message === "") {
        alert("Please fill in all fields.");
        return;
    }
  
    
    // Prepare WhatsApp message
    const phoneNumber = "7207547829"; // Replace with the owner's WhatsApp phone number
    const encodedMessage = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nMessage: ${message}`);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp link
    window.open(whatsappLink, '_blank');

    // Clear the fields after sending
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
});
