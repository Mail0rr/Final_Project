document.addEventListener("DOMContentLoaded", function () {
    const basketButton = document.getElementById("basketButton");
    const modal = document.getElementById("basketModal");
    const closeBtn = document.getElementById("closeBasket");

    basketButton.addEventListener("click", function (event) {
        event.preventDefault();
        modal.classList.remove("hidden", "scale-0");
        modal.classList.add("flex", "scale-100");
    });

    closeBtn.addEventListener("click", function () {
        modal.classList.add("scale-0");
        setTimeout(() => modal.classList.add("hidden"), 200);
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.classList.add("scale-0");
            setTimeout(() => modal.classList.add("hidden"), 200);
        }
    });
});
