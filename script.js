// ===== Si LOUNGE - Customer Menu Script =====

// Global Variables
let currentLang = 'fa';
let currentCategory = 'all';
let cart = [];
let tableNumber = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Load language preference
    currentLang = Storage.getLanguage() || 'fa';
    updateLanguageDisplay();
    
    // Load table number
    tableNumber = Storage.getTableNumber();
    updateTableDisplay();
    
    // Load cart
    cart = Storage.getCart();
    updateCart();
    
    // Load menu items
    loadMenuItems();
    
    // Generate QR code با تأخیر بیشتر
    setTimeout(() => {
        generateQRCode();
    }, 1000);
    
    // Update all texts based on language
    updateTexts();
    
    // Show table modal if not set
    if (!tableNumber) {
        setTimeout(showTableModal, 1500);
    }
}

function setupEventListeners() {
    // Language dropdown
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        languageBtn.addEventListener('click', toggleLanguageMenu);
    }
    
    // Category tabs
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
        });
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', function(event) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartBtn = document.getElementById('cartBtn');
        
        if (cartSidebar && cartBtn && cartSidebar.classList.contains('show') && 
            !cartSidebar.contains(event.target) && 
            !cartBtn.contains(event.target)) {
            toggleCart();
        }
    });
    
    // Close language menu when clicking outside
    document.addEventListener('click', function(event) {
        const langBtn = document.getElementById('languageBtn');
        const langMenu = document.getElementById('languageMenu');
        
        if (langBtn && langMenu && langMenu.style.display === 'block' &&
            !langBtn.contains(event.target) && 
            !langMenu.contains(event.target)) {
            langMenu.style.display = 'none';
        }
    });
    
    // Table modal input - Enter key support
    const tableInput = document.getElementById('tableInput');
    if (tableInput) {
        tableInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveTableNumber();
            }
        });
    }
}

// ===== Language Functions =====
function updateLanguageDisplay() {
    const langNames = {
        fa: 'فارسی',
        ku: 'کوردی',
        en: 'English'
    };
    const currentLangElement = document.getElementById('currentLang');
    if (currentLangElement) {
        currentLangElement.textContent = langNames[currentLang] || 'فارسی';
    }
    
    // Update HTML attributes
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'en' ? 'ltr' : 'rtl';
}

function toggleLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    Storage.saveLanguage(lang);
    updateLanguageDisplay();
    updateTexts();
    loadMenuItems();
    updateCart();
    const languageMenu = document.getElementById('languageMenu');
    if (languageMenu) {
        languageMenu.style.display = 'none';
    }
}

function updateTexts() {
    // Translations
    const translations = {
        fa: {
            welcome: 'به Si LOUNGE خوش آمدید',
            subtitle: 'تجربه‌ای مدرن از طعم‌های اصیل',
            all: 'همه',
            food: 'غذاها',
            cafe: 'کافه بار',
            appetizer: 'پیش غذا',
            dessert: 'دسر',
            drink: 'نوشیدنی',
            table: 'میز',
            emptyMenu: 'هنوز محصولی اضافه نشده',
            emptyMenuDesc: 'مدیریت رستوران به زودی منو را تکمیل می‌کند'
        },
        ku: {
            welcome: 'بەخێربێیت بۆ Si LOUNGE',
            subtitle: 'ئەزموونێکی نوێ لە تامە سەرەتاییەکان',
            all: 'هەموو',
            food: 'خواردنەکان',
            cafe: 'کافە بار',
            appetizer: 'پێش خواردن',
            dessert: 'دێزێرت',
            drink: 'خواردنەوە',
            table: 'مێز',
            emptyMenu: 'هێشتا بەرهەمێک زیاد نەکراوە',
            emptyMenuDesc: 'بەڕێوەبەری چێشتخانە بەم زووانە مێنۆکە تەواو دەکات'
        },
        en: {
            welcome: 'Welcome to Si LOUNGE',
            subtitle: 'A modern experience of authentic flavors',
            all: 'All',
            food: 'Foods',
            cafe: 'Café Bar',
            appetizer: 'Appetizer',
            dessert: 'Dessert',
            drink: 'Drinks',
            table: 'Table',
            emptyMenu: 'No items added yet',
            emptyMenuDesc: 'Restaurant management will complete the menu soon'
        }
    };
    
    const t = translations[currentLang] || translations.fa;
    
    // Update specific elements
    const welcomeText = document.getElementById('welcomeText');
    const subtitleText = document.getElementById('subtitleText');
    
    if (welcomeText) welcomeText.textContent = t.welcome;
    if (subtitleText) subtitleText.textContent = t.subtitle;
    
    // Update category tabs
    const categories = ['all', 'food', 'cafe', 'appetizer', 'dessert', 'drink'];
    document.querySelectorAll('.cat-tab span').forEach((span, index) => {
        if (categories[index]) {
            span.textContent = t[categories[index]];
        }
    });
    
    // Update table display
    updateTableDisplay();
    
    // Update empty menu message
    const emptyMenu = document.getElementById('emptyMenu');
    if (emptyMenu) {
        const h3 = emptyMenu.querySelector('h3');
        const p = emptyMenu.querySelector('p');
        if (h3) h3.textContent = t.emptyMenu;
        if (p) p.textContent = t.emptyMenuDesc;
    }
}

