document.addEventListener("DOMContentLoaded", () => {
  // Обработчики для модальных окон
  const registerButton = document.getElementById("registerButton")
  const closeRegister = document.getElementById("closeRegister")
  const closeLogin = document.getElementById("closeLogin")
  const openLogin = document.getElementById("openLogin")
  const openRegister = document.getElementById("openRegister")
  const registerModal = document.getElementById("registerModal")
  const loginModal = document.getElementById("loginModal")

  // Открытие модального окна регистрации
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      registerModal.classList.remove("hidden", "scale-0")
    })
  }

  // Закрытие модального окна регистрации
  if (closeRegister) {
    closeRegister.addEventListener("click", () => {
      registerModal.classList.add("hidden", "scale-0")
    })
  }

  // Закрытие модального окна входа
  if (closeLogin) {
    closeLogin.addEventListener("click", () => {
      loginModal.classList.add("hidden", "scale-0")
    })
  }

  // Переход от регистрации к входу
  if (openLogin) {
    openLogin.addEventListener("click", () => {
      registerModal.classList.add("hidden", "scale-0")
      loginModal.classList.remove("hidden", "scale-0")
    })
  }

  // Переход от входа к регистрации
  if (openRegister) {
    openRegister.addEventListener("click", () => {
      loginModal.classList.add("hidden", "scale-0")
      registerModal.classList.remove("hidden", "scale-0")
    })
  }

  // Обработка телефонного номера
  const phoneContainer = document.getElementById("phoneContainer")
  const phonePlaceholder = document.getElementById("phonePlaceholder")
  const phoneInput = document.getElementById("phoneInput")

  if (phonePlaceholder && phoneInput) {
    phonePlaceholder.addEventListener("click", () => {
      phonePlaceholder.classList.add("hidden")
      phoneInput.classList.remove("hidden")
      phoneInput.focus()
      phoneInput.value = "+380 "
    })

    phoneInput.addEventListener("input", () => {
      let numbers = phoneInput.value.replace(/\D/g, "")
      if (numbers.startsWith("380")) {
        numbers = numbers.slice(3)
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
        event.preventDefault()
      }
    })

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value === "+380 " || phoneInput.value === "") {
        phoneInput.classList.add("hidden")
        phonePlaceholder.classList.remove("hidden")
      }
    })
  }

  // Обработка отправки формы регистрации через AJAX
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault() // Предотвращаем стандартную отправку формы

      // Собираем данные формы
      const formData = new FormData(this)
      const userData = {
        username: formData.get("username"),
        phone: formData.get("phone"),
        password: formData.get("password"),
      }

      // Отправляем данные на сервер через fetch API
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Если успешно, обновляем UI для авторизованного пользователя
            updateAuthUI(true)

            // Закрываем модальное окно регистрации
            registerModal.classList.add("hidden", "scale-0")

            // Показываем сообщение об успешной регистрации и автоматическом входе
            alert("Регистрация успешна! Вы автоматически вошли в систему.")

            // Перенаправляем на главную страницу
            window.location.href = data.redirect
          } else {
            // Если ошибка, показываем сообщение
            alert(data.message || "Ошибка при регистрации")
          }
        })
        .catch((error) => {
          console.error("Ошибка:", error)
          alert("Произошла ошибка при отправке формы")
        })
    })
  }

  // Обработка отправки формы входа через AJAX
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const userData = {
        username: formData.get("username"),
        password: formData.get("password"),
      }

      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Обновляем UI после успешного входа
            updateAuthUI(true)

            // Закрываем модальное окно
            loginModal.classList.add("hidden", "scale-0")

            // Показываем сообщение об успешном входе
            alert("Вход выполнен успешно!")

            // Перенаправляем на главную страницу
            window.location.href = data.redirect
          } else {
            alert(data.message || "Ошибка при входе")
          }
        })
        .catch((error) => {
          console.error("Ошибка:", error)
          alert("Произошла ошибка при отправке формы")
        })
    })
  }

  // Проверяем статус авторизации при загрузке страницы
  const authElement = document.querySelector("nav ul li:first-child a")
  if (authElement && authElement.textContent.trim().includes("LOG OUT")) {
    // Если есть, значит пользователь авторизован
    updateAuthUI(true)
  } else {
    updateAuthUI(false)
  }
})

// Обновленная функция для обновления интерфейса после входа/выхода
function updateAuthUI(isLoggedIn) {
  const authElement = document.querySelector("nav ul li:first-child a")
  if (!authElement) return

  if (isLoggedIn) {
    authElement.innerHTML = `
      <span class="material-icons text-yellow-500">logout</span>
      LOG OUT
    `
    authElement.href = "/logout"
    authElement.id = "" // Удаляем id, чтобы не срабатывал обработчик registerButton

    // Удаляем обработчик события, если он был
    authElement.removeEventListener("click", showRegisterModal)
  } else {
    authElement.innerHTML = `
      <span class="material-icons text-yellow-500">login</span>
      SIGN UP
    `
    authElement.id = "registerButton"
    authElement.href = "#"

    // Добавляем обработчик для кнопки регистрации
    authElement.addEventListener("click", showRegisterModal)
  }
}

// Функция для показа модального окна регистрации
function showRegisterModal() {
  const registerModal = document.getElementById("registerModal")
  if (registerModal) {
    registerModal.classList.remove("hidden", "scale-0")
  }
}

