/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/modules/form.js":
/*!****************************!*\
  !*** ./js/modules/form.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function form() {
	const formContact = document.querySelector('.contact-form')
	if (!formContact) return

	const telegramTokenBot = '7297762905:AAHUFVoYAkRtyk9HMvQe1Boo25R4x-hDxgQ' // Tokeningizni to‘liq kiriting
	const chatId = '1384095888'

	const message = {
		loading: 'Yuborilmoqda...',
		success: 'Xabaringiz yuborildi!',
		failur: 'Xatolik yuz berdi!',
	}

	formContact.addEventListener('submit', event => {
		event.preventDefault()

		const statusMessage = document.createElement('div')
		statusMessage.textContent = message.loading
		formContact.append(statusMessage)

		const formData = new FormData(formContact)
		const object = {}
		formData.forEach((value, key) => {
			object[key] = value
		})

		const text = `
📥 Yangi xabar!
👤 Ismi: ${object.name}
📞 Telefon: ${object.phone}
✉️ Xabar: ${object.message}
		`

		fetch(`https://api.telegram.org/bot${telegramTokenBot}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: chatId, text }),
		})
			.then(res => {
				if (!res.ok) throw new Error('Telegram API error')
				statusMessage.textContent = message.success
			})
			.catch(() => {
				statusMessage.textContent = message.failur
			})
			.finally(() => {
				formContact.reset()
				setTimeout(() => statusMessage.remove(), 3000)
			})
	})
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (form);


/***/ }),

/***/ "./js/modules/headerMenu.js":
/*!**********************************!*\
  !*** ./js/modules/headerMenu.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function headerMenu() {
	const navLinks = document.querySelectorAll('.nav-menu .nav-link')
	const menuOpenButton = document.querySelector('#menu-open-button')
	const menuCloseButton = document.querySelector('#menu-close-button')
	const mobileMenu = document.body // 'show-mobile-menu' classi bodyga qo‘shiladi

	// Scrollni bloklash va ochish funksiyalari
	function lockScroll() {
		document.body.classList.add('no-scroll')
	}

	function unlockScroll() {
		document.body.classList.remove('no-scroll')
	}

	// Menyu ochish
	menuOpenButton.addEventListener('click', () => {
		mobileMenu.classList.toggle('show-mobile-menu')
		if (mobileMenu.classList.contains('show-mobile-menu')) {
			lockScroll() // sahifani qotir
		} else {
			unlockScroll() // sahifani och
		}
	})

	// Menyu yopish (close button bosilganda)
	menuCloseButton.addEventListener('click', () => {
		mobileMenu.classList.remove('show-mobile-menu')
		unlockScroll() // sahifani och
	})

	// Menyu tashqarisiga bosganda ham menyu yopilishi kerak
	document.addEventListener('click', event => {
		if (
			!event.target.closest('.nav-menu') &&
			!event.target.closest('#menu-open-button') &&
			mobileMenu.classList.contains('show-mobile-menu')
		) {
			mobileMenu.classList.remove('show-mobile-menu')
			unlockScroll() // sahifani och
		}
	})

	// Menyu havolalarini bosganda ham menyu yopilsin
	navLinks.forEach(link => {
		link.addEventListener('click', () => {
			mobileMenu.classList.remove('show-mobile-menu')
			unlockScroll() // sahifani och
		})
	})
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (headerMenu);


/***/ }),

/***/ "./js/modules/orderRoom.js":
/*!*********************************!*\
  !*** ./js/modules/orderRoom.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function orderRoom() {
	const form = document.getElementById('bookingForm')
	if (!form) return console.error('Forma topilmadi')

	const dateInput = document.getElementById('date')
	const timeInput = document.getElementById('time')

	const updateDateTimeLimits = () => {
		const now = new Date()
		const today = now.toISOString().split('T')[0]
		const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
			now.getMinutes()
		).padStart(2, '0')}`
		dateInput.min = today
		if (!dateInput.value) dateInput.value = today
		timeInput.min = dateInput.value === today ? currentTime : '09:00'
		timeInput.max = '22:00'
	}

	updateDateTimeLimits()
	dateInput.addEventListener('change', updateDateTimeLimits)

	function validateEmail(email) {
		const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
		return regex.test(email)
	}

	form.addEventListener('submit', async function (event) {
		event.preventDefault()

		const userId = localStorage.getItem('user_id')
		const token = localStorage.getItem('auth_token')
		if (!userId || !token) {
			alert('Buyurtma berish uchun tizimga kirgan bo‘lishingiz kerak.')
			return
		}

		const name = document.getElementById('name').value.trim()
		const phone = document.getElementById('phone').value.trim()
		const email = document.getElementById('email').value.trim()
		const date = dateInput.value
		const time = timeInput.value
		const room = parseInt(document.getElementById('room').value, 10)
		const guests = parseInt(document.getElementById('guests').value, 10)
		const special_request =
			document.getElementById('special_request').value?.trim() || ''

		const now = new Date()
		const selectedDateTime = new Date(`${date}T${time}`)

		if (!date || !time) {
			alert('Sana va vaqtni tanlang!')
			return
		}
		if (selectedDateTime <= now) {
			alert('O‘tgan vaqtga zakaz berib bo‘lmaydi.')
			return
		}
		if (!/^\+998\d{9}$/.test(phone)) {
			alert('Telefon raqam +998... formatida bo‘lishi kerak.')
			return
		}
		if (!validateEmail(email)) {
			alert('Email faqat @gmail.com bilan tugashi kerak.')
			return
		}
		if (guests > 20 || guests < 1) {
			alert('Mehmonlar soni 1 dan 20 gacha bo‘lishi kerak.')
			return
		}
		if (room > 14 || room < 1) {
			alert('Xonalar soni 1 dan 14 gacha bo‘lishi kerak.')
			return
		}

		try {
			const response = await fetch('http://localhost:3001/book-table', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name,
					phone,
					email,
					date,
					time,
					room,
					guests,
					special_request,
					user_id: Number(userId),
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || `Xatolik: ${response.status}`)
			}

			const contentType = response.headers.get('content-type')

			if (contentType && contentType.includes('text/html')) {
				// EJS dan render qilingan sahifa kelsa, to‘g‘ridan-to‘g‘ri sahifani almashtiramiz
				const html = await response.text()
				document.open()
				document.write(html)
				document.close()
			} else if (contentType && contentType.includes('application/json')) {
				const data = await response.json()
				alert(data.message || 'Buyurtma muvaffaqiyatli yuborildi!')
				form.reset()
				updateDateTimeLimits()
			} else {
				// Noaniq javob
				alert('Buyurtma yuborildi.')
			}
		} catch (err) {
			console.error('Buyurtma yuborishda xatolik:', err)
			alert('Xatolik yuz berdi, keyinroq urinib ko‘ring.')
		}
	})
}

document.addEventListener('DOMContentLoaded', orderRoom)
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (orderRoom);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./js/script.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_form_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/form.js */ "./js/modules/form.js");
/* harmony import */ var _modules_headerMenu_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/headerMenu.js */ "./js/modules/headerMenu.js");
/* harmony import */ var _modules_orderRoom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/orderRoom.js */ "./js/modules/orderRoom.js");




document.addEventListener('DOMContentLoaded', () => {
	(0,_modules_headerMenu_js__WEBPACK_IMPORTED_MODULE_1__["default"])()
	;(0,_modules_orderRoom_js__WEBPACK_IMPORTED_MODULE_2__["default"])()
	;(0,_modules_form_js__WEBPACK_IMPORTED_MODULE_0__["default"])()
})

})();

/******/ })()
;
//# sourceMappingURL=main.js.map