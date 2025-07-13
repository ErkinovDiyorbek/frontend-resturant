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
	const form =
		document.getElementById('bookingForm') ||
		document.querySelector('.booking-form')
	if (!form) return console.error('Forma topilmadi')

	const dateInput = document.getElementById('date')
	const timeInput = document.getElementById('time')
	const submitBtn = form.querySelector('button[type="submit"]')

	// Sana va vaqt chegaralari funksiyasi...
	const getTodayDate = () => new Date().toISOString().split('T')[0]
	const getCurrentTime = () => {
		const now = new Date()
		return `${String(now.getHours()).padStart(2, '0')}:${String(
			now.getMinutes()
		).padStart(2, '0')}`
	}
	const updateDateTimeLimits = () => {
		const today = getTodayDate()
		const currentTime = getCurrentTime()
		dateInput.min = today
		if (!dateInput.value) dateInput.value = today

		if (dateInput.value === today) {
			timeInput.min = currentTime
			if (timeInput.value < currentTime) {
				timeInput.value = currentTime
			}
		} else {
			timeInput.min = '10:00'
		}
		timeInput.max = '22:00'
	}
	updateDateTimeLimits()
	dateInput.addEventListener('change', updateDateTimeLimits)
	setInterval(updateDateTimeLimits, 30000)

	// Email va telefon validatsiya
	const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	const validatePhone = phone => /^\+998\d{9}$/.test(phone)

	// 🎯 Avvalgi listenerni olib tashlaymiz
	form.removeEventListener('submit', form._submitHandler)

	// ✅ Yangi listener
	form._submitHandler = async function (event) {
		event.preventDefault()

		const userId = localStorage.getItem('user_id')
		const token = localStorage.getItem('auth_token')
		if (!userId || !token) {
			alert('Iltimos, tizimga kiring.')
			window.location.href = '/frontend-resturant/html/login.html'
			return
		}

		const name = form.name.value.trim()
		const phone = form.phone.value.trim()
		const email = form.email.value.trim()
		const date = dateInput.value
		const time = timeInput.value
		const room = parseInt(form.room.value, 10)
		const guests = parseInt(form.guests.value, 10)
		const special_request = form.special_request.value.trim() || ''

		const selectedDateTime = new Date(`${date}T${time}`)
		const now = new Date()

		if (!date || !time || selectedDateTime <= now) {
			alert('To‘g‘ri sana va vaqt tanlang.')
			return
		}
		const selectedHour = selectedDateTime.getHours()
		const selectedMinutes = selectedDateTime.getMinutes()
		if (
			selectedHour < 10 ||
			selectedHour > 22 ||
			(selectedHour === 22 && selectedMinutes > 0)
		) {
			alert('Buyurtma faqat 10:00–22:00 oralig‘ida qabul qilinadi.')
			return
		}
		if (!validatePhone(phone)) return alert('Telefon noto‘g‘ri.')
		if (!validateEmail(email)) return alert('Email noto‘g‘ri.')
		if (isNaN(guests) || guests < 1 || guests > 20)
			return alert('Mehmonlar soni noto‘g‘ri.')
		if (isNaN(room) || room < 1 || room > 14) return alert('Xona noto‘g‘ri.')

		submitBtn.disabled = true
		submitBtn.textContent = 'Yuborilmoqda...'

		try {
			const res = await fetch('http://localhost:3008/book-table', {
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

			if (!res.ok) throw new Error(await res.text())
			const contentType = res.headers.get('content-type')
			if (contentType?.includes('application/json')) {
				const data = await res.json()
				alert(data.message || 'Buyurtma yuborildi!')
			} else {
				alert('Buyurtma yuborildi.')
			}
			form.reset()
			updateDateTimeLimits()
		} catch (err) {
			alert(`Xatolik: ${err.message}`)
		} finally {
			submitBtn.disabled = false
			submitBtn.textContent = 'Buyurtma berish'
		}
	}

	form.addEventListener('submit', form._submitHandler)
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