document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Cart Functionality ---
    let count = 0;
    const cartCountElement = document.getElementById('cart-count');
    const productCards = document.querySelectorAll('.product-card');

    // helper that centralizes cart logic
    function addToCart(card) {
        count++;
        if (cartCountElement) cartCountElement.innerText = count;
        const productName = card.querySelector('h3').innerText;
        showNotification(`${productName} added to cart!`);
    }

    productCards.forEach(card => {
        card.style.cursor = 'pointer';

        // if card has a specific button, listen separately so we can stop propagation
        const btn = card.querySelector('button');
        if (btn) {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                addToCart(card);
            });
        }

        card.addEventListener('click', () => addToCart(card));
    });

    // --- 2. Sticky Header Effect ---
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

    // --- 1a. Shop filtering (only present on shop page) ---
    const filterButtons = document.querySelectorAll('.filters button');
    if (filterButtons.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.innerText.toLowerCase();
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                productCards.forEach(card => {
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

    // --- 3. Newsletter Submission ---
    const newsletterBtn = document.querySelector('.newsletter button');
    const emailInput = document.querySelector('.newsletter input');

    newsletterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value;

        if (validateEmail(email)) {
            alert(`Thanks for joining, ${email}! Your 15% discount code is: BRIGHT15`);
            emailInput.value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });

    // --- Helper Functions ---
    function validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }

    function showNotification(message) {
        // Simple toast notification logic
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
});
