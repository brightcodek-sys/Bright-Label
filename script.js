document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');
    let cartCount = 0;

    // --- product storage helpers (used by admin page) ---
    function loadStoredProducts() {
        const raw = localStorage.getItem('extraProducts');
        return raw ? JSON.parse(raw) : [];
    }

    function saveProduct(prod) {
        const arr = loadStoredProducts();
        arr.push(prod);
        localStorage.setItem('extraProducts', JSON.stringify(arr));
    }

    // load products data and render pages (merge with any stored extras)
    fetch('products.json')
        .then(res => res.json())
        .then(products => {
            const extras = loadStoredProducts();
            const allProducts = products.concat(extras);
            renderShop(allProducts);
            renderTrending(allProducts);
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
                cartCount++;
                if (cartCountElement) cartCountElement.innerText = cartCount;
                showNotification(`${card.querySelector('h3').innerText} added to cart!`);
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

    function renderAdminList() {
        if (!adminList) return;
        // clear old items (keep heading)
        [...adminList.querySelectorAll('div')].forEach(n => n.remove());
        loadStoredProducts().forEach(p => {
            const row = document.createElement('div');
            row.innerText = `${p.name} - $${p.price.toFixed(2)}`;
            adminList.appendChild(row);
        });
    }

    function showAdminInterface() {
        if (loginSection) loginSection.style.display = 'none';
        if (adminForm) adminForm.style.display = '';
        renderAdminList();
    }

    if (loginSection && loginBtn && passwordInput) {
        // already authenticated?
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            showAdminInterface();
        } else {
            loginBtn.addEventListener('click', e => {
                e.preventDefault();
                const val = passwordInput.value;
                if (val === ADMIN_PASSWORD) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    showAdminInterface();
                } else {
                    loginError.innerText = 'Incorrect password';
                }
            });
        }
    }

    if (adminForm) {
        adminForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const price = parseFloat(document.getElementById('price').value);
            const category = document.getElementById('category').value;
            const sale = document.getElementById('sale').checked;
            const trending = document.getElementById('trending').checked;
            const image = document.getElementById('image').value.trim();

            if (!name || !image || isNaN(price)) {
                adminFeedback.innerText = 'Please fill out the required fields.';
                return;
            }

            const newProd = {
                id: Date.now(),
                name,
                price,
                category,
                sale,
                trending,
                image
            };

            saveProduct(newProd);
            adminFeedback.innerText = 'Product added!';
            adminForm.reset();
            renderAdminList();
        });
    }
});
