document.addEventListener('DOMContentLoaded', () => {
	const cartItems = JSON.parse(localStorage.getItem('cart')) || []

	const cartIcon = document.querySelector('.cart-icon')
	const cartItemCount = document.querySelector('.cart-icon span')
	const sidebar = document.getElementById('sidebar')
	const cartItemsList = document.querySelector('.cart-items')
	const cartTotal = document.querySelector('.cart-total')
	const closeButton = document.querySelector('.sidebar-close')
	const checkoutBtn = document.getElementById('checkoutBtn')

	const openModalBtn = document.getElementById('openModalBtn')
	const closeModalBtn = document.getElementById('modalClose')
	const orderForm = document.getElementById('orderForm')
	const orderModal = document.getElementById('orderModal')

	// USER_ID ni LOCALSTORAGEdan olish
	const user_id = localStorage.getItem('user_id')

	// Mahsulot qo‘shish
	document.querySelectorAll('.add-to-cart').forEach(button => {
		button.addEventListener('click', () => {
			const card = button.closest('.card')
			const itemName = card.querySelector('.card-title').textContent.trim()
			const itemPrice = parseInt(
				card.querySelector('.price').textContent.replace(/\D/g, '')
			)

			const existing = cartItems.find(i => i.name === itemName)
			if (existing) {
				existing.quantity++
			} else {
				cartItems.push({ name: itemName, price: itemPrice, quantity: 1 })
			}

			localStorage.setItem('cart', JSON.stringify(cartItems))
			updateCartUI()
		})
	})

	function lockScroll() {
		document.body.classList.add('no-scroll')
	}

	function unlockScroll() {
		document.body.classList.remove('no-scroll')
	}

	function updateCartUI() {
		if (cartItemCount) {
			cartItemCount.textContent = cartItems.reduce(
				(sum, item) => sum + item.quantity,
				0
			)
		}

		if (cartItemsList) {
			if (cartItems.length === 0) {
				cartItemsList.innerHTML = `<div>Savatchingiz bo‘sh</div>`
			} else {
				cartItemsList.innerHTML = cartItems
					.map(
						item => `
					<div class="cart-item">
						<span>(${item.quantity}x) ${item.name}</span>
						<span class="cart-item-price">
							${(item.quantity * item.price).toLocaleString()} so‘m
							<button class="remove-item" data-name="${item.name}">
								<i class="fa-solid fa-times"></i>
							</button>
						</span>
					</div>
				`
					)
					.join('')
			}
		}

		if (cartTotal) {
			const total = cartItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			)
			cartTotal.textContent = `${total.toLocaleString()} so‘m`
		}
	}

	// Mahsulot o‘chirish
	cartItemsList?.addEventListener('click', e => {
		if (e.target.closest('.remove-item')) {
			const name = e.target.closest('.remove-item').dataset.name
			const idx = cartItems.findIndex(item => item.name === name)
			if (idx !== -1) {
				cartItems.splice(idx, 1)
				localStorage.setItem('cart', JSON.stringify(cartItems))
				updateCartUI()
			}
		}
	})

	// Sidebar ochish / yopish
	cartIcon?.addEventListener('click', () => {
		sidebar?.classList.toggle('open')
		sidebar.classList.contains('open') ? lockScroll() : unlockScroll()
	})

	closeButton?.addEventListener('click', () => {
		sidebar?.classList.remove('open')
		unlockScroll()
	})

	// Modal ochish
	checkoutBtn?.addEventListener('click', () => {
		if (cartItems.length === 0) {
			alert('Savatcha bo‘sh.')
			return
		}
		orderModal.style.display = 'flex'
	})

	openModalBtn?.addEventListener('click', () => {
		orderModal.style.display = 'flex'
	})

	closeModalBtn?.addEventListener('click', () => {
		orderModal.style.display = 'none'
	})

	window.addEventListener('click', e => {
		if (e.target.id === 'orderModal') {
			orderModal.style.display = 'none'
		}
	})

	// Buyurtma yuborish
	orderForm?.addEventListener('submit', async e => {
		e.preventDefault()

		const name = orderForm.querySelector('#name').value.trim()
		const phone = orderForm.querySelector('#phone').value.trim()
		const address = orderForm.querySelector('#address').value.trim()
		const note = orderForm.querySelector('#note').value.trim()

		const nameRegex = /^[A-Za-zА-Яа-яЁё\s'-]+$/
		const phoneRegex = /^\+998\d{9}$/

		if (!name || !phone || !address) {
			alert('Barcha maydonlar to‘ldirilishi kerak.')
			return
		}
		if (!nameRegex.test(name)) {
			alert('Ism faqat harflardan iborat bo‘lishi kerak.')
			return
		}
		if (!phoneRegex.test(phone)) {
			alert('Telefon raqam formati noto‘g‘ri. Masalan: +998901234567')
			return
		}
		if (!user_id) {
			alert('Tizimga kirganingizga ishonch hosil qiling.')
			return
		}

		const total = cartItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		)

		const order = {
			name,
			phone,
			address,
			note,
			items: cartItems,
			total_amount: total,
			user_id,
		}

		try {
			const res = await fetch('http://localhost:3000/submit-order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(order),
			})

			if (res.ok) {
				alert('Buyurtma muvaffaqiyatli yuborildi.')
				localStorage.removeItem('cart')
				orderForm.reset()
				orderModal.style.display = 'none'
				window.location.href = '/orders'
			} else {
				const errText = await res.text()
				alert('Xatolik: ' + errText)
			}
		} catch (err) {
			console.error('Xatolik:', err)
			alert('Serverga ulanib bo‘lmadi.')
		}
	})

	updateCartUI()
})
