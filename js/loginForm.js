document.addEventListener('DOMContentLoaded', () => {
	updateNavbarUI()

	const logoutBtn = document.getElementById('logoutBtn')
	if (logoutBtn) {
		logoutBtn.addEventListener('click', e => {
			e.preventDefault()
			logoutUser()
		})
	}

	initRegisterForm()
	initLoginForm()
})

// ⛳ Tokenni olish
function getAuthToken() {
	return localStorage.getItem('auth_token')
}

// 🔁 Navbarni yangilash
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

// 🚪 Logout qilish
function logoutUser() {
	localStorage.removeItem('auth_token')
	localStorage.removeItem('user_id')
	window.location.href = '../index.html'
}

// 🔐 Kuchli parol tekshiruvi
function validatePassword(password) {
	const minLength = 8
	const hasUpper = /[A-Z]/.test(password)
	const hasLower = /[a-z]/.test(password)
	const hasNumber = /\d/.test(password)
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password)

	if (password.length < minLength)
		return "Parol kamida 8 ta belgidan iborat bo'lishi kerak."
	if (!hasUpper) return "Parol katta harfni o'z ichiga olishi kerak."
	if (!hasLower) return "Parol kichik harfni o'z ichiga olishi kerak."
	if (!hasNumber) return "Parol raqamni o'z ichiga olishi kerak."
	if (!hasSpecial)
		return "Parol maxsus belgi (masalan, !@#$%, _, -) bo'lishi kerak."
	return ''
}

// 📝 Ro‘yxatdan o‘tish formasi
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

		const passwordError = validatePassword(parol)
		if (passwordError) {
			alert(passwordError)
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

// 🔑 Kirish formasi
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

		if (parol.length < 8) {
			alert('Parol kamida 8 ta belgidan iborat bo‘lishi kerak.')
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

				if (data.user.is_admin) {
					alert('Admin sifatida tizimga kirdingiz')
					window.location.href = '../admin/admin.html'
				} else {
					alert(data.message)
					window.location.href = '../html/profile.html'
				}
			} else {
				alert(data.error || 'Xatolik yuz berdi.')
			}
		} catch (error) {
			alert('Serverga ulanishda xatolik yuz berdi.')
		}
	})
}
