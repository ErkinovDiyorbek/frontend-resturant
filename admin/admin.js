// ✅ Dashboard Content
document.addEventListener('DOMContentLoaded', () => {
	updateDashboardStats()
	loadTopProducts()
	// Qolgan yuklash funksiyalari o‘z joyida
})

async function updateDashboardStats() {
	try {
		const res = await fetch('http://localhost:3006/api/customer-orders', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
			},
		})
		if (!res.ok) throw new Error("Ma'lumot olinmadi")

		const orders = await res.json()
		const today = new Date().toISOString().slice(0, 10)

		let todayOrders = 0
		let weeklyOrders = 0
		let pendingOrders = 0
		let cancelledOrders = 0

		for (const order of orders) {
			const date = order.created_at?.slice(0, 10)
			if (date === today) todayOrders++

			const orderDate = new Date(date)
			const diff = (new Date() - orderDate) / (1000 * 60 * 60 * 24)
			if (diff <= 7) weeklyOrders++

			if (order.status === 'pending') pendingOrders++
			if (order.status === 'cancelled') cancelledOrders++
		}

		document.getElementById('todayOrders').textContent = todayOrders
		document.getElementById('weeklyOrders').textContent = weeklyOrders
		document.getElementById('pendingOrders').textContent = pendingOrders
		document.getElementById('cancelledOrders').textContent = cancelledOrders
	} catch (err) {
		console.error('📊 Statistikani olishda xatolik:', err)
	}
}

async function updateNavbarUI() {
	try {
		const res = await fetch('http://localhost:3008/api/profile', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
			},
		})

		if (!res.ok) throw new Error('Foydalanuvchi maʼlumotlari olinmadi')

		const user = await res.json()

		document.getElementById('userAvatar').src = user.avatar
			? `http://localhost:3008/uploads/xodimlar/${user.avatar}`
			: 'default-avatar.png'

		document.getElementById('userName').textContent = user.ism || user.login

		// Agar admin bo‘lsa, admin tugmalarni ko‘rsat
		if (user.is_admin) {
			const adminPanelBtn = document.getElementById('adminPanelBtn')
			if (adminPanelBtn) adminPanelBtn.style.display = 'block'
		}
	} catch (err) {
		console.warn('❌ Navbar yangilanmadi:', err.message)
	}
}

document.getElementById('logoutBtn2').addEventListener('click', () => {
	localStorage.removeItem('auth_token')
	window.location.href = '../html/login.html'
})

