document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');
    let cartCount = 0;
    let cart = [];

    // --- product storage helpers (server-backed) ---
    async function fetchProducts() {
        const headers = {};
        const token = sessionStorage.getItem('adminToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/products', { headers });
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
    }

    async function saveProduct(prod) {
        const headers = {'Content-Type': 'application/json'};
        const token = sessionStorage.getItem('adminToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/products', {
            method: 'POST',
            headers,
            body: JSON.stringify(prod)
        });
        if (!res.ok) {
            let message = 'Failed to save product';
            try {
                const body = await res.json();
                message = body.error || message;
            } catch {}
            console.error('saveProduct error', res.status, message);
            throw new Error(message);
        }
        return res.json();
    }

    async function deleteProduct(productId) {
        const headers = {};
        const token = sessionStorage.getItem('adminToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Failed to delete product');
        return res.json();
    }

    // --- order helpers (server-backed) ---
    async function fetchOrders() {
        const headers = {};
        const token = sessionStorage.getItem('adminToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/orders', { headers });
        if (!res.ok) throw new Error('Failed to load orders');
        return res.json();
    }

    async function saveOrder(order) {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Failed to save order');
        return res.json();
    }

    // load products data from server and render pages
    fetchProducts()
        .then(products => {
            renderShop(products);
            renderTrending(products);
        })
        .catch(err => console.error('Failed to load products:', err));

    // sticky header remains unchanged
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.boxShadow = 'none';
        }
    });

    // newsletter submission
    const newsletterBtn = document.querySelector('.newsletter button');
    const emailInput = document.querySelector('.newsletter input');

    if (newsletterBtn && emailInput) {
        newsletterBtn.addEventListener('click', e => {
            e.preventDefault();
            const email = emailInput.value;

            if (validateEmail(email)) {
                alert(`Thanks for joining, ${email}! Your 15% discount code is: BRIGHT15`);
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // ---------- rendering helpers ----------
    function renderShop(products) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        products.forEach(p => grid.appendChild(createCard(p)));
        const cards = grid.querySelectorAll('.product-card');
        attachCardListeners(cards);
        attachFilterLogic(cards);
    }

    function renderTrending(products) {
        const grid = document.getElementById('trending-grid');
        if (!grid) return;

        products
            .filter(p => p.trending)
            .forEach(p => grid.appendChild(createCard(p)));

        const cards = grid.querySelectorAll('.product-card');
        attachCardListeners(cards);
    }

    function createCard(p) {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.dataset.category = p.category;
        if (p.sale) div.dataset.sale = 'true';

        div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">$${p.price.toFixed(2)}</p>
      <button class="btn btn-small">Add to Cart</button>
    `;
        return div;
    }

    function attachCardListeners(cardNodes) {
        cardNodes.forEach(card => {
            card.style.cursor = 'pointer';
            const btn = card.querySelector('button');
            const addToCart = () => {
                const productName = card.querySelector('h3').innerText;
                const productPrice = parseFloat(card.querySelector('.price').innerText.replace('$', ''));
                
                cartCount++;
                if (cartCountElement) cartCountElement.innerText = cartCount;
                
                // add or increment existing item in cart
                const existing = cart.find(item => item.name === productName && item.price === productPrice);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name: productName, price: productPrice, quantity: 1 });
                }
                
                showNotification(`${productName} added to cart!`);
            };

            if (btn) {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    addToCart();
                });
            }
            card.addEventListener('click', addToCart);
        });
    }

    function attachFilterLogic(cardNodes) {
        const filterButtons = document.querySelectorAll('.filters button');
        if (!filterButtons.length) return;

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.innerText.toLowerCase();
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                cardNodes.forEach(card => {
                    const cardCat = card.dataset.category;
                    const onSale = card.dataset.sale === 'true';
                    if (
                        category === 'all' ||
                        cardCat === category ||
                        (category === 'sale' && onSale)
                    ) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- helper utilities ---
    function validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }

    function showNotification(message) {
        const toast = document.createElement('div');
        toast.innerText = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1a1a1a;
            color: #fff;
            padding: 12px 25px;
            border-radius: 5px;
            font-size: 0.9rem;
            z-index: 10000;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // ---------- admin page logic / secure login ----------
    const ADMIN_PASSWORD = '505060'; // change as needed; not truly secure in static site
    const adminForm = document.getElementById('admin-form');
    const adminFeedback = document.getElementById('admin-feedback');
    const adminList = document.getElementById('admin-list');
    const loginSection = document.getElementById('login-section');
    const loginBtn = document.getElementById('admin-login-btn');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    async function renderAdminList() {
        if (!adminList) return;
        // clear old items (keep heading)
        [...adminList.querySelectorAll('div')].forEach(n => n.remove());
        let products = [];
        try {
            products = await fetchProducts();
        } catch (e) {
            adminList.innerHTML = '<p style="color: red;">Could not load products.</p>';
            return;
        }
        
        products.forEach(p => {
            const row = document.createElement('div');
            row.style.cssText = 'padding: 10px; border: 1px solid #ddd; margin-bottom: 8px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;';
            
            const info = document.createElement('span');
            info.innerText = `${p.name} - $${p.price.toFixed(2)} (${p.category})`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small';
            deleteBtn.innerText = 'Delete';
            deleteBtn.style.cssText = 'background: #d32f2f; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;';
            deleteBtn.addEventListener('click', async () => {
                if (confirm(`Delete "${p.name}"?`)) {
                    try {
                        await deleteProduct(p.id);
                        renderAdminList();
                        location.reload();
                    } catch (err) {
                        alert('Failed to delete product');
                    }
                }
            });
            
            row.appendChild(info);
            row.appendChild(deleteBtn);
            adminList.appendChild(row);
        });
    }

    async function renderOrdersList() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        ordersList.innerHTML = '';
        let orders = [];
        try {
            orders = await fetchOrders();
        } catch (e) {
            ordersList.innerHTML = '<p style="color: red;">Could not retrieve orders.</p>';
            return;
        }
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #999;">No orders yet.</p>';
            return;
        }

        orders.forEach((order, idx) => {
            const orderDiv = document.createElement('div');
            orderDiv.style.cssText = 'padding: 15px; border: 1px solid #ddd; margin-bottom: 15px; border-radius: 5px; background: #f9f9f9;';
            
            const items = order.items.map(item => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');
            
            orderDiv.innerHTML = `
                <strong>Order #${idx + 1}</strong><br>
                <small style="color: #999;">Date: ${new Date(order.timestamp).toLocaleString()}</small><br>
                <strong>Customer Email:</strong> ${order.email}<br>
                <strong>Items:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">${items}</ul>
                <strong>Total: $${order.total.toFixed(2)}</strong>
            `;
            ordersList.appendChild(orderDiv);
        });
    }

    function showAdminInterface() {
        if (loginSection) loginSection.style.display = 'none';
        if (adminForm) adminForm.style.display = '';
        const authHeader = document.getElementById('auth-header');
        if (authHeader) authHeader.style.display = '';
        setupLogout();
        renderAdminList();
        renderOrdersList();
    }

    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('adminToken');
                location.reload();
            });
        }
    }

    if (loginSection && loginBtn && passwordInput) {
        const existingToken = sessionStorage.getItem('adminToken');
        if (existingToken) {
            showAdminInterface();
        } else {
            loginBtn.addEventListener('click', async e => {
                e.preventDefault();
                const val = passwordInput.value;
                try {
                    const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: val })
                    });
                    if (!res.ok) {
                        const errBody = await res.json().catch(() => ({}));
                        throw new Error(errBody.error || 'Login failed');
                    }
                    const { token } = await res.json();
                    sessionStorage.setItem('adminToken', token);
                    showAdminInterface();
                } catch (err) {
                    console.error('login error', err);
                    loginError.innerText = 'Incorrect password';
                }
            });
        }
    }

    // Image file preview
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    let uploadedImageData = null;

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    uploadedImageData = event.target.result;
                    if (imagePreview) {
                        imagePreview.innerHTML = `<img src="${uploadedImageData}" style="max-width: 100%; border-radius: 5px;">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', async e => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const price = parseFloat(document.getElementById('price').value);
            const category = document.getElementById('category').value;
            const sale = document.getElementById('sale').checked;
            const trending = document.getElementById('trending').checked;

            if (!name || !uploadedImageData || isNaN(price)) {
                adminFeedback.innerText = 'Please fill out the required fields and upload an image.';
                return;
            }

            const newProd = {
                id: Date.now(),
                name,
                price,
                category,
                sale,
                trending,
                image: uploadedImageData
            };

            try {
                await saveProduct(newProd);
                adminFeedback.innerText = 'Product added!';
                adminForm.reset();
                uploadedImageData = null;
                if (imagePreview) imagePreview.innerHTML = '';
                renderAdminList();
                // reload any open page to reflect new product globally
                location.reload();
            } catch (err) {
                console.error('product save failed', err);
                adminFeedback.innerText = `Error: ${err.message}`;
            }
        });
    }

    // Create checkout button on shop page
    const shopPage = document.querySelector('.shop-page');
    if (shopPage) {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'btn';
        checkoutBtn.id = 'checkout-btn';
        checkoutBtn.innerText = 'Checkout';
        checkoutBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; padding: 12px 25px; background: #1a1a1a; color: white;';
        
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            const email = prompt('Please enter your email to complete the order:');
            if (!email) return;

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const order = {
                email,
                items: cart, // already has quantity
                total,
                timestamp: new Date().toISOString()
            };

            saveOrder(order);
            cart = [];
            cartCount = 0;
            if (cartCountElement) cartCountElement.innerText = cartCount;
            
            // Refresh orders display if admin page is open
            renderOrdersList();
            
            alert(`Order placed! Total: $${total.toFixed(2)}\n\nOrder confirmation sent to ${email}`);
        });

        document.body.appendChild(checkoutBtn);
    }

    // Display orders on admin page
    renderOrdersList();
});

