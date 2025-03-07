    function toggleCardStyle() {
        const cards = document.querySelectorAll(".dish-card");
        const images = document.querySelectorAll(".dish-image");
        const toggleButton = document.getElementById("toggle-button");
        const style1Text = document.getElementById("style1-text");
        const style2Text = document.getElementById("style2-text");

        document.body.classList.toggle("alternative-style");

        if (document.body.classList.contains("alternative-style")) {
            cards.forEach(card => card.classList.add("bg-gray-800", "border", "border-gray-700"));
            images.forEach(img => img.classList.add("rounded-full"));
            toggleButton.classList.add("translate-x-7");
            style1Text.classList.add("opacity-0");
            style2Text.classList.remove("opacity-0");
        } else {
            cards.forEach(card => card.classList.remove("bg-gray-800", "border", "border-gray-700"));
            images.forEach(img => img.classList.remove("rounded-full"));
            toggleButton.classList.remove("translate-x-7");
            style1Text.classList.remove("opacity-0");
            style2Text.classList.add("opacity-0");
        }
    }