// ===== Table Functions =====
function updateTableDisplay() {
    const tableDisplay = document.getElementById('tableDisplay');
    if (!tableDisplay) return;
    
    const t = {
        fa: 'میز',
        ku: 'مێز',
        en: 'Table'
    }[currentLang] || 'میز';
    
    if (tableNumber) {
        tableDisplay.textContent = `${t}: ${tableNumber}`;
    } else {
        tableDisplay.textContent = `${t}: ؟`;
    }
}

function showTableModal() {
    const tableModal = document.getElementById('tableModal');
    if (tableModal) {
        tableModal.classList.add('show');
        // Focus on input
        const tableInput = document.getElementById('tableInput');
        if (tableInput) {
            setTimeout(() => tableInput.focus(), 100);
        }
    }
}

function closeModal() {
    const tableModal = document.getElementById('tableModal');
    if (tableModal) {
        tableModal.classList.remove('show');
    }
}

function saveTableNumber() {
    const input = document.getElementById('tableInput');
    const value = input ? input.value.trim() : '';
    
    if (!value) {
        showNotification('لطفاً شماره میز را وارد کنید', 'error');
        return;
    }
    
    tableNumber = value;
    Storage.saveTableNumber(value);
    updateTableDisplay();
    closeModal();
    
    showNotification(
        currentLang === 'fa' ? `شماره میز ${value} ثبت شد` :
        currentLang === 'ku' ? `ژمارەی مێز ${value} تۆمارکرا` :
        `Table ${value} has been saved`,
        'success'
    );
}