// Dashbord ichidagi zakazlar, va mahsulotlar statistikasi
document.addEventListener('DOMContentLoaded', () => {
	let allProducts = []
	let showingTop = true
	let currentTimeFrame = 'day'
	let ordersChart = null

	// 🔁 TOP mahsulotlar yuklash
	async function loadTopProducts(type = 'day') {
		const list = document.getElementById('topProductsList')
		if (!list) return console.error("❌ Element 'topProductsList' topilmadi!")

		list.innerHTML = ''

		try {
			const res = await fetch(
				`http://localhost:3006/api/top-products?type=${type}&_=${Date.now()}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
					},
				}
			)
			if (!res.ok) throw new Error("Ma'lumotlar olinmadi")

			allProducts = await res.json()
			renderProductList()
		} catch (err) {
			console.error('❌ Xatolik:', err.message)
		}
	}

	// 📊 TOP mahsulotlar ro'yxatini render qilish
	function renderProductList() {
		const list = document.getElementById('topProductsList')

		// 🔁 Avval fade-out qo‘shamiz
		list.classList.remove('fade-in')
		list.classList.add('fade-out')

		setTimeout(() => {
			list.innerHTML = '' // tozalaymiz

			const productsToShow = showingTop ? allProducts.slice(0, 5) : allProducts

			if (productsToShow.length === 0) {
				const li = document.createElement('li')
				li.className = 'list-group-item text-center text-muted'

				const typeLabels = {
					day: 'Bugungi zakazlar mavjud emas',
					week: 'Haftalik zakazlar mavjud emas',
					month: 'Oylik zakazlar mavjud emas',
					year: 'Yillik zakazlar mavjud emas',
				}
				li.textContent = typeLabels[currentTimeFrame] || 'Zakazlar mavjud emas'
				list.appendChild(li)

				document.getElementById('toggleBtn').style.display = 'none'

				// 🔁 Fade-in
				list.classList.remove('fade-out')
				list.classList.add('fade-in')
				return
			}

			productsToShow.forEach((product, index) => {
				const li = document.createElement('li')
				li.className =
					'list-group-item d-flex justify-content-between align-items-center'
				li.innerHTML = `
			<span>${index + 1}. ${product.name}</span>
			<span class="badge bg-primary rounded-pill">${product.count}</span>`
				list.appendChild(li)
			})

			document.getElementById('toggleBtn').style.display = 'block'
			document.getElementById('toggleBtn').textContent = showingTop
				? 'Ko‘proq'
				: 'Yopish'

			// 🔁 Fade-in
			list.classList.remove('fade-out')
			list.classList.add('fade-in')
		}, 200) // bu delay bilan silliqroq o‘tadi
	}

	// ↕️ Ko‘proq/Yopish tugmasi
	function toggleAllProducts() {
		const list = document.getElementById('topProductsList')
		showingTop = !showingTop
		renderProductList()

		if (!showingTop) list.classList.add('scrollable')
		else list.classList.remove('scrollable')
	}

	// 📅 Vaqt oraliqlarini almashtirish
	function changeTimeFrame(type) {
		currentTimeFrame = type
		showingTop = true
		loadTopProducts(type)
		updateActiveButton(type)
	}

	// 🔘 Tugmalarning aktivligini yangilash
	function updateActiveButton(selectedType) {
		const buttons = document.querySelectorAll('.timeframe-btn')
		buttons.forEach(btn => {
			const type = btn.getAttribute('data-type')
			if (type === selectedType) {
				btn.classList.add('btn-primary', 'active')
				btn.classList.remove('btn-outline-primary')
			} else {
				btn.classList.remove('btn-primary', 'active')
				btn.classList.add('btn-outline-primary')
			}
		})
	}

	// 📈 Grafik chizish
	async function initChart() {
		const select = document.getElementById('chartPeriod')
		const period = select.value

		const res = await fetch('http://localhost:3006/api/customer-orders', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
			},
		})
		if (!res.ok) return console.error("📉 Grafik uchun ma'lumot olinmadi")

		const orders = await res.json()
		const labels = []
		const data = []
		const now = new Date()

		if (period === 'week') {
			for (let i = 6; i >= 0; i--) {
				const day = new Date(now)
				day.setDate(now.getDate() - i)
				const label = day.toISOString().slice(5, 10)
				labels.push(label)

				const count = orders.filter(
					o =>
						o.created_at &&
						o.created_at.slice(0, 10) === day.toISOString().slice(0, 10)
				).length
				data.push(count)
			}
		} else if (period === 'month') {
			const weekCounts = [0, 0, 0, 0, 0]
			orders.forEach(order => {
				if (!order.created_at) return
				const date = new Date(order.created_at)
				const weekNum = Math.floor(date.getDate() / 7)
				if (weekNum >= 0 && weekNum < 5) weekCounts[weekNum]++
			})
			labels.push('1-hafta', '2-hafta', '3-hafta', '4-hafta', '5-hafta')
			data.push(...weekCounts)
		} else if (period === 'year') {
			const monthCounts = new Array(12).fill(0)
			orders.forEach(order => {
				if (!order.created_at) return
				const date = new Date(order.created_at)
				const month = date.getMonth()
				monthCounts[month]++
			})
			labels.push(
				'Yan',
				'Fev',
				'Mar',
				'Apr',
				'May',
				'Iyun',
				'Iyul',
				'Avg',
				'Sen',
				'Okt',
				'Noy',
				'Dek'
			)
			data.push(...monthCounts)
		}

		if (ordersChart) ordersChart.destroy()

		const ctx = document.getElementById('ordersChart').getContext('2d')
		ordersChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Buyurtmalar soni',
						data,
						borderColor: 'rgba(75, 192, 192, 1)',
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						tension: 0.4,
						pointRadius: 4,
						pointBackgroundColor: 'rgba(75, 192, 192, 1)',
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						title: { display: true, text: 'Buyurtmalar soni' },
					},
					x: {
						title: {
							display: true,
							text:
								period === 'year' ? 'Oy' : period === 'month' ? 'Hafta' : 'Kun',
						},
					},
				},
			},
		})
	}

	// 🟢 Dastlabki chaqiruvlar
	loadTopProducts(currentTimeFrame)
	updateActiveButton(currentTimeFrame)
	initChart()

	// ⏱️ Har 5 soniyada yangilab turish
	setInterval(() => {
		loadTopProducts(currentTimeFrame)
	}, 30000)

	// 🎯 Tugmalarni bog‘lash
	const toggleBtn = document.getElementById('toggleBtn')
	if (toggleBtn) toggleBtn.addEventListener('click', toggleAllProducts)

	const timeframeBtns = document.querySelectorAll('.timeframe-btn')
	timeframeBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const type = btn.getAttribute('data-type')
			changeTimeFrame(type)
		})
	})

	const chartSelect = document.getElementById('chartPeriod')
	if (chartSelect) chartSelect.addEventListener('change', initChart)

	// 🌟 Tashqaridan chaqirish uchun global funksiyalar
	window.refreshTopProducts = function () {
		loadTopProducts(currentTimeFrame)
	}
})

// ✅ Xodimlar bulimi
const baseURL = 'http://localhost:3008'

let employeeModal

document.addEventListener('DOMContentLoaded', () => {
	employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'))

	loadEmployees()

	// 👤 Avatar preview
	document.getElementById('avatar').addEventListener('change', function () {
		const file = this.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = function (e) {
				document.getElementById('avatarPreview').src = e.target.result
			}
			reader.readAsDataURL(file)
		}
	})

	// 📥 Saqlash (yangi yoki tahrir)
	document
		.getElementById('employeeForm')
		.addEventListener('submit', async e => {
			e.preventDefault()

			const id = document.getElementById('employeeId').value
			const form = document.getElementById('employeeForm')
			const formData = new FormData(form)

			try {
				const res = await fetch(
					`${baseURL}/api/employees${id ? '/' + id : ''}`,
					{
						method: id ? 'PUT' : 'POST',
						headers: {
							Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
						},
						body: formData,
					}
				)

				if (!res.ok) {
					const errorText = await res.text()
					throw new Error(errorText || 'Xatolik yuz berdi')
				}

				employeeModal.hide()
				loadEmployees()
			} catch (err) {
				alert('❌ Xatolik: ' + err.message)
			}
		})

	// ➕ Modalni ochish (yangi qo‘shish uchun)
	const addBtn = document.getElementById('addEmployeeBtn')
	if (addBtn) {
		addBtn.addEventListener('click', () => {
			document.getElementById('employeeForm').reset()
			document.getElementById('employeeId').value = ''
			document.getElementById('avatarPreview').src = 'default-avatar.png'
			employeeModal.show()
		})
	}

	// 🔽 Xodimlar ro‘yxatini yuklash
	async function loadEmployees() {
		const tbody = document.querySelector('#employeeTable tbody')
		tbody.innerHTML = ''

		try {
			const res = await fetch(`${baseURL}/api/employees`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
				},
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || "Ma'lumot olishda xatolik")
			}

			const data = await res.json()
			if (!Array.isArray(data))
				throw new Error("Ma'lumotlar noto‘g‘ri formatda")

			data.forEach((emp, index) => {
				const tr = document.createElement('tr')
				tr.innerHTML = `
					<td>${index + 1}</td>
					<td>
						<img src="${
							emp.avatar
								? `${baseURL}/uploads/xodimlar/${emp.avatar}`
								: 'default-avatar.png'
						}"
							alt="Avatar"
							class="rounded-circle"
							style="width: 40px; height: 40px; object-fit: cover;">
					</td>
					<td>${emp.full_name}</td>
					<td>${emp.position || '-'}</td>
					<td>${emp.phone || '-'}</td>
					<td>${emp.email}</td>
					<td>${emp.role}</td>
					<td>
						<button class="btn btn-sm btn-warning me-1" onclick="editEmployee(${
							emp.id
						})">✏️</button>
						<button class="btn btn-sm btn-danger" onclick="deleteEmployee(${
							emp.id
						})">🗑️</button>
					</td>
				`
				tbody.appendChild(tr)
			})
		} catch (err) {
			console.error('❌ Xodimlar yuklashda xatolik:', err)
		}
	}

	// ✏️ Tahrirlash
	window.editEmployee = async function (id) {
		try {
			const res = await fetch(`${baseURL}/api/employees`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
				},
			})

			if (!res.ok) {
				const text = await res.text()
				console.error('❌ Xatolik javobi:', text)
				throw new Error("Xodim ma'lumotlarini olishda xatolik")
			}

			const data = await res.json()
			if (!Array.isArray(data)) throw new Error('Format noto‘g‘ri')

			const emp = data.find(e => e.id === id)
			if (!emp) return

			document.getElementById('employeeId').value = emp.id
			document.getElementById('fullName').value = emp.full_name
			document.getElementById('position').value = emp.position
			document.getElementById('phone').value = emp.phone
			document.getElementById('email').value = emp.email
			document.getElementById('role').value = emp.role
			document.getElementById('avatarPreview').src = emp.avatar
				? `${baseURL}/uploads/xodimlar/${emp.avatar}`
				: 'default-avatar.png'

			employeeModal.show()
		} catch (err) {
			console.error('❌ Tahrirlashda xatolik:', err)
		}
	}

	// 🗑️ O‘chirish
	window.deleteEmployee = async function (id) {
		if (!confirm('Xodimni o‘chirishga ishonchingiz komilmi?')) return

		try {
			const res = await fetch(`${baseURL}/api/employees/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
				},
			})
			if (!res.ok) throw new Error('O‘chirishda xatolik')
			loadEmployees()
		} catch (err) {
			alert('❌ O‘chirishda xatolik: ' + err.message)
		}
	}
})

// ✅ Xodimlar bulimi

