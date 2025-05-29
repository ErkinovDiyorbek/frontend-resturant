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
export default orderRoom