// ===== Menu Functions =====
function loadMenuItems() {
    const menuGrid = document.getElementById('menuGrid');
    const emptyMenu = document.getElementById('emptyMenu');
    
    if (!menuGrid || !emptyMenu) return;
    
    let items = [];
    
    if (currentCategory === 'all') {
        items = Storage.getAllItems();
    } else {
        items = Storage.getItemsByCategory(currentCategory);
    }
    
    if (items.length === 0) {
        menuGrid.innerHTML = '';
        emptyMenu.style.display = 'block';
        return;
    }
    
    emptyMenu.style.display = 'none';
    menuGrid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        
        const imageContent = item.image ? 
            `<img src="${item.image}" alt="${item.name[currentLang] || item.name.fa}" style="width:100%;height:100%;object-fit:cover;">` :
            `<i class="fas fa-utensils"></i>`;
        
        card.innerHTML = `
            <div class="menu-image">
                ${imageContent}
            </div>
            <div class="menu-content">
                <h3>${item.name[currentLang] || item.name.fa}</h3>
                <p>${item.desc[currentLang] || item.desc.fa || 'بدون توضیحات'}</p>
                <div class="menu-footer">
                    <span class="price">${formatPrice(item.price)}</span>
                    <button class="add-to-cart" onclick="addToCart(${item.id})" title="افزودن به سبد">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        menuGrid.appendChild(card);
    });
}

function setActiveCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // Reload menu items
    loadMenuItems();
}

function formatPrice(price) {
    const formatted = price.toLocaleString('fa-IR');
    return `${formatted} تومان`;
}

// ===== Cart Functions =====
function addToCart(itemId) {
    const allItems = Storage.getAllItems();
    const item = allItems.find(i => i.id === itemId);
    
    if (!item) {
        showNotification('محصول یافت نشد', 'error');
        return;
    }
    
    // Check if item already in cart
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    // Save to storage
    Storage.saveCart(cart);
    
    // Update UI
    updateCart();
    
    // Show notification
    const itemName = item.name[currentLang] || item.name.fa;
    const messages = {
        fa: `${itemName} به سبد خرید اضافه شد`,
        ku: `${itemName} بۆ سەبەتەی داواکاری زیادکرا`,
        en: `${itemName} added to cart`
    };
    
    showNotification(messages[currentLang] || messages.fa, 'success');
    
    // Expand cart
    expandCart();
}

function updateCart() {
    const cartBadge = document.getElementById('cartBadge');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartEmpty = document.getElementById('cartEmpty');
    
    if (!cartBadge || !cartItems || !cartTotal || !cartEmpty) return;
    
    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Update cart items list
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.style.display = 'block';
        cartTotal.textContent = '۰';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartItems.innerHTML = '';
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name[currentLang] || item.name.fa}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateCartItem(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItem(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeCartItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(li);
    });
    
    // Update total
    cartTotal.textContent = totalPrice.toLocaleString('fa-IR');
}

function updateCartItem(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        removeCartItem(itemId);
    } else {
        Storage.saveCart(cart);
        updateCart();
    }
}

function removeCartItem(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    cart = cart.filter(item => item.id !== itemId);
    Storage.saveCart(cart);
    updateCart();
    
    const itemName = item.name[currentLang] || item.name.fa;
    showNotification(
        currentLang === 'fa' ? `${itemName} از سبد خرید حذف شد` :
        currentLang === 'ku' ? `${itemName} لە سەبەتە سڕدرایەوە` :
        `${itemName} removed from cart`,
        'info'
    );
}

function clearCart() {
    if (cart.length === 0) return;
    
    const message = {
        fa: 'آیا می‌خواهید سبد خرید را خالی کنید؟',
        ku: 'دەتەوێت سەبەتەی داواکاری بەتاڵ بکەیت؟',
        en: 'Do you want to clear your cart?'
    }[currentLang];
    
    if (confirm(message)) {
        cart = [];
        Storage.clearCart();
        updateCart();
        
        showNotification(
            currentLang === 'fa' ? 'سبد خرید خالی شد' :
            currentLang === 'ku' ? 'سەبەتەی داواکاری بەتاڵکرا' :
            'Cart cleared',
            'info'
        );
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

function expandCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('show')) {
        sidebar.classList.add('show');
    }
}

// ===== Order Functions =====
function submitOrder() {
    if (!tableNumber) {
        showNotification(
            currentLang === 'fa' ? 'لطفاً ابتدا شماره میز را وارد کنید' :
            currentLang === 'ku' ? 'تکایە سەرەتا ژمارەی مێزەکەت بنووسە' :
            'Please enter your table number first',
            'warning'
        );
        showTableModal();
        return;
    }
    
    if (cart.length === 0) {
        showNotification(
            currentLang === 'fa' ? 'سبد خرید شما خالی است' :
            currentLang === 'ku' ? 'سەبەتەی داواکاریتە بەتاڵە' :
            'Your cart is empty',
            'warning'
        );
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        table: tableNumber,
        items: cart.map(item => ({
            id: item.id,
            name: item.name[currentLang] || item.name.fa,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        timestamp: new Date().toISOString(),
        language: currentLang,
        status: 'pending'
    };
    
    // Save order
    Storage.saveOrder(order);
    
    // Clear cart
    cart = [];
    Storage.clearCart();
    updateCart();
    
    // Show success message
    const successMessages = {
        fa: `سفارش میز ${tableNumber} با موفقیت ثبت شد`,
        ku: `داواکاری میزی ${tableNumber} بە سەرکەوتوویی تۆمارکرا`,
        en: `Order for table ${tableNumber} has been placed successfully`
    };
    
    showNotification(successMessages[currentLang] || successMessages.fa, 'success');
    
    // Close cart
    toggleCart();
    
    // Log to console (for debugging)
    console.log('Order submitted:', order);
}

// ===== QR Code Functions (اصلاح شده) =====
function generateQRCode() {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (!qrContainer) return;
    
    // Get current URL
    const menuUrl = window.location.href;
    
    // Clear container
    qrContainer.innerHTML = '';
    
    // Check if QRCode library is available
    if (typeof QRCode !== 'undefined') {
        createRealQRCode(qrContainer, menuUrl);
    } else {
        console.warn('QRCode library not available, using fallback');
        createFallbackQRCode(qrContainer, menuUrl);
    }
}

function createRealQRCode(container, url) {
    try {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.id = 'qrCanvas';
        canvas.style.cssText = 'width: 160px; height: 160px; border-radius: 4px;';
        
        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            width: 180px;
            height: 180px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);
        
        // Generate QR code
        QRCode.toCanvas(canvas, url, {
            width: 140,
            margin: 1,
            color: {
                dark: '#0b6b4f',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        }, function(error) {
            if (error) {
                console.error('QR Code generation failed:', error);
                createFallbackQRCode(container, url);
            } else {
                console.log('QR Code generated successfully');
                
                // Add logo overlay
                addLogoOverlay(wrapper);
            }
        });
    } catch (error) {
        console.error('QR Code error:', error);
        createFallbackQRCode(container, url);
    }
}

function addLogoOverlay(wrapper) {
    // Add Si LOUNGE logo overlay
    const logoOverlay = document.createElement('div');
    logoOverlay.style.cssText = `
        position: absolute;
        width: 30px;
        height: 30px;
        background: #0b6b4f;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    `;
    
    logoOverlay.innerHTML = '<i class="fas fa-utensils" style="color: white; font-size: 14px;"></i>';
    wrapper.style.position = 'relative';
    wrapper.appendChild(logoOverlay);
}

