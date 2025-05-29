document.addEventListener('DOMContentLoaded', () => {
	updateNavbarUI()

	// Profile sahifasida chiqish tugmasini aniqlab, funksiyasini beramiz
	const logoutBtn = document.getElementById('logoutBtn')
	if (logoutBtn) {
		logoutBtn.addEventListener('click', e => {
			e.preventDefault()
			logoutUser()
		})
	}

	// Quyidagi kodlar faqat login va register formalar uchun kerak,
	// agar sahifada bo'lsa, ularni ishlatamiz
	initRegisterForm()
	initLoginForm()
})

function getAuthToken() {
	return localStorage.getItem('auth_token')
}

function updateNavbarUI() {
	const token = getAuthToken()

	const loginLink = document.getElementById('login-link')
	const profileLink = document.getElementById('profile-link')

	if (token) {
		if (loginLink) loginLink.style.display = 'none'
		if (profileLink) profileLink.style.display = 'block'
	} else {
		if (loginLink) loginLink.style.display = 'block'
		if (profileLink) profileLink.style.display = 'none'
	}
}

function logoutUser() {
	localStorage.removeItem('auth_token')
	localStorage.removeItem('user_id')
	// Logout qilinganidan so'ng, asosiy sahifaga yo'naltirish
	window.location.href = 'index.html'
}

// Ro'yxatdan o'tish formasi uchun
function initRegisterForm() {
	const registerForm = document.getElementById('registerForm')
	if (!registerForm) return

	registerForm.addEventListener('submit', async e => {
		e.preventDefault()

		const login = document.getElementById('login').value.trim()
		const ism = document.getElementById('ism').value.trim()
		const email = document.getElementById('email').value.trim()
		const parol = document.getElementById('parol').value
		const confirmParol = document.getElementById('confirmParol').value

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			alert("Iltimos, to'g'ri email manzilini kiriting.")
			return
		}

		if (parol !== confirmParol) {
			alert('Parollar mos emas!')
			return
		}

		try {
			const response = await fetch('http://localhost:3003/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ login, ism, email, parol }),
			})

			const data = await response.json()

			if (response.ok) {
				alert(data.message)
				registerForm.reset()
				window.location.href = 'login.html'
			} else {
				alert(data.error || 'Xatolik yuz berdi.')
			}
		} catch (error) {
			alert('Serverga ulanishda xatolik yuz berdi.')
		}
	})
}

// Kirish formasi uchun
function initLoginForm() {
	const loginForm = document.getElementById('loginForm')
	if (!loginForm) return

	loginForm.addEventListener('submit', async e => {
		e.preventDefault()

		const loginOrEmail = document.getElementById('loginOrEmail').value.trim()
		const parol = document.getElementById('parol').value

		if (!loginOrEmail) {
			alert('Login yoki emailni kiriting!')
			return
		}

		try {
			const response = await fetch('http://localhost:3003/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ loginOrEmail, parol }),
			})

			const data = await response.json()

			if (response.ok) {
				localStorage.setItem('auth_token', data.token)
				localStorage.setItem('user_id', data.user.id)
				alert(data.message)
				window.location.href = 'profile.html'
			} else {
				alert(data.error || 'Xatolik yuz berdi.')
			}
		} catch (error) {
			alert('Serverga ulanishda xatolik yuz berdi.')
		}
	})
}