// ✅ Yangiliklar top navbar
document.addEventListener('DOMContentLoaded', () => {
	const badge = document.getElementById('notificationBadge')
	const menu = document.getElementById('notificationMenu')
	let notifications = []

	// 🔁 Har 5 soniyada yangiliklarni tekshir
	setInterval(checkNewEvents, 5000)

	// 🌐 Serverdan yangi holatlar bor-yo‘qligini tekshiradi
	async function checkNewEvents() {
		try {
			const res = await fetch('http://localhost:3006/api/check-new-events', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
				},
			})
			if (!res.ok) throw new Error('Tekshiruv muvaffaqiyatsiz')
			const data = await res.json()

			if (data.new_order) addNotification('🏠 Yangi xona band qilindi')
			if (data.new_user)
				addNotification('👤 Yangi foydalanuvchi ro‘yxatdan o‘tdi')
			if (data.new_product_order)
				addNotification('🍽 Yangi mahsulot zakazi tushdi')
		} catch (err) {
			console.warn('⚠️ Xatolik:', err.message)
		}
	}

	// 🆕 Yangi xabar qo‘shish
	function addNotification(message) {
		if (notifications.includes(message)) return // dublikatni oldini oladi
		notifications.unshift(message)
		if (notifications.length > 10) notifications.pop()
		updateNotificationMenu()
	}

	// 🔄 Dropdown menyuni yangilash
	function updateNotificationMenu() {
		badge.textContent = notifications.length
		badge.classList.toggle('d-none', notifications.length === 0)

		menu.innerHTML = `
			<li><h6 class="dropdown-header">Yangiliklar (${notifications.length})</h6></li>
			${
				notifications.length
					? notifications
							.map(
								msg => `<li><a class="dropdown-item" href="#">${msg}</a></li>`
							)
							.join('')
					: `<li><a class="dropdown-item text-muted" href="#">Xabarlar mavjud emas</a></li>`
			}
			<li><hr class="dropdown-divider"></li>
			<li><a class="dropdown-item text-primary" href="#">Barchasini ko‘rish</a></li>
		`
	}
})

// ✅ Eng ko'p buyurtma berga Foydalanuvchilar
document.addEventListener('DOMContentLoaded', () => {
	loadTopCustomers()
})

let allTopCustomers = []
let currentPage = 1
const pageSize = 5 // Har safar 10 ta ko‘rsatiladi

async function loadTopCustomers() {
	try {
		const res = await fetch('http://localhost:3008/api/top-customers', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
			},
		})
		if (!res.ok) throw new Error("Serverdan ma'lumot olinmadi")
		allTopCustomers = await res.json()
		renderTopCustomers()
	} catch (err) {
		console.error('❌ Yuklashda xatolik:', err)
	}
}

function renderTopCustomers() {
	const tbody = document.querySelector('#topCustomersTable tbody')
	const pagContainer = document.getElementById('topCustomersPagination')

	const startIndex = (currentPage - 1) * pageSize
	const paginated = allTopCustomers.slice(startIndex, startIndex + pageSize)

	tbody.innerHTML = ''
	paginated.forEach((customer, index) => {
		tbody.innerHTML += `
			<tr>
				<td>${startIndex + index + 1}</td>
				<td>${customer.name}</td>
				<td>${customer.phone}</td>
				<td>${customer.address}</td>
				<td>${customer.product_orders}</td>
				<td>${customer.user_id}</td>
			</tr>
		`
	})

	renderPagination()
}

function renderPagination() {
	const totalPages = Math.ceil(allTopCustomers.length / pageSize)
	const pagContainer = document.getElementById('topCustomersPagination')
	pagContainer.innerHTML = ''

	const prev = document.createElement('li')
	prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`
	prev.innerHTML = `<a class="page-link" href="#">Oldingi</a>`
	prev.addEventListener('click', e => {
		e.preventDefault()
		if (currentPage > 1) {
			currentPage--
			renderTopCustomers()
		}
	})
	pagContainer.appendChild(prev)

	for (let i = 1; i <= totalPages; i++) {
		const li = document.createElement('li')
		li.className = `page-item ${i === currentPage ? 'active' : ''}`
		li.innerHTML = `<a class="page-link" href="#">${i}</a>`
		li.addEventListener('click', e => {
			e.preventDefault()
			currentPage = i
			renderTopCustomers()
		})
		pagContainer.appendChild(li)
	}

	const next = document.createElement('li')
	next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`
	next.innerHTML = `<a class="page-link" href="#">Keyingi</a>`
	next.addEventListener('click', e => {
		e.preventDefault()
		if (currentPage < totalPages) {
			currentPage++
			renderTopCustomers()
		}
	})
	pagContainer.appendChild(next)
}

// ✅ Eng ko'p buyurtma berga Foydalanuvchilar