function createFallbackQRCode(container, url) {
    // Create fallback QR code design
    const domain = url.replace(/^https?:\/\//, '').split('/')[0] || 'si-lounge.ir';
    
    const fallbackHTML = `
        <div style="
            width: 180px;
            height: 180px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        ">
            <!-- Background pattern -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    repeating-linear-gradient(90deg, 
                        transparent, 
                        transparent 19px, 
                        #f0f0f0 19px, 
                        #f0f0f0 20px),
                    repeating-linear-gradient(0deg, 
                        transparent, 
                        transparent 19px, 
                        #f0f0f0 19px, 
                        #f0f0f0 20px);
                opacity: 0.3;
            "></div>
            
            <!-- QR Code simulation -->
            <div style="
                width: 140px;
                height: 140px;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                position: relative;
                z-index: 2;
                padding: 8px;
            ">
                <!-- Position markers -->
                <div style="
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    width: 24px;
                    height: 24px;
                    border: 4px solid #0b6b4f;
                    border-radius: 6px;
                "></div>
                <div style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border: 4px solid #0b6b4f;
                    border-radius: 6px;
                "></div>
                <div style="
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    width: 24px;
                    height: 24px;
                    border: 4px solid #0b6b4f;
                    border-radius: 6px;
                "></div>
                
                <!-- Center logo -->
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 28px;
                    height: 28px;
                    background: #0b6b4f;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 3;
                ">
                    <i class="fas fa-utensils" style="color: white; font-size: 12px;"></i>
                </div>
                
                <!-- Data dots pattern -->
                <div style="
                    position: absolute;
                    top: 40px;
                    left: 40px;
                    width: 60px;
                    height: 60px;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-gap: 3px;
                    z-index: 2;
                ">
                    ${generateRandomDots(25)}
                </div>
            </div>
            
            <!-- URL display -->
            <div style="
                margin-top: 8px;
                font-size: 10px;
                color: #666;
                text-align: center;
                z-index: 2;
                background: rgba(255,255,255,0.8);
                padding: 2px 6px;
                border-radius: 3px;
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
            ">
                ${domain}
            </div>
        </div>
    `;
    
    container.innerHTML = fallbackHTML;
}

function generateRandomDots(count) {
    let dots = '';
    const colors = ['#0b6b4f', '#000000', '#333333'];
    
    for (let i = 0; i < count; i++) {
        const shouldShow = Math.random() > 0.5;
        if (shouldShow) {
            const colorIndex = Math.floor(Math.random() * colors.length);
            dots += `<div style="background: ${colors[colorIndex]}; width: 6px; height: 6px; border-radius: 1px;"></div>`;
        } else {
            dots += '<div style="width: 6px; height: 6px;"></div>';
        }
    }
    return dots;
}

// ===== Utility Functions =====
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    
    if (!notification) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }
    
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type, 'show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Make functions available globally
window.changeLanguage = changeLanguage;
window.showTableModal = showTableModal;
window.closeModal = closeModal;
window.saveTableNumber = saveTableNumber;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.submitOrder = submitOrder;
window.generateQRCode = generateQRCode;