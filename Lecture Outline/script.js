 const buttons = document.querySelectorAll(".week-btn");
    const cards = document.querySelectorAll(".content-card");

    buttons.forEach(button => {
        button.addEventListener("click", () => {

            // Remove active from all buttons
            buttons.forEach(btn => btn.classList.remove("active"));

            // Hide all cards
            cards.forEach(card => card.classList.remove("active"));

            // Activate clicked button
            button.classList.add("active");

            // Show corresponding card
            const week = button.getAttribute("data-week");
            document.getElementById(week).classList.add("active");
        });
    });