class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('mashaani_cart')) || [];
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {

        document.body.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-cart-btn');
            if (addBtn) {

                addBtn.disabled = true;

                const product = {
                    id: addBtn.dataset.id || Date.now(),
                    title: addBtn.dataset.title || 'Product',
                    price: parseFloat(addBtn.dataset.price) || 0,
                    image: addBtn.dataset.image || '../assests/mashaani.webp',
                    qty: 1,
                    size: 'M',
                    color: '#8b4513'
                };

                this.addItem(product);

                const cartDrawer = document.getElementById('cartDrawer');
                const cartOverlay = document.getElementById('cartOverlay');
                if (cartDrawer && cartOverlay) {
                    cartDrawer.classList.add('active');
                    cartOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                setTimeout(() => addBtn.disabled = false, 500);
            }

            const target = e.target;

            if (target.closest('.remove-item')) {
                const card = target.closest('.cart-item-card');
                const id = card.dataset.id;
                this.removeItem(id);
            }

            if (target.classList.contains('qty-btn')) {
                const card = target.closest('.cart-item-card');
                const id = card.dataset.id;
                const isPlus = target.classList.contains('plus');
                this.updateQuantity(id, isPlus ? 1 : -1);
            }
        });
    }

    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push(product);
        }
        this.save();
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id != id);
        this.save();
    }

    updateQuantity(id, delta) {
        const item = this.items.find(item => item.id == id);
        if (item) {
            item.qty += delta;
            if (item.qty < 1) {
                this.removeItem(id);
            } else {
                this.save();
            }
        }
    }

    save() {
        localStorage.setItem('mashaani_cart', JSON.stringify(this.items));
        this.updateUI();
    }

    updateUI() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.items.reduce((acc, item) => acc + item.qty, 0);
        cartCountElements.forEach(el => el.textContent = count);

        const cartBody = document.querySelector('.cart-body');
        const totalPriceEl = document.querySelector('.total-amount');
        const subtotalEl = document.querySelector('.subtotal-amount');

        if (cartBody) {
            if (this.items.length === 0) {
                cartBody.innerHTML = `
                    <div class="empty-cart-state">
                        <div class="empty-cart-icon">
                            <i class="fa-solid fa-basket-shopping"></i>
                        </div>
                        <h3 class="empty-cart-title">Your cart is empty</h3>
                        <p class="empty-cart-text">Start adding some amazing products!</p>
                    </div>
                `;
                if (totalPriceEl) totalPriceEl.textContent = '₹0';
                if (subtotalEl) subtotalEl.textContent = '₹0';
                const shippingStatus = document.querySelector('.shipping-status');
                if (shippingStatus) shippingStatus.style.display = 'none';
            } else {
                let total = 0;
                let html = '<div class="cart-items-list">';

                this.items.forEach(item => {
                    total += (item.price * item.qty);
                    const imgSrc = item.image.startsWith('http') ? item.image : (window.location.pathname.includes('/pages/') ? '../' : '') + item.image;
                    html += `
                        <div class="cart-item-card" data-id="${item.id}">
                            <span class="remove-item"><i class="fas fa-times"></i></span>
                            <img src="${imgSrc}" alt="${item.title}" class="cart-item-img">
                            <div class="cart-item-info">
                                <h3 class="cart-item-title">${item.title}</h3>
                                <div class="cart-item-meta">
                                    <span>Size: ${item.size}</span> |
                                    <span>Color: <span class="color-dot" style="background-color: ${item.color};"></span></span>
                                </div>
                                <div class="cart-item-controls">
                                    <div class="qty-selector">
                                        <button class="qty-btn minus">-</button>
                                        <input type="text" class="qty-input" value="${item.qty}" readonly>
                                        <button class="qty-btn plus">+</button>
                                    </div>
                                    <span class="cart-item-price">₹${item.price * item.qty}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += '</div>';
                cartBody.innerHTML = html;

                if (totalPriceEl) totalPriceEl.textContent = `₹${total}`;
                if (subtotalEl) subtotalEl.textContent = `₹${total}`;
                const shippingStatus = document.querySelector('.shipping-status');
                if (shippingStatus) shippingStatus.style.display = total > 0 ? 'flex' : 'none';
            }
        }

        const fullCartSection = document.querySelector('.cart-items-section');
        const orderSummary = document.querySelector('.order-summary-card');

        if (fullCartSection) {
            if (this.items.length === 0) {
                fullCartSection.innerHTML = `
                    <div class="empty-cart-message" style="text-align: center; padding: 50px 20px;">
                        <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                        <h2>Your cart is currently empty</h2>
                        <p>Browse our collections to find something you love!</p>
                        <a href="shopAll.html" class="btn btn-primary" style="display:inline-block; margin-top:20px; text-decoration:none; padding:12px 30px; background:#8b4513; color:#fff; border-radius:4px;">Continue Shopping</a>
                    </div>
                `;
                if (orderSummary) orderSummary.style.display = 'none';
            } else {
                if (orderSummary) orderSummary.style.display = 'block';

                let total = 0;
                let html = `
                    <div class="section-header">
                        <h2 class="section-title">Cart Items (${this.items.length})</h2>
                        <a href="#" class="clear-all" onclick="window.cart.clearCart(); return false;">Clear All</a>
                    </div>
                `;

                this.items.forEach(item => {
                    const itemTotal = item.price * item.qty;
                    total += itemTotal;
                    const imgSrc = item.image.startsWith('http') ? item.image : (window.location.pathname.includes('/pages/') ? '../' : '') + item.image;

                    html += `
                        <div class="cart-item-full cart-item-card" data-id="${item.id}">
                            <img src="${imgSrc}" alt="${item.title}" class="item-img-large">
                            <div class="item-info-full">
                                <span class="item-cat">Product</span>
                                <h3 class="item-title-full">${item.title}</h3>
                                <div class="item-tags">
                                    <div class="item-tag">Size: ${item.size}</div>
                                    <div class="item-tag">Color: <span class="color-dot" style="background-color: ${item.color};"></span></div>
                                </div>
                                <div class="item-details-row">
                                    <div class="qty-wrap">
                                        <span class="qty-label">Qty:</span>
                                        <div class="qty-selector">
                                            <button class="qty-btn minus">-</button>
                                            <input type="text" class="qty-input" value="${item.qty}" readonly>
                                            <button class="qty-btn plus">+</button>
                                        </div>
                                    </div>
                                    <div class="price-wrap">
                                        <span class="main-price">₹${itemTotal}</span>
                                        <span class="sub-price">₹${item.price} each</span>
                                    </div>
                                </div>
                            </div>
                            <span class="remove-item" style="top: 25px; right: 25px;"><i class="fas fa-times"></i></span>
                        </div>
                    `;
                });

                fullCartSection.innerHTML = html;

                if (orderSummary) {
                    const subtotalEl = orderSummary.querySelector('.summary-row:first-of-type span:last-child');
                    const totalEl = orderSummary.querySelector('.total-val');
                    const shippingEl = orderSummary.querySelector('.summary-row:nth-child(3) span:last-child');
                    const taxEl = orderSummary.querySelector('.summary-row:nth-child(4) span:last-child');

                    const tax = Math.round(total * 0.08);
                    const finalTotal = total + tax;

                    if (subtotalEl) subtotalEl.textContent = `₹${total}`;
                    if (taxEl) taxEl.textContent = `₹${tax}`;
                    if (totalEl) totalEl.textContent = `₹${finalTotal}`;
                }
            }
        }
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            this.items = [];
            this.save();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cart = new CartManager();
});