// ✅ Location Orders Content
document.addEventListener('DOMContentLoaded', () => {
	const tableBody = document.querySelector('#locationOrdersTable tbody')
	const searchInput = document.getElementById('locationSearchInput')
	const dateFilter = document.getElementById('dateFilter')
	const paginationContainer = document.querySelector(
		'#locationOrdersContent .pagination'
	)
	const token = localStorage.getItem('auth_token')

	let allOrders = []
	let currentPage = 1
	const pageSize = 10

	function filterByDate(orders, filter) {
		const now = new Date()
		return orders.filter(order => {
			if (!order.date) return false
			const orderDate = new Date(order.date)
			orderDate.setHours(0, 0, 0, 0)

			switch (filter) {
				case 'today':
					const today = new Date()
					today.setHours(0, 0, 0, 0)
					return orderDate.getTime() === today.getTime()
				case 'week':
					const startOfWeek = new Date(now)
					startOfWeek.setDate(now.getDate() - now.getDay())
					startOfWeek.setHours(0, 0, 0, 0)
					return orderDate >= startOfWeek
				case 'month':
					return (
						orderDate.getMonth() === now.getMonth() &&
						orderDate.getFullYear() === now.getFullYear()
					)
				case 'year':
					return orderDate.getFullYear() === now.getFullYear()
				default:
					return true
			}
		})
	}

	const addBtn = document.getElementById('addLocationOrderBtn')
	if (addBtn) {
		addBtn.addEventListener('click', () => {
			document.getElementById('addOrderModal').style.display = 'flex'
		})
	} else {
		console.warn('⛔ Qo‘shish tugmasi topilmadi: #addLocationOrderBtn')
	}

	async function fetchOrders() {
		try {
			const res = await fetch('http://localhost:3008/api/orders', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			})
			if (!res.ok) throw new Error("Serverdan ma'lumot olinmadi")
			const data = await res.json()
			allOrders = data
			renderOrders(allOrders)
		} catch (err) {
			console.error('❌ Xatolik:', err)
			tableBody.innerHTML = `<tr><td colspan="9" class="text-danger">Xatolik yuz berdi</td></tr>`
		}
	}

	function renderOrders(orders) {
		const searchValue = searchInput.value.toLowerCase()
		const selectedFilter = dateFilter?.value || 'all'
		const filtered = filterByDate(orders, selectedFilter)
			.filter(
				order =>
					order.name?.toLowerCase().includes(searchValue) ||
					order.phone?.toLowerCase().includes(searchValue) ||
					String(order.room || '')
						.toLowerCase()
						.includes(searchValue)
			)
			.sort((a, b) => b.id - a.id)

		const totalPages = Math.ceil(filtered.length / pageSize)
		if (currentPage > totalPages) currentPage = totalPages || 1
		const startIndex = (currentPage - 1) * pageSize
		const paginated = filtered.slice(startIndex, startIndex + pageSize)

		tableBody.innerHTML = ''
		if (paginated.length === 0) {
			tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Buyurtma topilmadi</td></tr>`
			renderPagination(totalPages)
			return
		}

		paginated.forEach(order => {
			const row = document.createElement('tr')
			row.innerHTML = `
				<td>${order.id}</td>
				<td>${order.name}</td>
				<td>${order.phone}</td>
				<td>${order.date ? order.date.slice(0, 10) : ''}</td>
				<td>${order.time}</td>
				<td>${order.guests}</td>
				<td>${order.room}</td>
				<td>${order.status || 'Aktiv'}</td>
				<td>${order.created_at || '—'}</td>
				<td>
					<button class="btn btn-sm btn-warning edit-btn" data-id="${
						order.id
					}">Tahrirlash</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${
						order.id
					}">O‘chirish</button>
				</td>
			`
			tableBody.appendChild(row)
		})
		renderPagination(totalPages)
	}

	function renderPagination(totalPages) {
		paginationContainer.innerHTML = ''

		const prev = document.createElement('li')
		prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`
		prev.innerHTML = `<a class="page-link" href="#">Oldingi</a>`
		prev.addEventListener('click', e => {
			e.preventDefault()
			if (currentPage > 1) {
				currentPage--
				renderOrders(allOrders)
			}
		})
		paginationContainer.appendChild(prev)

		let startPage = Math.max(currentPage - 2, 1)
		let endPage = Math.min(startPage + 4, totalPages)
		if (endPage - startPage < 4) {
			startPage = Math.max(endPage - 4, 1)
		}

		for (let i = startPage; i <= endPage; i++) {
			const li = document.createElement('li')
			li.className = `page-item ${i === currentPage ? 'active' : ''}`
			li.innerHTML = `<a class="page-link" href="#">${i}</a>`
			li.addEventListener('click', e => {
				e.preventDefault()
				currentPage = i
				renderOrders(allOrders)
			})
			paginationContainer.appendChild(li)
		}

		const next = document.createElement('li')
		next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`
		next.innerHTML = `<a class="page-link" href="#">Keyingi</a>`
		next.addEventListener('click', e => {
			e.preventDefault()
			if (currentPage < totalPages) {
				currentPage++
				renderOrders(allOrders)
			}
		})
		paginationContainer.appendChild(next)
	}

	searchInput.addEventListener('input', () => {
		currentPage = 1
		renderOrders(allOrders)
	})

	dateFilter.addEventListener('change', () => {
		currentPage = 1
		renderOrders(allOrders)
	})

	tableBody.addEventListener('click', function (e) {
		const deleteBtn = e.target.closest('.delete-btn')
		const editBtn = e.target.closest('.edit-btn')
		if (deleteBtn) deleteOrder(parseInt(deleteBtn.getAttribute('data-id')))
		if (editBtn) editOrder(parseInt(editBtn.getAttribute('data-id')))
	})

	async function deleteOrder(id) {
		if (!confirm('Buyurtmani o‘chirishga ishonchingiz komilmi?')) return
		try {
			const res = await fetch(`http://localhost:3008/api/orders/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			const contentType = res.headers.get('content-type')
			let result = {}
			if (contentType && contentType.includes('application/json')) {
				result = await res.json()
			} else {
				const text = await res.text()
				throw new Error('Xatolik: ' + text)
			}
			if (!res.ok) throw new Error(result.message)
			alert(result.message || 'Buyurtma o‘chirildi')
			fetchOrders()
		} catch (err) {
			console.error('❌ O‘chirishda xatolik:', err)
			alert('Xatolik yuz berdi: ' + err.message)
		}
	}

	window.addEventListener('click', e => {
		const modals = document.querySelectorAll('.modal')
		modals.forEach(modal => {
			if (e.target === modal) modal.style.display = 'none'
		})
	})

	function editOrder(id) {
		const order = allOrders.find(o => o.id === id)
		if (!order) return alert('Buyurtma topilmadi')
		document.getElementById('editId').value = order.id
		document.getElementById('editName').value = order.name
		document.getElementById('editPhone').value = order.phone
		document.getElementById('editDate').value = order.date?.slice(0, 10)
		document.getElementById('editTime').value = order.time
		document.getElementById('editGuests').value = order.guests
		document.getElementById('editRoom').value = order.room
		document.getElementById('editOrderModal').style.display = 'flex'
	}

	fetchOrders()
	setInterval(fetchOrders, 10000)
})

