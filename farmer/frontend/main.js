document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. GLOBAL SETUP & AUTHENTICATION STATE
    // =================================================================
    const API_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const navActions = document.getElementById('nav-actions');

    // Function to check login state and update UI
    const checkAuthState = () => {
        if (token) {
            // User is logged in
            navActions.innerHTML = `
                <a href="#" class="btn btn-secondary" id="logout-btn">Logout</a>
                <a href="#" class="cart-icon" id="cart-icon"><i class="fas fa-shopping-cart"></i></a>
            `;
            addLogoutEventListener();
            addCartIconEventListener();
            fetchCart(); // Fetch cart for logged in user
        } else {
            // User is logged out
            navActions.innerHTML = `
                <a href="#" class="btn btn-secondary" id="login-btn">Login</a>
                <a href="#" class="btn btn-primary" id="signup-btn">Sign Up</a>
            `;
            addLoginSignupEventListeners();
        }
    };
    
    // =================================================================
    // 2. INITIALIZATION AND CORE EVENT LISTENERS
    // =================================================================
    AOS.init({ duration: 1000, once: true });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initial check for authentication state
    checkAuthState();
    getProducts();
    addContactFormListener();
    addCtaSignupListeners();

    // =================================================================
    // 3. AUTHENTICATION (LOGIN, LOGOUT, SIGNUP)
    // =================================================================
    function addLoginSignupEventListeners() {
        document.getElementById('login-btn')?.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
        document.getElementById('signup-btn')?.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); });
    }

    function addLogoutEventListener() {
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            alert('You have been logged out.');
            window.location.reload(); // Refresh to update state
        });
    }

    const signupForm = document.getElementById('signup-form');
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(${API_URL}/auth/register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Failed to register');
            
            alert('Registration successful! Please log in.');
            document.getElementById('show-login').click(); // Switch to login modal
        } catch (error) {
            alert(Error: ${error.message});
        }
    });

    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch(${API_URL}/auth/login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Login failed');

            localStorage.setItem('token', result.token);
            alert('Login successful!');
            window.location.reload(); // Refresh page to update UI and fetch data
        } catch (error) {
            alert(Error: ${error.message});
        }
    });
    
    // =================================================================
    // 4. PRODUCT & CART INTERACTION
    // =================================================================
    const productGrid = document.getElementById('product-grid');

    async function getProducts() {
        if (!productGrid) return;
        try {
            const response = await fetch(${API_URL}/products);
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();
            
            if (products.length === 0) {
                productGrid.innerHTML = '<p>No products available right now.</p>';
                return;
            }
            productGrid.innerHTML = products.map(product => `
                <div class="product-card" data-aos="fade-up">
                    <img src="${product.imageUrl || 'images/default-product.jpg'}" alt="${product.name}" class="product-image">
                    <div class="product-content">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-farmer"><i class="fas fa-user-check"></i> ${product.farmer?.name || 'KrishiMitra Farm'}</p>
                        <div class="product-footer">
                            <p class="product-price">₹${product.price} <span>/ ${product.unit}</span></p>
                            <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            productGrid.innerHTML = '<p>Sorry, we could not load the products.</p>';
        }
    }
    
    // Use event delegation for dynamically created "Add to Cart" buttons
    productGrid?.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            if (!token) {
                alert('Please log in to add items to your cart.');
                openModal(loginModal);
                return;
            }
            const productId = e.target.dataset.productId;
            try {
                const response = await fetch(${API_URL}/cart, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ productId: productId, quantity: 1 }),
                });
                if (!response.ok) throw new Error('Failed to add item.');
                
                alert('Item added to cart!');
                fetchCart(); // Refresh cart data
            } catch (error) {
                alert(Error: ${error.message});
            }
        }
    });

    // =================================================================
    // 5. CART MODAL MANAGEMENT
    // =================================================================
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total');

    function addCartIconEventListener() {
        document.getElementById('cart-icon')?.addEventListener('click', (e) => { e.preventDefault(); cartModal.classList.add('active'); });
    }

    async function fetchCart() {
        if (!token) return;
        try {
            const response = await fetch(${API_URL}/cart, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Could not fetch cart.');
            const cartItems = await response.json();
            renderCart(cartItems);
        } catch (error) {
            console.error(error.message);
        }
    }
    
    function renderCart(cartItems) {
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is currently empty.</p>';
            cartTotalSpan.textContent = '0.00';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <span>${item.product.name} (x${item.quantity})</span>
                    <span>₹${itemTotal.toFixed(2)}</span>
                    <button class="remove-from-cart-btn" data-product-id="${item.product._id}">&times;</button>
                </div>
            `;
        }).join('');
        cartTotalSpan.textContent = total.toFixed(2);
    }
    
    cartItemsContainer?.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const productId = e.target.dataset.productId;
            try {
                const response = await fetch(${API_URL}/cart/${productId}, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) throw new Error('Failed to remove item.');
                const updatedCart = await response.json();
                renderCart(updatedCart);
            } catch (error) {
                alert(Error: ${error.message});
            }
        }
    });

    // =================================================================
    // 6. CONTACT FORM
    // =================================================================
    function addContactFormListener() {
        const contactForm = document.querySelector('.contact-page-section .contact-form');
        contactForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: contactForm.querySelector('input[type="text"]').value,
                email: contactForm.querySelector('input[type="email"]').value,
                message: contactForm.querySelector('textarea').value
            };
            try {
                const response = await fetch(${API_URL}/contact, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg || 'Failed to send message.');
                
                alert(result.msg);
                contactForm.reset();
            } catch(error) {
                alert(Error: ${error.message});
            }
        });
    }

    // =================================================================
    // 7. MISC & MODAL HELPERS
    // =================================================================
    const authModalOverlay = document.getElementById('auth-modal-overlay');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    const openModal = (modal) => { authModalOverlay.classList.add('active'); modal.style.display = 'block'; };
    const closeModal = () => { authModalOverlay.classList.remove('active'); loginModal.style.display = 'none'; signupModal.style.display = 'none'; };

    document.getElementById('show-signup')?.addEventListener('click', (e) => { e.preventDefault(); loginModal.style.display = 'none'; signupModal.style.display = 'block'; });
    document.getElementById('show-login')?.addEventListener('click', (e) => { e.preventDefault(); signupModal.style.display = 'none'; loginModal.style.display = 'block'; });
    authModalOverlay?.addEventListener('click', (e) => { if (e.target === authModalOverlay) closeModal(); });
    document.getElementById('close-login-modal')?.addEventListener('click', closeModal);
    document.getElementById('close-signup-modal')?.addEventListener('click', closeModal);
    
    const closeCartBtn = document.getElementById('close-cart-btn');
    closeCartBtn?.addEventListener('click', () => cartModal.classList.remove('active'));
    cartModal?.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.classList.remove('active'); });

    function addCtaSignupListeners() {
        document.getElementById('farmer-signup-btn')?.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); document.querySelector('#signup-form select').value = 'farmer'; });
        document.getElementById('buyer-signup-btn')?.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); document.querySelector('#signup-form select').value = 'buyer'; });
    }
});
