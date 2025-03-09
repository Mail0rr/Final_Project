document.getElementById("registerButton").addEventListener("click", function () {
    document.getElementById("registerModal").classList.remove("hidden", "scale-0");
});

document.getElementById("closeRegister").addEventListener("click", function () {
    document.getElementById("registerModal").classList.add("hidden", "scale-0");
});

document.addEventListener("DOMContentLoaded", function () {
    const phoneContainer = document.getElementById("phoneContainer");
    const phonePlaceholder = document.getElementById("phonePlaceholder");
    const phoneInput = document.getElementById("phoneInput");

    phonePlaceholder.addEventListener("click", function () {
        phonePlaceholder.classList.add("hidden");
        phoneInput.classList.remove("hidden");
        phoneInput.focus();
        phoneInput.value = "+380 "; // Дефолтный префикс
    });

    phoneInput.addEventListener("input", function () {
        let numbers = phoneInput.value.replace(/\D/g, ""); // Удаляем всё, кроме цифр
        if (numbers.startsWith("380")) {
            numbers = numbers.slice(3); // Убираем 380, так как оно уже есть
        } else {
            numbers = "";
        }

        let formattedNumber = "+380 ";

        if (numbers.length > 0) formattedNumber += `(${numbers.slice(0, 2)}`;
        if (numbers.length >= 2) formattedNumber += `) ${numbers.slice(2, 5)}`;
        if (numbers.length >= 5) formattedNumber += ` ${numbers.slice(5, 7)}`;
        if (numbers.length >= 7) formattedNumber += ` ${numbers.slice(7, 9)}`;

        phoneInput.value = formattedNumber.trim();
    });

    phoneInput.addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && phoneInput.value.length <= 5) {
            event.preventDefault(); // Блокируем удаление "+380 "
        }
    });

    phoneInput.addEventListener("blur", function () {
        if (phoneInput.value === "+380 " || phoneInput.value === "") {
            phoneInput.classList.add("hidden");
            phonePlaceholder.classList.remove("hidden");
        }
    });
});
