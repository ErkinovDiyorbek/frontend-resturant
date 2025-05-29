document.addEventListener('DOMContentLoaded', function () {
	const loader = document.getElementById('humoLoader')
	const progressBar = document.getElementById('progressBar')
	const loaderText = document.getElementById('loaderText')
	const loaderPercentage = document.getElementById('loaderPercentage')
	const mainContent = document.getElementById('mainContent')
	const teaLiquid = document.querySelector('.tea-liquid')

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

			// Progressni yangilash
			progressBar.style.width = `${progress}%`
			loaderPercentage.textContent = `${Math.round(progress)}%`

			// Choy suyuqligi darajasini yangilash
			teaLiquid.style.transform = `scaleY(${progress / 100})`

			// Xabarlarni almashtirish
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

			// Yakunlash
			if (progress >= 100) {
				clearInterval(interval)
				setTimeout(() => {
					loader.style.opacity = '0'
					setTimeout(() => {
						loader.style.display = 'none'
						mainContent.style.display = 'block'
					}, 500)
				}, 500)
			}
		}, 300)
	}

	// Yuklashni boshlash
	simulateLoading()

	// Agar haqiqiy yuklashni kuzatmoqchi bo'lsangiz:
	window.addEventListener('load', function () {
		// Agar sahifa tez yuklansa, animatsiya kamida 2 soniya davom etadi
		if (parseInt(loaderPercentage.textContent) < 70) {
			progressBar.style.width = '70%'
			loaderPercentage.textContent = '70%'
			teaLiquid.style.transform = 'scaleY(0.7)'
			loaderText.textContent = 'Dasturxon yozilmoqda...'
		}
	})
})
