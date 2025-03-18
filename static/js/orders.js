document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const ordersButton = document.getElementById("ordersButton")
  const modal = document.getElementById("ordersModal")
  const closeBtn = document.getElementById("closeOrders")
  const ordersContainer = document.querySelector("#ordersModal .mt-6")

  console.log("Скрипт заказов загружен")

  // Pagination state
  let currentPage = 0
  const itemsPerPage = 3 // Показываем меньше заказов на странице, так как они больше
  let orders = []
  let totalPages = 0

  // Modal Controls
  if (ordersButton) {
    ordersButton.addEventListener("click", (event) => {
      event.preventDefault()
      console.log("Кнопка заказов нажата")

      // Проверяем, авторизован ли пользователь
      fetch("/api/check-auth")
        .then((response) => response.json())
        .then((data) => {
          if (data.authenticated) {
            // Пользователь авторизован, получаем и отображаем заказы
            fetchOrders()
            if (modal) {
              modal.classList.remove("hidden", "scale-0")
              console.log("Модальное окно заказов открыто")
            }
          } else {
            // Пользователь не авторизован, показываем уведомление
            showNotification("Для просмотра заказов необходимо зарегистрироваться или войти в аккаунт", "bg-red-600")

            // Открываем модальное окно регистрации
            const registerModal = document.getElementById("registerModal")
            if (registerModal) {
              registerModal.classList.remove("hidden", "scale-0")
            }
          }
        })
        .catch((error) => {
          console.error("Ошибка при проверке авторизации:", error)
          showNotification("Произошла ошибка при проверке авторизации", "bg-red-600")
        })
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      console.log("Кнопка закрытия нажата")
      if (modal) {
        modal.classList.add("scale-0")
        setTimeout(() => {
          modal.classList.add("hidden")
        }, 200)
      }
    })
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.add("scale-0")
        setTimeout(() => {
          modal.classList.add("hidden")
        }, 200)
      }
    })
  }

  // Получаем заказы с сервера
  function fetchOrders() {
    // Показываем индикатор загрузки
    ordersContainer.innerHTML = `
      <div class="flex justify-center items-center h-[200px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
      </div>
    `

    fetch("/api/get-orders")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          orders = data.orders
          currentPage = 0 // Сбрасываем на первую страницу при получении новых заказов
          displayOrders()
        } else {
          showNotification(data.message || "Ошибка при получении заказов", "bg-red-600")
          ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">Не удалось загрузить заказы.</p>'
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении заказов:", error)
        showNotification("Произошла ошибка при получении заказов", "bg-red-600")
        ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">Не удалось загрузить заказы.</p>'
      })
  }

  // Отображаем заказы с пагинацией
  function displayOrders() {
    if (!ordersContainer) return

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">У вас пока нет заказов.</p>'
      return
    }

    // Пагинация
    totalPages = Math.ceil(orders.length / itemsPerPage)
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    const displayedOrders = orders.slice(start, end)

    let ordersHTML = ""

    displayedOrders.forEach((order) => {
      // Форматируем дату
      const orderDate = new Date(order.created_at)
      const formattedDate = orderDate.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Создаем карточку заказа
      ordersHTML += `
        <div class="order-item border-b border-gray-600 pb-4 mb-4">
          <div class="flex justify-between items-center mb-2">
            <p class="text-lg font-semibold">Заказ #${order.id}</p>
            <span class="text-gray-400">${formattedDate}</span>
          </div>
          <div class="mb-2">
            <p class="text-gray-400 mb-1">Состав заказа:</p>
            <div class="pl-4 border-l-2 border-lime-600">
              ${formatOrderItems(order.items_list)}
            </div>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-gray-300">Статус: <span class="${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
            <p class="font-semibold">${order.total_amount} грн</p>
          </div>
        </div>
      `
    })

    // Добавляем пагинацию, если есть больше одной страницы
    if (totalPages > 1) {
      ordersHTML += `
        <div class="flex justify-center items-center gap-4 mt-4">
          <button id="prevOrderPage" class="px-3 py-1 bg-gray-700 rounded-lg ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}">←</button>
          <span id="orderPageInfo">${currentPage + 1} / ${totalPages}</span>
          <button id="nextOrderPage" class="px-3 py-1 bg-gray-700 rounded-lg ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}">→</button>
        </div>
      `
    }

    ordersContainer.innerHTML = ordersHTML

    // Добавляем обработчики для кнопок пагинации
    if (totalPages > 1) {
      const prevPageBtn = document.getElementById("prevOrderPage")
      const nextPageBtn = document.getElementById("nextOrderPage")

      if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--
            displayOrders()
          }
        })
      }

      if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
          if (currentPage < totalPages - 1) {
            currentPage++
            displayOrders()
          }
        })
      }
    }
  }

  // Вспомогательная функция для форматирования списка товаров
  function formatOrderItems(itemsList) {
    // Разделяем список товаров по запятым и создаем элементы списка
    return itemsList
      .split(", ")
      .map((item) => `<div class="py-1">${item}</div>`)
      .join("")
  }

  // Вспомогательная функция для получения текста статуса
  function getStatusText(status) {
    switch (status) {
      case "pending":
        return "В обработке"
      case "confirmed":
        return "Подтвержден"
      case "delivered":
        return "Доставлен"
      case "cancelled":
        return "Отменен"
      default:
        return "Неизвестно"
    }
  }

  // Вспомогательная функция для получения класса статуса
  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "confirmed":
        return "text-blue-500"
      case "delivered":
        return "text-lime-500"
      case "cancelled":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  // Функция для отображения уведомлений (используем ту же, что и в basket.js)
  function showNotification(message, bgColor) {
    console.log("Показываем уведомление:", message)

    const notification = document.createElement("div")

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
      "duration-500",
    )
    notification.innerText = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.remove("opacity-0")
      notification.classList.add("opacity-100")
    }, 10)

    setTimeout(() => {
      notification.classList.remove("opacity-100")
      notification.classList.add("opacity-0")
      setTimeout(() => {
        notification.remove()
      }, 500)
    }, 3000)
  }
})