document.addEventListener("DOMContentLoaded", () => {
  const cashPayment = document.getElementById("cashPayment")
  const cardPayment = document.getElementById("cardPayment")

  if (cashPayment && cardPayment) {
    // Убедимся, что при загрузке страницы выбран правильный метод
    if (cashPayment.checked) {
      document.querySelector('label[for="cashPayment"]').classList.add("border-yellow-400")
    } else if (cardPayment.checked) {
      document.querySelector('label[for="cardPayment"]').classList.add("border-yellow-400")
    }

    // Добавляем анимацию при выборе
    cashPayment.addEventListener("change", () => {
      if (cashPayment.checked) {
        document.querySelector('label[for="cashPayment"]').classList.add("border-yellow-400")
        document.querySelector('label[for="cardPayment"]').classList.remove("border-yellow-400")
      }
    })

    cardPayment.addEventListener("change", () => {
      if (cardPayment.checked) {
        document.querySelector('label[for="cardPayment"]').classList.add("border-yellow-400")
        document.querySelector('label[for="cashPayment"]').classList.remove("border-yellow-400")
      }
    })
  }
  // DOM Elements
  const basketButton = document.getElementById("basketButton")
  const modal = document.getElementById("basketModal")
  const closeBtn = document.getElementById("closeBasket")
  const cartContent = document.getElementById("cartContent")
  const orderContent = document.getElementById("orderContent")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")
  const orderTotal = document.getElementById("orderTotal")
  const clearCartButton = document.getElementById("clearCart")
  const proceedToOrderButton = document.getElementById("proceedToOrder")
  const backToCartButton = document.getElementById("backToCart")
  const orderForm = document.getElementById("orderForm")
  const cartTab = document.querySelector(".cart-tab")
  const orderTab = document.querySelector(".order-tab")
  const pagination = document.getElementById("cartPagination")
  const prevPageBtn = document.getElementById("prevPage")
  const nextPageBtn = document.getElementById("nextPage")
  const pageInfo = document.getElementById("pageInfo")

  console.log("Скрипт корзины загружен")

  // Pagination state
  let currentPage = 0
  const itemsPerPage = 4

  // Modal Controls
  if (basketButton) {
    basketButton.addEventListener("click", (event) => {
      event.preventDefault()
      console.log("Кнопка корзины нажата")
      updateCartDisplay()
      if (modal) {
        modal.classList.remove("hidden", "scale-0")
        modal.classList.add("flex", "scale-100")
        console.log("Модальное окно открыто")
      }
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

  // Tab Controls
  if (cartTab) {
    cartTab.addEventListener("click", () => {
      switchTab("cart")
    })
  }

  if (orderTab) {
    orderTab.addEventListener("click", () => {
      switchTab("order")
    })
  }

  if (proceedToOrderButton) {
    proceedToOrderButton.addEventListener("click", () => {
      switchTab("order")
    })
  }

  if (backToCartButton) {
    backToCartButton.addEventListener("click", () => {
      switchTab("cart")
    })
  }

  function switchTab(tab) {
    if (tab === "cart") {
      cartTab.classList.add("active")
      orderTab.classList.remove("active")
      cartContent.classList.add("active")
      cartContent.classList.remove("hidden")
      orderContent.classList.add("hidden")
      orderContent.classList.remove("active")
    } else {
      cartTab.classList.remove("active")
      orderTab.classList.add("active")
      cartContent.classList.remove("active")
      cartContent.classList.add("hidden")
      orderContent.classList.remove("hidden")
      orderContent.classList.add("active")
      updateOrderSummary()
    }
  }

  // Cart Functions
  function getCart() {
    try {
      const cartData = localStorage.getItem("cart")
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error("Ошибка при получении корзины:", error)
      return []
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem("cart", JSON.stringify(cart))
    } catch (error) {
      console.error("Ошибка при сохранении корзины:", error)
      showNotification("Ошибка при сохранении корзины", "bg-red-600")
    }
  }

  function updateCartDisplay() {
    if (!cartItems) return

    const cart = getCart()
    console.log("Текущая корзина:", cart)

    if (!cart || cart.length === 0) {
      cartItems.innerHTML = '<p class="text-gray-300 text-lg">Ваша корзина пуста.</p>'
      if (pagination) pagination.classList.add("hidden")
      updateTotals(0)
      return
    }

    // Pagination
    const totalPages = Math.ceil(cart.length / itemsPerPage)
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    const displayedItems = cart.slice(start, end)

    let cartHTML = '<div class="space-y-4">'

    displayedItems.forEach((item, index) => {
      const actualIndex = start + index
      const itemTotal = item.price * item.quantity

      cartHTML += `
                <div class="flex items-center justify-between border-b border-gray-700 pb-4">
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4">
                        <div>
                            <h3 class="font-semibold">${item.name}</h3>
                            <p class="text-gray-400">${item.price} грн × ${item.quantity}</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div class="flex items-center mr-4 bg-gray-700 rounded-lg">
                            <button class="decrease-quantity px-2 py-1 hover:bg-gray-600 rounded-l-lg" data-index="${actualIndex}">−</button>
                            <span class="px-3 py-1">${item.quantity}</span>
                            <button class="increase-quantity px-2 py-1 hover:bg-gray-600 rounded-r-lg" data-index="${actualIndex}">+</button>
                        </div>
                        <span class="text-lg font-semibold mr-4">${itemTotal} грн</span>
                        <button class="remove-item text-red-500 hover:text-red-400" data-index="${actualIndex}">✕</button>
                    </div>
                </div>
            `
    })

    cartHTML += "</div>"

    cartItems.innerHTML = cartHTML

    // Update pagination
    if (pagination) {
      if (totalPages > 1) {
        pagination.classList.remove("hidden")
        if (pageInfo) pageInfo.textContent = `${currentPage + 1} / ${totalPages}`
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 0
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages - 1
      } else {
        pagination.classList.add("hidden")
      }
    }

    updateTotals(calculateTotal(cart))
    attachCartEventHandlers()
  }

  function updateTotals(total) {
    if (cartTotal) cartTotal.textContent = `${total} грн`
    if (orderTotal) orderTotal.textContent = `${total} грн`
  }

  function calculateTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  function updateOrderSummary() {
    const summaryContainer = document.getElementById("orderSummary")
    if (!summaryContainer) return

    const cart = getCart()

    if (!cart || cart.length === 0) {
      summaryContainer.innerHTML = '<p class="text-gray-300">Корзина пуста</p>'
      return
    }

    let summaryHTML = ""
    cart.forEach((item) => {
      summaryHTML += `
                <div class="flex justify-between items-center py-2 border-b border-gray-700">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${item.price * item.quantity} грн</span>
                </div>
            `
    })

    summaryContainer.innerHTML = summaryHTML
  }

  function attachCartEventHandlers() {
    if (!cartItems) return

    // Обработчики для кнопок удаления
    const removeButtons = cartItems.querySelectorAll(".remove-item")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          removeFromCart(index)
        } catch (error) {
          console.error("Ошибка при удалении товара:", error)
          showNotification("Ошибка при удалении товара", "bg-red-600")
        }
      })
    })

    // Обработчики для кнопок изменения количества
    const increaseButtons = cartItems.querySelectorAll(".increase-quantity")
    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          updateQuantity(index, 1)
        } catch (error) {
          console.error("Ошибка при увеличении количества:", error)
          showNotification("Ошибка при изменении количества", "bg-red-600")
        }
      })
    })

    const decreaseButtons = cartItems.querySelectorAll(".decrease-quantity")
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          updateQuantity(index, -1)
        } catch (error) {
          console.error("Ошибка при уменьшении количества:", error)
          showNotification("Ошибка при изменении количества", "bg-red-600")
        }
      })
    })
  }

  // Pagination Controls
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 0) {
        currentPage--
        updateCartDisplay()
      }
    })
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      const cart = getCart()
      const totalPages = Math.ceil(cart.length / itemsPerPage)
      if (currentPage < totalPages - 1) {
        currentPage++
        updateCartDisplay()
      }
    })
  }

  // Cart Item Management
  function removeFromCart(index) {
    try {
      const cart = getCart()
      if (index >= 0 && index < cart.length) {
        cart.splice(index, 1)
        saveCart(cart)
        updateCartDisplay()
        showNotification("Товар удален из корзины", "bg-lime-600")
      }
    } catch (error) {
      console.error("Ошибка при удалении из корзины:", error)
      showNotification("Ошибка при удалении товара", "bg-red-600")
    }
  }

  function updateQuantity(index, change) {
    try {
      const cart = getCart()
      if (index >= 0 && index < cart.length) {
        cart[index].quantity += change
        if (cart[index].quantity < 1) {
          cart.splice(index, 1)
          showNotification("Товар удален из корзины", "bg-lime-600")
        } else {
          showNotification("Количество изменено", "bg-lime-600")
        }
        saveCart(cart)
        updateCartDisplay()
      }
    } catch (error) {
      console.error("Ошибка при изменении количества:", error)
      showNotification("Ошибка при изменении количества", "bg-red-600")
    }
  }

  // Clear Cart
  if (clearCartButton) {
    clearCartButton.addEventListener("click", (event) => {
      event.preventDefault()
      try {
        localStorage.removeItem("cart")
        updateCartDisplay()
        showNotification("Корзина очищена", "bg-lime-600")
      } catch (error) {
        console.error("Ошибка при очистке корзины:", error)
        showNotification("Ошибка при очистке корзины", "bg-red-600")
      }
    })
  }

  // Order Form Submission
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      try {
        const name = document.getElementById("orderName").value
        const phone = document.getElementById("orderPhone")
          ? document.getElementById("orderPhone").value
          : document.getElementById("phoneInputOrder").value
        const address = document.getElementById("orderAddress").value

        // Check if payment method is selected
        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked')
        if (!paymentMethodElement) {
          showNotification("Выберите способ оплаты", "bg-red-600")
          return
        }
        const paymentMethod = paymentMethodElement.value

        const cart = getCart()

        if (!name || !phone || !address) {
          showNotification("Заполните все поля", "bg-red-600")
          return
        }

        // Удаляем валидацию формата телефона, так как формат уже контролируется в input handler
        // и просто очищаем номер от форматирования для отправки в базу данных
        const cleanedPhone = phone.replace(/\D/g, "")

        if (!cart || cart.length === 0) {
          showNotification("Ваша корзина пуста", "bg-red-600")
          return
        }

        // Формируем список товаров для отображения
        const itemsList = cart.map((item) => `${item.name} (${item.quantity} шт.)`).join(", ")

        // Отправляем заказ на сервер
        const response = await fetch("/api/place-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone: cleanedPhone, // Отправляем очищенный номер телефона
            address,
            payment_method: paymentMethod,
            cart_items: cart,
            items_list: itemsList,
          }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.removeItem("cart")
          showNotification("Заказ успешно оформлен", "bg-lime-600")

          // Закрываем модальное окно через 2 секунды
          setTimeout(() => {
            modal.classList.add("scale-0")
            setTimeout(() => {
              modal.classList.add("hidden")
            }, 200)
          }, 2000)
        } else {
          showNotification(data.message || "Ошибка при оформлении заказа", "bg-red-600")
        }
      } catch (error) {
        console.error("Ошибка при оформлении заказа:", error)
        showNotification("Произошла ошибка при оформлении заказа", "bg-red-600")
      }
    })
  }

  // Add to cart functionality
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("bg-lime-600") && event.target.textContent.trim() === "Добавить в корзину") {
      event.preventDefault()
      console.log("Кнопка добавления в корзину нажата")

      try {
        const path = window.location.pathname
        let itemType = ""
        let itemId = 0
        let itemName = ""
        let itemPrice = 0
        let itemImage = ""

        // Получаем данные о товаре
        const nameElement = document.querySelector("h1")
        const priceElement = document.querySelector(".text-red-400")
        const imageElement = document.querySelector(".max-w-6xl img")

        if (nameElement && priceElement && imageElement) {
          itemName = nameElement.textContent || ""

          // Безопасное извлечение цены
          const priceText = priceElement.textContent || ""
          const priceMatch = priceText.match(/(\d+)/)
          if (priceMatch && priceMatch[1]) {
            itemPrice = Number.parseInt(priceMatch[1])
          }

          itemImage = imageElement.src

          // Определяем тип и ID товара из URL
          if (path.includes("/dish/")) {
            itemType = "dish"
          } else if (path.includes("/drink/")) {
            itemType = "drink"
          } else if (path.includes("/dessert/")) {
            itemType = "dessert"
          }

          // Безопасное извлечение ID
          const idMatch = path.match(/\/(\d+)\/?$/)
          if (idMatch && idMatch[1]) {
            itemId = Number.parseInt(idMatch[1])
          }

          console.log("Добавляем товар:", {
            type: itemType,
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
          })

          if (itemName && itemPrice > 0 && itemImage && itemType && itemId > 0) {
            const cart = getCart()

            // Проверяем, есть ли уже такой товар в корзине
            const existingItemIndex = cart.findIndex((item) => item.type === itemType && item.id === itemId)

            if (existingItemIndex !== -1) {
              // Если товар уже есть, увеличиваем количество
              cart[existingItemIndex].quantity += 1
              showNotification(`${itemName} (${cart[existingItemIndex].quantity} шт) в корзине`, "bg-lime-600")
            } else {
              // Если товара нет, добавляем новый
              cart.push({
                type: itemType,
                id: itemId,
                name: itemName,
                price: itemPrice,
                image: itemImage,
                quantity: 1,
              })
              showNotification(`${itemName} добавлен в корзину`, "bg-lime-600")
            }

            saveCart(cart)
          } else {
            console.error("Неверные данные товара:", {
              type: itemType,
              id: itemId,
              name: itemName,
              price: itemPrice,
              image: itemImage,
            })
            showNotification("Ошибка при добавлении товара: неверные данные", "bg-red-600")
          }
        } else {
          console.error("Не удалось найти элементы товара на странице")
          showNotification("Ошибка при добавлении товара", "bg-red-600")
        }
      } catch (error) {
        console.error("Ошибка при добавлении товара:", error)
        showNotification("Ошибка при добавлении товара", "bg-red-600")
      }
    }
  })

  // Notification function
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