// ✅ Joy buyurtmalarining Dinamikasi
document.addEventListener('DOMContentLoaded', () => {
	const ctx = document.getElementById('locationOrdersChart').getContext('2d')
	const chartPeriod = document.getElementById('chartPeriod')
	if (!ctx || !chartPeriod) {
		console.error('⛔ Grafik yoki select elementi topilmadi')
		return
	}

	let locationOrdersChart

	async function loadChartData(period = 'month') {
		try {
			const token = localStorage.getItem('auth_token')
			const res = await fetch(
				`http://localhost:3008/api/location-orders-stats?period=${period}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			if (!res.ok) throw new Error('Statistika olinmadi')

			const data = await res.json()

			if (!Array.isArray(data) || data.length === 0) {
				console.warn("❗ Grafik uchun ma'lumot yo‘q")
				if (locationOrdersChart) locationOrdersChart.destroy()
				return
			}

			const labels = data.map(item => item.label)
			const counts = data.map(item => item.count)

			if (locationOrdersChart) locationOrdersChart.destroy()

			locationOrdersChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: labels,
					datasets: [
						{
							label: 'Buyurtmalar soni',
							data: counts,
							backgroundColor: 'rgba(54, 162, 235, 0.5)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1,
						},
					],
				},
				options: {
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								stepSize: 1,
							},
						},
					},
				},
			})
		} catch (err) {
			console.error('❌ Grafik yuklanmadi:', err)
		}
	}

	chartPeriod.addEventListener('change', () => {
		const selected = chartPeriod.value
		loadChartData(selected)
	})

	loadChartData('month') // boshlanishi uchun
})

// ✅ Product Orders Content
document.addEventListener('DOMContentLoaded', () => {
	const tableBody = document.querySelector('#productOrdersTable tbody')
	const searchInput = document.getElementById('productSearchInput')
	const filterDate = document.getElementById('filterDate')
	const filterRange = document.getElementById('filterRange')
	const paginationContainer = document.getElementById('paginationControls')
	const token = localStorage.getItem('auth_token')

	let allOrders = []
	let currentPage = 1
	const pageSize = 10

	// 🚀 Buyurtmalarni olish
	async function fetchCustomerOrders() {
		try {
			const res = await fetch('http://localhost:3006/api/customer-orders', {
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error("Ma'lumot olinmadi")
			const data = await res.json()
			allOrders = data
			renderOrders(allOrders)
		} catch (err) {
			console.error('❌ Xatolik:', err)
			tableBody.innerHTML = `<tr><td colspan="10" class="text-danger">Xatolik yuz berdi</td></tr>`
		}
	}

	// 🧾 Buyurtmalarni render qilish
	function renderOrders(orders) {
		const query = searchInput.value.toLowerCase()
		const selectedDate = filterDate.value
		const selectedRange = filterRange.value
		const now = new Date()

		const filtered = orders.filter(order => {
			const matchesSearch =
				order.name?.toLowerCase().includes(query) ||
				order.phone?.includes(query) ||
				order.address?.toLowerCase().includes(query) ||
				order.note?.toLowerCase().includes(query)

			const matchesDate = selectedDate
				? order.created_at?.slice(0, 10) === selectedDate
				: true

			let matchesRange = true
			if (selectedRange) {
				const orderDate = new Date(order.created_at)
				if (selectedRange === 'daily') {
					matchesRange = orderDate.toDateString() === now.toDateString()
				} else if (selectedRange === 'weekly') {
					const oneWeekAgo = new Date()
					oneWeekAgo.setDate(now.getDate() - 7)
					matchesRange = orderDate >= oneWeekAgo && orderDate <= now
				} else if (selectedRange === 'monthly') {
					matchesRange =
						orderDate.getMonth() === now.getMonth() &&
						orderDate.getFullYear() === now.getFullYear()
				} else if (selectedRange === 'yearly') {
					matchesRange = orderDate.getFullYear() === now.getFullYear()
				}
			}

			return matchesSearch && matchesDate && matchesRange
		})

		const totalPages = Math.ceil(filtered.length / pageSize)
		if (currentPage > totalPages) currentPage = totalPages || 1

		const startIndex = (currentPage - 1) * pageSize
		const paginatedOrders = filtered.slice(startIndex, startIndex + pageSize)

		tableBody.innerHTML = ''

		if (paginatedOrders.length === 0) {
			tableBody.innerHTML = `<tr><td colspan="10" class="text-center">Buyurtma topilmadi</td></tr>`
			renderPagination(totalPages)
			return
		}

		paginatedOrders.forEach(order => {
			let itemsHTML = '—'
			try {
				const parsedItems =
					typeof order.items === 'string'
						? JSON.parse(order.items)
						: order.items
				if (Array.isArray(parsedItems)) {
					itemsHTML = parsedItems
						.map(item => `${item.name} (${item.quantity} x ${item.price})`)
						.join('<br>')
				}
			} catch (err) {
				console.warn('JSON parse error:', err)
			}

			const row = document.createElement('tr')
			row.innerHTML = `
				<td>${order.id}</td>
				<td>${order.name}</td>
				<td>${order.phone}</td>
				<td>${order.address}</td>
				<td>${order.note || '—'}</td>
				<td>${itemsHTML}</td>
				<td>${order.total_amount} so'm</td>
				<td>${order.user_id || '—'}</td>
				<td>${order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
				<td>
					<button class="btn btn-sm btn-warning edit-btn" data-id="${
						order.id
					}">Tahrirlash</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${
						order.id
					}">O‘chirish</button>
				</td>
			`
			tableBody.appendChild(row)
		})

		renderPagination(totalPages)
	}

	// 🔁 Sahifalash
	function renderPagination(totalPages) {
		paginationContainer.innerHTML = ''

		const prev = document.createElement('li')
		prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`
		prev.innerHTML = `<a class="page-link" href="#">Oldingi</a>`
		prev.addEventListener('click', e => {
			e.preventDefault()
			if (currentPage > 1) {
				currentPage--
				renderOrders(allOrders)
			}
		})
		paginationContainer.appendChild(prev)

		for (let i = 1; i <= totalPages; i++) {
			const li = document.createElement('li')
			li.className = `page-item ${i === currentPage ? 'active' : ''}`
			li.innerHTML = `<a class="page-link" href="#">${i}</a>`
			li.addEventListener('click', e => {
				e.preventDefault()
				currentPage = i
				renderOrders(allOrders)
			})
			paginationContainer.appendChild(li)
		}

		const next = document.createElement('li')
		next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`
		next.innerHTML = `<a class="page-link" href="#">Keyingi</a>`
		next.addEventListener('click', e => {
			e.preventDefault()
			if (currentPage < totalPages) {
				currentPage++
				renderOrders(allOrders)
			}
		})
		paginationContainer.appendChild(next)
	}

	// 🔍 Qidiruv va filterlar
	searchInput.addEventListener('input', () => {
		currentPage = 1
		renderOrders(allOrders)
	})
	filterDate.addEventListener('change', () => {
		currentPage = 1
		filterRange.value = ''
		renderOrders(allOrders)
	})
	filterRange.addEventListener('change', () => {
		currentPage = 1
		filterDate.value = ''
		renderOrders(allOrders)
	})

	// 🖱 Tugmalar: tahrirlash va o‘chirish
	document
		.getElementById('productOrdersTable')
		.addEventListener('click', function (e) {
			const editBtn = e.target.closest('.edit-btn')
			const deleteBtn = e.target.closest('.delete-btn')

			if (editBtn) {
				const id = parseInt(editBtn.getAttribute('data-id'))
				editProductOrder(id)
			}
			if (deleteBtn) {
				const id = parseInt(deleteBtn.getAttribute('data-id'))
				deleteOrder(id)
			}
		})

	// ✏️ Tahrirlash modalini ochish
	function editProductOrder(id) {
		const order = allOrders.find(o => o.id === id)
		if (!order) return alert('Buyurtma topilmadi')

		// 📝 Formani to‘ldirish
		document.getElementById('productOrderId').value = order.id
		document.getElementById('productOrderName').value = order.name || ''
		document.getElementById('productOrderPhone').value = order.phone || ''
		document.getElementById('productOrderAddress').value = order.address || ''
		document.getElementById('productOrderNote').value = order.note || ''
		document.getElementById('productOrderTotalAmount').value =
			order.total_amount || ''

		// 🧾 Zakazlar (mahsulotlar) formasi
		const container = document.getElementById('productOrderItemsContainer')
		container.innerHTML = ''

		let items = []
		try {
			items =
				typeof order.items === 'string' ? JSON.parse(order.items) : order.items
		} catch (err) {
			console.warn('❌ JSON parse xatolik:', err)
		}

		if (!Array.isArray(items)) items = []

		items.forEach((item, index) => {
			const row = document.createElement('div')
			row.classList.add('mb-2')

			row.innerHTML = `
			<div class="form-row d-flex gap-2 align-items-center">
				<input type="text" class="form-control" value="${item.name}" readonly style="max-width: 150px;">
				<input type="number" class="form-control item-quantity" value="${item.quantity}" min="1" data-index="${index}" style="max-width: 80px;">
				<input type="number" class="form-control item-price" value="${item.price}" min="0" step="100" data-index="${index}" style="max-width: 100px;">
			</div>
		`

			container.appendChild(row)
		})

		document.getElementById('editProductOrderModal').style.display = 'flex'
	}

	// 💾 Tahrirni saqlash
	document
		.getElementById('editProductOrderForm')
		.addEventListener('submit', async function (e) {
			e.preventDefault()
			const id = document.getElementById('productOrderId').value

			// 🛍 Items (mahsulotlar) ni yig‘ish
			const items = []
			const quantities = document.querySelectorAll('.item-quantity')
			const prices = document.querySelectorAll('.item-price')

			for (let i = 0; i < quantities.length; i++) {
				const name = document
					.querySelectorAll('.item-quantity')
					[i].parentElement.querySelector('input[type=text]').value
				items.push({
					name,
					quantity: parseInt(quantities[i].value),
					price: parseFloat(prices[i].value),
				})
			}

			const updatedOrder = {
				name: document.getElementById('productOrderName').value,
				phone: document.getElementById('productOrderPhone').value,
				address: document.getElementById('productOrderAddress').value,
				note: document.getElementById('productOrderNote').value,
				total_amount: document.getElementById('productOrderTotalAmount').value,
				items, // 🔁 Yuborish uchun tayyor ro‘yxat
			}

			try {
				const res = await fetch(
					`http://localhost:3006/api/customer-orders/${id}`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(updatedOrder),
					}
				)
				if (!res.ok) throw new Error('Yangilashda xatolik')
				alert('✅ Buyurtma yangilandi!')
				document.getElementById('editProductOrderModal').style.display = 'none'
				fetchCustomerOrders()
			} catch (err) {
				alert('❌ Xatolik: ' + err.message)
			}
		})

	// 🗑 O‘chirish
	async function deleteOrder(id) {
		if (!confirm('Buyurtmani o‘chirishga ishonchingiz komilmi?')) return
		try {
			const res = await fetch(
				`http://localhost:3006/api/customer-orders/${id}`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			const contentType = res.headers.get('content-type')
			let result = {}
			if (contentType && contentType.includes('application/json')) {
				result = await res.json()
			} else {
				const text = await res.text()
				throw new Error('Xatolik: ' + text)
			}
			if (!res.ok) throw new Error(result.message)
			alert(result.message || 'Buyurtma o‘chirildi')
			fetchCustomerOrders()
		} catch (err) {
			alert('❌ Xatolik: ' + err.message)
		}
	}
	document
		.getElementById('exportOrdersBtn')
		.addEventListener('click', exportOrdersToExcel)

	// 📦 Excel faylga eksport qilish
	function exportOrdersToExcel() {
		const headers = [
			[
				'ID',
				'Ismi',
				'Telefon',
				'Manzil',
				'Izoh',
				'Mahsulotlar',
				"Jami (so'm)",
				'User ID',
				'Sana',
			],
		]

		// Filtrlangan ro‘yxatni olish (qidiruv, sana va range asosida)
		const query = searchInput.value.toLowerCase()
		const selectedDate = filterDate.value
		const selectedRange = filterRange.value
		const now = new Date()

		const filtered = allOrders.filter(order => {
			const matchesSearch =
				order.name?.toLowerCase().includes(query) ||
				order.phone?.includes(query) ||
				order.address?.toLowerCase().includes(query) ||
				order.note?.toLowerCase().includes(query)

			const matchesDate = selectedDate
				? order.created_at?.slice(0, 10) === selectedDate
				: true

			let matchesRange = true
			if (selectedRange) {
				const orderDate = new Date(order.created_at)
				if (selectedRange === 'daily') {
					matchesRange = orderDate.toDateString() === now.toDateString()
				} else if (selectedRange === 'weekly') {
					const oneWeekAgo = new Date()
					oneWeekAgo.setDate(now.getDate() - 7)
					matchesRange = orderDate >= oneWeekAgo && orderDate <= now
				} else if (selectedRange === 'monthly') {
					matchesRange =
						orderDate.getMonth() === now.getMonth() &&
						orderDate.getFullYear() === now.getFullYear()
				} else if (selectedRange === 'yearly') {
					matchesRange = orderDate.getFullYear() === now.getFullYear()
				}
			}

			return matchesSearch && matchesDate && matchesRange
		})

		// Excelga yoziladigan qatorlar
		const rows = filtered.map(order => {
			let items = ''
			try {
				const parsed =
					typeof order.items === 'string'
						? JSON.parse(order.items)
						: order.items
				if (Array.isArray(parsed)) {
					items = parsed
						.map(i => `${i.name} (${i.quantity} x ${i.price})`)
						.join(', ')
				}
			} catch (err) {
				console.warn('❌ JSON parse xatolik:', err)
			}

			return [
				order.id,
				order.name,
				order.phone,
				order.address,
				order.note || '',
				items,
				order.total_amount,
				order.user_id || '',
				order.created_at ? new Date(order.created_at).toLocaleString() : '',
			]
		})

		const worksheetData = headers.concat(rows)
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyurtmalar')

		XLSX.writeFile(workbook, 'buyurtmalar.xlsx')
	}

	// 🔃 Yuklash
	fetchCustomerOrders()
	setInterval(fetchCustomerOrders, 10000)
})

