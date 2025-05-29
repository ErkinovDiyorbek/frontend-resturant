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

export default form