document.addEventListener("DOMContentLoaded", () => {
  const phoneContainer = document.getElementById("phoneContainerOrder")
  const phonePlaceholder = document.getElementById("phonePlaceholderOrder")
  const phoneInput = document.getElementById("phoneInputOrder")

  if (phoneContainer && phonePlaceholder && phoneInput) {
    phonePlaceholder.addEventListener("click", () => {
      phonePlaceholder.classList.add("hidden")
      phoneInput.classList.remove("hidden")
      phoneInput.focus()
      phoneInput.value = "+380 " // Дефолтный префикс
    })

    phoneInput.addEventListener("input", () => {
      let numbers = phoneInput.value.replace(/\D/g, "") // Удаляем всё, кроме цифр
      if (numbers.startsWith("380")) {
        numbers = numbers.slice(3) // Убираем 380, так как оно уже есть
      } else if (!numbers.startsWith("380")) {
        numbers = numbers.slice(0) // Оставляем как есть
      }

      let formattedNumber = "+380 "

      if (numbers.length > 0) formattedNumber += `(${numbers.slice(0, 2)}`
      if (numbers.length >= 2) formattedNumber += `) ${numbers.slice(2, 5)}`
      if (numbers.length >= 5) formattedNumber += ` ${numbers.slice(5, 7)}`
      if (numbers.length >= 7) formattedNumber += ` ${numbers.slice(7, 9)}`

      phoneInput.value = formattedNumber.trim()
    })

    phoneInput.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && phoneInput.value.length <= 5) {
        event.preventDefault() // Блокируем удаление "+380 "
      }
    })

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value === "+380 " || phoneInput.value === "") {
        phoneInput.classList.add("hidden")
        phonePlaceholder.classList.remove("hidden")
      }
    })
  }
})