// ✅ Users Content
document.addEventListener('DOMContentLoaded', () => {
	const usersTableBody = document.querySelector('#usersTable tbody')
	const searchInput = document.getElementById('userSearch')

	let allUsers = []

	// 🔐 Tokenni localStorage'dan olish
	const token = localStorage.getItem('auth_token')

	if (!token) {
		alert('Avval tizimga kiring!')
		window.location.href = 'login.html'
		return
	}

	// 🛜 Foydalanuvchilarni olish
	async function fetchUsers() {
		try {
			const res = await fetch('http://localhost:3003/api/foydalanuvchilar', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (!res.ok) {
				throw new Error(`Serverdan noto‘g‘ri javob: ${res.status}`)
			}

			const data = await res.json()

			if (!Array.isArray(data)) {
				throw new Error("Serverdan noto‘g‘ri formatdagi ma'lumot keldi")
			}

			allUsers = data
			renderUsers(allUsers)
		} catch (err) {
			console.error('Foydalanuvchilarni olishda xatolik:', err)
		}
	}

	// 📥 Jadvalga foydalanuvchilarni chiqarish
	function renderUsers(users) {
		usersTableBody.innerHTML = ''

		users.forEach(user => {
			// 🖼️ Avatar URL: agar avatar mavjud bo‘lsa, backend port orqali ulaymiz
			const avatarUrl = user.avatar
				? `http://localhost:3003${user.avatar}`
				: 'http://localhost:3003/uploads/avatars/default.png'

			const row = document.createElement('tr')
			row.innerHTML = `
			<td>${user.id}</td>
			<td>${user.login || '-'}</td>
			<td>${user.ism || '-'}</td>
			<td>${user.email || '-'}</td>
			<td><span class="text-muted">•••••••</span></td>
			<td>
				<img src="${avatarUrl}" alt="Avatar" width="40" height="40" class="rounded-circle" />
			</td>
			<td>${user.telefon || '-'}</td>
			<td>${user.manzil || '-'}</td>
			<td><span class="badge bg-success">Faol</span></td>
			<td>
				<button class="btn btn-sm btn-warning edit-user-btn" data-id="${
					user.id
				}">✏️</button>
				<button class="btn btn-sm btn-danger delete-btn" data-id="${
					user.id
				}">🗑️</button>
			</td>
		`
			usersTableBody.appendChild(row)
		})
	}

	const addUserBtn = document.getElementById('addUserBtn')
	const addUserModal = document.getElementById('addUserModal')
	const closeAddModal = document.querySelector('.close-add-modal')
	const addUserForm = document.getElementById('addUserForm')

	// 📦 Modalni ochish
	addUserBtn?.addEventListener('click', () => {
		addUserModal.style.display = 'flex'
	})

	// ❌ Modalni yopish
	closeAddModal?.addEventListener('click', () => {
		addUserModal.style.display = 'none'
		addUserForm.reset()
	})

	// 📤 Foydalanuvchini yuborish
	addUserForm?.addEventListener('submit', async e => {
		e.preventDefault()

		const login = document.getElementById('newLogin').value.trim()
		const ism = document.getElementById('newIsm').value.trim()
		const email = document.getElementById('newEmail').value.trim()
		const password = document.getElementById('newPassword').value.trim()
		const telefon = document.getElementById('newTelefon').value.trim()
		const manzil = document.getElementById('newManzil').value.trim()

		// ⚠️ Tahrir rejimi tekshiruv
		const editingId = addUserForm.getAttribute('data-editing')

		if (!login || !email || (!editingId && !password) || !ism) {
			alert('Majburiy maydonlarni to‘ldiring.')
			return
		}

		try {
			const url = editingId
				? `http://localhost:3003/api/foydalanuvchilar/${editingId}`
				: `http://localhost:3003/api/register`

			const method = editingId ? 'PUT' : 'POST'

			const body = {
				login,
				ism,
				email,
				telefon,
				manzil,
			}

			if (password) body.parol = password // faqat bo‘sh bo‘lmasa

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			})

			const result = await res.json()
			if (!res.ok) throw new Error(result.message || 'Xatolik yuz berdi')

			alert(
				editingId
					? '✅ Foydalanuvchi yangilandi'
					: '✅ Yangi foydalanuvchi qo‘shildi'
			)
			addUserModal.style.display = 'none'
			addUserForm.reset()
			addUserForm.removeAttribute('data-editing') // 🔄 Reset edit mode
			fetchUsers()
		} catch (err) {
			console.error('❌ Saqlashda xatolik:', err)
			alert('Xatolik: ' + err.message)
		}
	})

	// 💬 Modal foniga bosilganda yopish
	window.addEventListener('click', e => {
		if (e.target === addUserModal) {
			addUserModal.style.display = 'none'
			addUserForm.reset()
		}
	})

	// Tahrirlash tugmasi
	document.addEventListener('click', async e => {
		if (e.target.classList.contains('edit-user-btn')) {
			const userId = e.target.dataset.id
			if (!userId) return

			try {
				const res = await fetch(
					`http://localhost:3003/api/foydalanuvchilar/${userId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				)
				if (!res.ok) throw new Error("Ma'lumot topilmadi")
				const user = await res.json()

				document.getElementById('newLogin').value = user.login || ''
				document.getElementById('newIsm').value = user.ism || ''
				document.getElementById('newEmail').value = user.email || ''
				document.getElementById('newTelefon').value = user.telefon || ''
				document.getElementById('newManzil').value = user.manzil || ''
				document.getElementById('newPassword').value = ''

				addUserModal.style.display = 'flex'
				addUserForm.setAttribute('data-editing', userId)
			} catch (err) {
				alert('❌ Foydalanuvchini olishda xatolik: ' + err.message)
			}
		}
	})

	// Foydalanuvchilarni o'chirish
	document.addEventListener('click', async e => {
		if (e.target.classList.contains('user-delete-btn')) {
			const userId = e.target.dataset.id
			if (!userId) return

			if (!confirm('Rostdan ham o‘chirmoqchimisiz?')) return

			try {
				const res = await fetch(
					`http://localhost:3003/api/foydalanuvchilar/${userId}`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
				if (!res.ok) throw new Error('O‘chirishda xatolik')

				alert('Foydalanuvchi o‘chirildi')
				fetchUsers()
			} catch (err) {
				alert('❌ O‘chirishda xatolik: ' + err.message)
			}
		}
	})

	// 🔍 Qidiruv funksiyasi
	searchInput.addEventListener('input', () => {
		const query = searchInput.value.toLowerCase()
		const filtered = allUsers.filter(
			user =>
				(user.ism && user.ism.toLowerCase().includes(query)) ||
				(user.telefon && user.telefon.includes(query))
		)
		renderUsers(filtered)
	})

	// 🚀 Dastlabki yuklash
	fetchUsers()
})

