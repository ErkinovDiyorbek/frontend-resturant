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

export default orderRoom
