document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput")
  const searchResults = document.getElementById("searchResults")

  // Предотвращаем отправку формы при нажатии Enter
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      return false
    }
  })

  // Автоматически делаем первую букву заглавной
  searchInput.addEventListener("input", function () {
    const value = this.value
    if (value.length > 0) {
      this.value = value.charAt(0).toUpperCase() + value.slice(1)
    }

    // Продолжаем с поиском
    const query = this.value.trim()

    if (query.length < 1) {
      searchResults.innerHTML = ""
      searchResults.classList.add("hidden")
      return
    }

    // Запрос к API для получения результатов поиска
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        // Очищаем предыдущие результаты
        searchResults.innerHTML = ""

        // Если нет результатов
        if (!data.dishes.length && !data.drinks.length && !data.desserts.length) {
          searchResults.innerHTML = '<div class="p-4 text-center text-gray-400">Ничего не найдено</div>'
          searchResults.classList.remove("hidden")
          return
        }

        // Ограничиваем количество результатов до 5
        let count = 0
        const maxResults = 5

        // Добавляем блюда
        data.dishes.forEach((item) => {
          if (count < maxResults) {
            addSearchResultItem(item, "dish")
            count++
          }
        })

        // Добавляем напитки
        data.drinks.forEach((item) => {
          if (count < maxResults) {
            addSearchResultItem(item, "drink")
            count++
          }
        })

        // Добавляем десерты
        data.desserts.forEach((item) => {
          if (count < maxResults) {
            addSearchResultItem(item, "dessert")
            count++
          }
        })

        // Показываем результаты
        searchResults.classList.remove("hidden")
      })
      .catch((error) => {
        console.error("Ошибка при поиске:", error)
      })
  })

  // Функция для добавления элемента результата поиска
  function addSearchResultItem(item, type) {
    const itemElement = document.createElement("a")
    let detailUrl = ""

    if (type === "dish") {
      detailUrl = `/menu/dish/${item.id}/`
    } else if (type === "drink") {
      detailUrl = `/menu/drink/${item.id}/`
    } else if (type === "dessert") {
      detailUrl = `/menu/dessert/${item.id}/`
    }

    itemElement.href = detailUrl
    itemElement.className =
      "flex items-center p-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"

    itemElement.innerHTML = `
            <div class="w-16 h-16 flex-shrink-0">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded">
            </div>
            <div class="ml-3 flex-grow">
                <div class="font-medium">${item.name}</div>
                <div class="text-sm text-gray-400">${type === "dish" ? "Блюдо" : type === "drink" ? "Напиток" : "Десерт"}</div>
            </div>
            <div class="text-red-400 font-bold">${item.price} грн</div>
        `

    searchResults.appendChild(itemElement)
  }

  // Закрываем результаты поиска при клике вне поля
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add("hidden")
    }
  })

  // Показываем результаты снова при фокусе на поле, если есть текст
  searchInput.addEventListener("focus", function () {
    if (this.value.trim().length > 0 && searchResults.children.length > 0) {
      searchResults.classList.remove("hidden")
    }
  })
})