// ✅ Products Content
document.addEventListener('DOMContentLoaded', () => {
	loadProducts()

	document
		.getElementById('productSearch')
		.addEventListener('input', filterProducts)
})

// ✅ Barcha mahsulotlarni olish va jadvalga chiqarish
async function loadProducts() {
	const token = localStorage.getItem('auth_token') // 🔑 tokenni oling
	const tbody = document.querySelector('#productsTable tbody')
	tbody.innerHTML = '<tr><td colspan="7">Yuklanmoqda...</td></tr>'

	try {
		const res = await fetch('http://localhost:3006/api/products', {
			headers: {
				Authorization: `Bearer ${token}`, // ✅ token yuboriladi
			},
		})

		if (!res.ok) throw new Error(`Status: ${res.status}`)

		const products = await res.json()

		if (!Array.isArray(products)) throw new Error('Maʼlumotlar noto‘g‘ri')

		tbody.innerHTML = ''

		products.forEach(product => {
			tbody.innerHTML += `
				<tr>
					<td>${product.id}</td>
					<td><img src="${
						product.image_url
					}" width="60" height="60" alt="Mahsulot rasmi"></td>
					<td>${product.name}</td>
					<td>${product.category}</td>
					<td>${product.price} so'm</td>
					<td>${product.status === 'active' ? '✅' : '❌'}</td>
					<td>
						<button class="btn btn-sm btn-warning" onclick="editProduct(${
							product.id
						})">✏️</button>
						<button class="btn btn-sm btn-danger" onclick="deleteProduct(${
							product.id
						})">🗑️</button>
					</td>
				</tr>
			`
		})
	} catch (err) {
		tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Xatolik: ${err.message}</td></tr>`
	}
}

// ✅ Admin panel Mahsulotlarni qo'shish
document.addEventListener('DOMContentLoaded', () => {
	const token = localStorage.getItem('auth_token')

	const addBtn = document.getElementById('addProductBtn')
	const addModal = document.getElementById('addModal')
	const addForm = document.getElementById('addProductForm')

	// 🎯 Modalni ochish
	addBtn.addEventListener('click', () => {
		addModal.style.display = 'block'
	})

	// ❌ Modalni yopish
	window.closeAddModal = function () {
		addModal.style.display = 'none'
		addForm.reset()
	}

	// 📤 Mahsulotni yuborish
	addForm.addEventListener('submit', async e => {
		e.preventDefault()

		const name = document.getElementById('productName').value
		const category = document.getElementById('productCategory').value
		const price = document.getElementById('productPrice').value
		const status = document.getElementById('productStatus').value
		const imageFile = document.getElementById('productImage').files[0]

		const formData = new FormData()
		formData.append('name', name)
		formData.append('category', category)
		formData.append('price', price)
		formData.append('status', status)
		formData.append('image', imageFile)

		try {
			const res = await fetch('http://localhost:3006/api/mahsulotlar', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			const result = await res.json()
			if (!res.ok) throw new Error(result.message || 'Xatolik')

			alert(result.message || 'Mahsulot qo‘shildi')
			closeAddModal()
			loadProducts()
		} catch (err) {
			console.error('❌ Mahsulot qo‘shishda xatolik:', err)
			alert('Xatolik: ' + err.message)
		}
	})
})

// Mahsulot qidiruv funksiyasi
function filterProducts() {
	const search = document.getElementById('productSearch').value.toLowerCase()
	const rows = document.querySelectorAll('#productsTable tbody tr')

	rows.forEach(row => {
		const name = row.children[2].textContent.toLowerCase()
		row.style.display = name.includes(search) ? '' : 'none'
	})
}

// Mahsulotni o‘chirish
async function deleteProduct(id) {
	if (!confirm('Haqiqatan o‘chirmoqchimisiz?')) return

	try {
		const res = await fetch(`http://localhost:3006/api/products/${id}`, {
			method: 'DELETE',
		})

		const data = await res.json()
		alert(data.message)
		loadProducts() // qaytadan yuklash
	} catch (err) {
		alert('Xatolik yuz berdi: ' + err.message)
	}
}

// Mahsulotni Tahrirlash
function editProduct(id) {
	fetch(`http://localhost:3006/api/products/${id}`)
		.then(res => res.json())
		.then(product => {
			document.getElementById('editProductId').value = product.id
			document.getElementById('editProductName').value = product.name
			document.getElementById('editProductCategory').value = product.category
			document.getElementById('editProductPrice').value = product.price
			document.getElementById('editProductStatus').value = product.status
			document.getElementById('editProductImageUrl').value =
				product.image_url || ''

			document.getElementById('editModal').style.display = 'flex'
		})
		.catch(err => alert('Xatolik: ' + err.message))
}

function closeEditModal() {
	document.getElementById('editModal').style.display = 'none'
}

