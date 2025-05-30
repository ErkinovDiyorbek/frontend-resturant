document.addEventListener('DOMContentLoaded', function () {
	const loader = document.getElementById('humoLoader')
	const progressBar = document.getElementById('progressBar')
	const loaderText = document.getElementById('loaderText')
	const loaderPercentage = document.getElementById('loaderPercentage')
	const mainContent = document.getElementById('mainContent')
	const teaLiquid = document.querySelector('.tea-liquid')

	// Agar foydalanuvchi allaqachon kirgan bo‘lsa, loaderni o‘tkazib yuborish
	if (sessionStorage.getItem('loaderShown')) {
		loader.style.display = 'none'
		mainContent.style.display = 'block'
		return
	}

	// Yuklanishni simulatsiya qilish
	function simulateLoading() {
		let progress = 0
		const loadingMessages = [
			"Choy barglari yig'ilmoqda...",
			'Suv qaynatilmoqda...',
			'Choy damlanmoqda...',
			'Shirinliklar tayyorlanmoqda...',
			'Dasturxon yozilmoqda...',
		]

		const interval = setInterval(() => {
			progress += Math.random() * 10
			if (progress > 100) progress = 100

			progressBar.style.width = `${progress}%`
			loaderPercentage.textContent = `${Math.round(progress)}%`
			teaLiquid.style.transform = `scaleY(${progress / 100})`

			if (progress < 20) {
				loaderText.textContent = loadingMessages[0]
			} else if (progress < 40) {
				loaderText.textContent = loadingMessages[1]
			} else if (progress < 60) {
				loaderText.textContent = loadingMessages[2]
			} else if (progress < 80) {
				loaderText.textContent = loadingMessages[3]
			} else {
				loaderText.textContent = loadingMessages[4]
			}

			if (progress >= 100) {
				clearInterval(interval)
				setTimeout(() => {
					loader.style.opacity = '0'
					setTimeout(() => {
						loader.style.display = 'none'
						mainContent.style.display = 'block'
						sessionStorage.setItem('loaderShown', 'true') // ← Faqat bir marta ko‘rsatish uchun saqlab qo‘yamiz
					}, 500)
				}, 500)
			}
		}, 300)
	}

	simulateLoading()

	window.addEventListener('load', function () {
		if (parseInt(loaderPercentage.textContent) < 70) {
			progressBar.style.width = '70%'
			loaderPercentage.textContent = '70%'
			teaLiquid.style.transform = 'scaleY(0.7)'
			loaderText.textContent = 'Dasturxon yozilmoqda...'
		}
	})
})

// Scroll paydo bo‘lsa, tugmani ko‘rsatamiz
window.onscroll = function () {
	const btn = document.getElementById('scrollToTopBtn')
	if (
		document.body.scrollTop > 100 ||
		document.documentElement.scrollTop > 100
	) {
		btn.style.display = 'block'
	} else {
		btn.style.display = 'none'
	}
}

// Bosilganda sahifani tepaga chiqaradi
document.getElementById('scrollToTopBtn').onclick = function () {
	window.scrollTo({ top: 0, behavior: 'smooth' })
}
