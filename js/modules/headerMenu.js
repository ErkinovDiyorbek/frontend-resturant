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

export default headerMenu