document.getElementById('editForm').addEventListener('submit', async e => {
	e.preventDefault()

	const id = document.getElementById('editProductId').value
	const updatedProduct = {
		name: document.getElementById('editProductName').value,
		category: document.getElementById('editProductCategory').value,
		price: +document.getElementById('editProductPrice').value,
		status: document.getElementById('editProductStatus').value,
		image_url: document.getElementById('editProductImageUrl').value, // ✅ Qo‘shildi
	}

	try {
		const res = await fetch(`http://localhost:3006/api/products/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedProduct),
		})

		const data = await res.json()
		alert(data.message)
		closeEditModal()
		loadProducts()
	} catch (err) {
		alert('Xatolik: ' + err.message)
	}
})

// ✅ Sidebar
document.addEventListener('DOMContentLoaded', () => {
	console.log('✅ Admin panel JS ishga tushdi')

	const menuItems = [
		{ buttonId: 'dashboardBtn', contentId: 'dashboardContent' },
		{ buttonId: 'locationOrdersBtn', contentId: 'locationOrdersContent' },
		{ buttonId: 'productOrdersBtn', contentId: 'productOrdersContent' },
		{ buttonId: 'productsBtn', contentId: 'productsContent' },
		{ buttonId: 'usersBtn', contentId: 'usersContent' },
		{ buttonId: 'employeesBtn', contentId: 'employeeSection' },
		{ buttonId: 'adminProfileBtn', contentId: 'adminProfileSection' },
		{ buttonId: 'settingsBtn', contentId: 'settingsContent' },
	]

	const sidebarItems = document.querySelectorAll('.sidebar-item')
	const allSections = [
		'dashboardContent',
		'locationOrdersContent',
		'productOrdersContent',
		'productsContent',
		'usersContent',
		'employeeSection',
		'adminProfileSection',
		'settingsContent',
	]

	function hideAllSections() {
		allSections.forEach(id => {
			const section = document.getElementById(id)
			if (section) section.style.display = 'none'
		})
	}

	function removeActiveClasses() {
		sidebarItems.forEach(item => item.classList.remove('active'))
	}

	menuItems.forEach(({ buttonId, contentId }) => {
		const btn = document.getElementById(buttonId)
		const content = document.getElementById(contentId)

		if (btn && content) {
			btn.addEventListener('click', () => {
				console.log(`➡️ ${buttonId} bosildi => ${contentId} ochilmoqda`)

				hideAllSections()
				removeActiveClasses()

				btn.classList.add('active')
				content.style.display = 'block'
			})
		}
	})

	if (btn && content) {
		btn.addEventListener('click', () => {
			console.log(`➡️ ${buttonId} bosildi => ${contentId} ochilmoqda`)

			hideAllSections()
			removeActiveClasses()

			btn.classList.add('active')
			content.style.display = 'block'

			if (buttonId === 'adminProfileBtn') {
				showAdminProfile()
			}
		})
	}

	// Sahifa yuklanganda dashboard bo‘limini ko‘rsatish
	hideAllSections()
	const defaultContent = document.getElementById('dashboardContent')
	if (defaultContent) defaultContent.style.display = 'block'
})

// ✅ Admin Ma'lumotlari
document.addEventListener('DOMContentLoaded', () => {
	const adminToken = localStorage.getItem('auth_token')

	// 🔐 Token yoki admin emas bo‘lsa — login sahifaga yo‘naltiramiz
	if (!adminToken || !isAdmin) {
		alert('❌ Sizda admin panelga kirish huquqi yo‘q!')
		window.location.href = '../html/login.html'
		return
	}

	// ✅ SAHIFA YUKLANGANDA PROFILNI KO‘RSATISH
	showAdminProfile()

	// 🔁 PROFILNI CHIQARISH
	async function showAdminProfile() {
		try {
			const res = await fetch('http://localhost:3003/api/admin/profile', {
				headers: { Authorization: `Bearer ${adminToken}` },
			})
			if (!res.ok) throw new Error("Foydalanuvchi ma'lumotlari olinmadi")

			const admin = await res.json()

			document.getElementById('adminName').textContent = admin.ism
			document.getElementById('adminEmail').textContent = admin.email
			document.getElementById('adminLogin').textContent = admin.login
			document.getElementById('adminPhone').textContent = admin.telefon || '—'
			document.getElementById('adminAddress').textContent = admin.manzil || '—'
			document.getElementById('adminRole').textContent = 'Admin'
			document.getElementById('adminAvatar').src =
				admin.avatar || 'default-avatar.png'

			document.getElementById('adminProfileSection').style.display = 'block'
		} catch (err) {
			console.error('❌ Profil yuklanmadi:', err.message)
			alert(err.message)
		}
	}

	// ✏️ PROFIL MODALINI OCHISH
	document.getElementById('editProfileBtn').onclick = () => {
		const modal = new bootstrap.Modal(
			document.getElementById('editProfileModal')
		)

		document.getElementById('editName').value =
			document.getElementById('adminName').textContent
		document.getElementById('editEmail').value =
			document.getElementById('adminEmail').textContent
		document.getElementById('editPhone').value =
			document.getElementById('adminPhone').textContent
		document.getElementById('editAddress').value =
			document.getElementById('adminAddress').textContent

		modal.show()
	}

	// 🔄 PROFILNI YANGILASH
	document
		.getElementById('editProfileForm')
		.addEventListener('submit', async e => {
			e.preventDefault()

			const ism = document.getElementById('editName').value
			const email = document.getElementById('editEmail').value
			const telefon = document.getElementById('editPhone').value
			const manzil = document.getElementById('editAddress').value

			try {
				const res = await fetch(
					'http://localhost:3003/api/admin/profile/update',
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${adminToken}`,
						},
						body: JSON.stringify({ ism, email, telefon, manzil }),
					}
				)
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Xatolik!')
				alert('✅ Profil yangilandi!')
				bootstrap.Modal.getInstance(
					document.getElementById('editProfileModal')
				).hide()
				showAdminProfile()
			} catch (err) {
				alert(err.message)
			}
		})

	// 🖼️ AVATAR MODALINI OCHISH
	document.getElementById('changeAvatarBtn').onclick = () => {
		new bootstrap.Modal(document.getElementById('avatarModal')).show()
	}

	// 📤 AVATARNI YUKLASH
	document.getElementById('avatarForm').addEventListener('submit', async e => {
		e.preventDefault()
		const formData = new FormData(e.target)

		try {
			const res = await fetch('http://localhost:3003/api/admin/avatar', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
				body: formData,
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Xatolik!')
			alert('✅ Avatar yangilandi!')
			bootstrap.Modal.getInstance(document.getElementById('avatarModal')).hide()
			showAdminProfile()
		} catch (err) {
			alert(err.message)
		}
	})

	// 🔐 PAROL MODALINI OCHISH
	document.getElementById('changePasswordBtn').onclick = () => {
		new bootstrap.Modal(document.getElementById('changePasswordModal')).show()
	}

	// 🔒 PAROLNI O‘ZGARTIRISH
	document
		.getElementById('changePasswordForm')
		.addEventListener('submit', async e => {
			e.preventDefault()

			const oldPassword = document.getElementById('oldPassword').value
			const newPassword = document.getElementById('newPassword').value
			const confirmPassword = document.getElementById('confirmPassword').value

			if (newPassword !== confirmPassword) {
				alert('Parollar mos emas!')
				return
			}

			try {
				const res = await fetch(
					'http://localhost:3003/api/admin/change-password',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${adminToken}`,
						},
						body: JSON.stringify({ oldPassword, newPassword }),
					}
				)
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Xatolik!')
				alert('✅ Parol yangilandi!')
				bootstrap.Modal.getInstance(
					document.getElementById('changePasswordModal')
				).hide()
			} catch (err) {
				alert(err.message)
			}
		})
})
