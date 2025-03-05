document.getElementById("confirmOrder").addEventListener("click", function(event) {
    event.preventDefault();

    // Получаем значения полей
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    // Проверяем, что все поля заполнены
    if (!name || !phone || !address) {
        showNotification("Заполните все поля", "bg-red-600"); // Уведомление об ошибке
        return;
    }

    // Если все поля заполнены, показываем уведомление об успешном заказе
    showNotification("Успешно", "bg-lime-600");

    // Переносим пользователя на главную через 2 секунды
    setTimeout(function() {
        window.location.href = "/"; // Переход на главную страницу
    }, 2000);
});

function showNotification(message, bgColor) {
    // Создаем элемент уведомления
    const notification = document.createElement("div");

    // Применяем нужные классы для внешнего вида
    notification.classList.add(
        "fixed",
        "top-6",
        "left-1/2",
        "transform",
        "-translate-x-1/2",
        bgColor,
        "text-white",
        "py-4",
        "px-8",
        "rounded-lg",
        "shadow-xl",
        "text-xl",
        "font-semibold",
        "z-50",
        "transition-opacity",
        "opacity-0",
        "duration-500"
    );
    notification.innerText = message;

    // Добавляем уведомление на страницу
    document.body.appendChild(notification);

    // Анимация появления уведомления
    setTimeout(() => {
        notification.classList.remove("opacity-0");
        notification.classList.add("opacity-100");
    }, 10);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove("opacity-100");
        notification.classList.add("opacity-0");
        setTimeout(() => notification.remove(), 500); // Убираем его через 500ms
    }, 3000);
}
