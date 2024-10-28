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

    // Create an object to send in the POST request
    const data = {
        name: name,
        email: email,
        message: message,
    };

    // Send the POST request to the server
    fetch("http://localhost:3000/send", { // Update to match your server's port
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Your message has been sent successfully!");
            // Clear the fields after sending
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
        } else {
            alert("An error occurred while sending your message. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while sending your message. Please try again.");
    });
});
