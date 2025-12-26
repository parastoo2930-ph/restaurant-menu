// ===== Si LOUNGE - Admin Panel Script =====

// Global Variables
let currentAdminTab = 'add';
let editingProductId = null;

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isAuthenticated()) {
        showLoginForm();
    } else {
        showProductForm();
        loadAdminData();
    }
    
    setupAdminEventListeners();
});

// ===== Authentication Functions =====
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('productForm').style.display = 'none';
}

function showProductForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('productForm').style.display = 'block';
}

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (Storage.login(username, password)) {
        Storage.setAuthenticated(true);
        showProductForm();
        loadAdminData();
        showAdminNotification('ورود موفقیت‌آمیز بود', 'success');
    } else {
        showAdminNotification('نام کاربری یا رمز عبور نادرست است', 'error');
        document.getElementById('password').value = '';
    }
});

function logout() {
    Storage.setAuthenticated(false);
    showLoginForm();
    showAdminNotification('خروج موفقیت‌آمیز بود', 'info');
}

// ===== Setup Event Listeners =====
function setupAdminEventListeners() {
    // Admin Navigation Tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchAdminTab(this.dataset.tab);
        });
    });
    
    // Language Tabs in Add Product Form
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const lang = this.dataset.lang;
            switchLanguageTab(lang);
        });
    });
    
    // Auto-fill other languages when typing in Persian
    document.getElementById('name_fa')?.addEventListener('input', autoFillOtherLanguages);
    document.getElementById('desc_fa')?.addEventListener('input', autoFillOtherLanguages);
    
    // Add Product Form Submission
    document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (editingProductId) {
            updateProduct();
        } else {
            addProduct();
        }
    });
    
    // Setup filters
    setupProductFilters();
    setupOrderFilters();
    
    // Close notification when clicked
    document.getElementById('adminNotification')?.addEventListener('click', function() {
        this.classList.remove('show');
    });
}

// ===== تب‌های پنل مدیریت =====
function switchAdminTab(tabName) {
    // مخفی کردن همه تب‌ها
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // حذف کلاس active از همه دکمه‌های تب
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // نمایش تب انتخاب شده
    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // فعال کردن دکمه تب مربوطه
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // بارگذاری داده‌های تب مربوطه
    if (tabName === 'manage') {
        loadProductsList();
        updateProductStats();
    } else if (tabName === 'orders') {
        loadOrdersList();
        updateOrderStats();
    }
    
    currentAdminTab = tabName;
}

// ===== تب‌های زبان =====
function switchLanguageTab(lang) {
    // حذف active از همه تب‌های زبان
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // حذف active از همه محتواهای زبان
    document.querySelectorAll('.lang-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // فعال کردن تب و محتوای زبان انتخاب شده
    const activeLangTab = document.querySelector(`.lang-tab[data-lang="${lang}"]`);
    const activeLangContent = document.querySelector(`.lang-content[data-lang="${lang}"]`);
    
    if (activeLangTab) activeLangTab.classList.add('active');
    if (activeLangContent) activeLangContent.classList.add('active');
    
    // پر کردن خودکار سایر زبان‌ها اگر فارسی پر شده باشد
    if (lang === 'fa') {
        autoFillOtherLanguages();
    }
}

// پر کردن خودکار زبان‌های دیگر
function autoFillOtherLanguages() {
    const faName = document.getElementById('name_fa').value;
    const faDesc = document.getElementById('desc_fa').value;
    
    if (faName && !document.getElementById('name_ku').value) {
        document.getElementById('name_ku').value = faName;
    }
    
    if (faName && !document.getElementById('name_en').value) {
        document.getElementById('name_en').value = faName;
    }
    
    if (faDesc && !document.getElementById('desc_ku').value) {
        document.getElementById('desc_ku').value = faDesc;
    }
    
    if (faDesc && !document.getElementById('desc_en').value) {
        document.getElementById('desc_en').value = faDesc;
    }
}

// ===== Product Management =====
function addProduct() {
    // Get form values
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const status = document.getElementById('productStatus').value;
    
    // Get multilingual names and descriptions
    const name = {
        fa: document.getElementById('name_fa').value.trim(),
        ku: document.getElementById('name_ku').value.trim() || document.getElementById('name_fa').value.trim(),
        en: document.getElementById('name_en').value.trim() || document.getElementById('name_fa').value.trim()
    };
    
    const desc = {
        fa: document.getElementById('desc_fa').value.trim() || 'توضیحات',
        ku: document.getElementById('desc_ku').value.trim() || document.getElementById('desc_fa').value.trim(),
        en: document.getElementById('desc_en').value.trim() || document.getElementById('desc_fa').value.trim()
    };
    
    // Validate required fields
    if (!name.fa || !price) {
        showAdminNotification('لطفاً نام و قیمت را پر کنید', 'error');
        return;
    }
    
    // Create product object
    const product = {
        name: name,
        desc: desc,
        price: price,
        category: category,
        image: image,
        status: status
    };
    
    // Add to storage
    const newId = Storage.addMenuItem(product);
    
    // Clear form
    resetProductForm();
    
    // Show success message
    showAdminNotification(`محصول "${name.fa}" با موفقیت اضافه شد`, 'success');
    
    // Update products list if on manage tab
    if (currentAdminTab === 'manage') {
        loadProductsList();
        updateProductStats();
    }
}

function updateProduct() {
    if (!editingProductId) return;
    
    // Get form values
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const status = document.getElementById('productStatus').value;
    
    const name = {
        fa: document.getElementById('name_fa').value.trim(),
        ku: document.getElementById('name_ku').value.trim() || document.getElementById('name_fa').value.trim(),
        en: document.getElementById('name_en').value.trim() || document.getElementById('name_fa').value.trim()
    };
    
    const desc = {
        fa: document.getElementById('desc_fa').value.trim() || 'توضیحات',
        ku: document.getElementById('desc_ku').value.trim() || document.getElementById('desc_fa').value.trim(),
        en: document.getElementById('desc_en').value.trim() || document.getElementById('desc_fa').value.trim()
    };
    
    if (!name.fa || !price) {
        showAdminNotification('لطفاً نام و قیمت را پر کنید', 'error');
        return;
    }
    
    const updatedProduct = {
        id: editingProductId,
        name: name,
        desc: desc,
        price: price,
        category: category,
        image: image,
        status: status
    };
    
    // Update in storage
    const success = Storage.updateMenuItem(editingProductId, updatedProduct);
    
    if (success) {
        // Reset form and editing state
        resetProductForm();
        editingProductId = null;
        
        // Change button text back to "Add"
        const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> ذخیره محصول';
        
        showAdminNotification('محصول با موفقیت ویرایش شد', 'success');
        loadProductsList();
        updateProductStats();
    } else {
        showAdminNotification('خطا در ویرایش محصول', 'error');
    }
}

function editProduct(id) {
    // Find the product
    const allItems = Storage.getAllItems();
    const product = allItems.find(item => item.id === id);
    
    if (!product) return;
    
    // Set editing mode
    editingProductId = id;
    
    // Fill form with product data
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productStatus').value = product.status || 'available';
    
    // Fill language fields
    document.getElementById('name_fa').value = product.name.fa || '';
    document.getElementById('name_ku').value = product.name.ku || '';
    document.getElementById('name_en').value = product.name.en || '';
    document.getElementById('desc_fa').value = product.desc.fa || '';
    document.getElementById('desc_ku').value = product.desc.ku || '';
    document.getElementById('desc_en').value = product.desc.en || '';
    
    // Change button text
    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-edit"></i> ویرایش محصول';
    
    // Switch to add tab if not already
    switchAdminTab('add');
    
    // Switch to Persian language tab
    switchLanguageTab('fa');
    
    showAdminNotification('در حال ویرایش محصول...', 'info');
}

function deleteProduct(id) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
        return;
    }
    
    const success = Storage.deleteMenuItem(id);
    
    if (success) {
        showAdminNotification('محصول با موفقیت حذف شد', 'success');
        loadProductsList();
        updateProductStats();
    } else {
        showAdminNotification('خطا در حذف محصول', 'error');
    }
}

function resetProductForm() {
    document.getElementById('addProductForm').reset();
    document.getElementById('productCategory').value = 'food';
    document.getElementById('productStatus').value = 'available';
    editingProductId = null;
    
    // Change button text back to "Add"
    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> ذخیره محصول';
    
    switchLanguageTab('fa');
}

// ===== آمار محصولات =====
function updateProductStats() {
    const allItems = Storage.getAllItems();
    const availableItems = allItems.filter(item => !item.status || item.status === 'available');
    const unavailableItems = allItems.filter(item => item.status === 'unavailable');
    
    document.getElementById('totalProductsCount').textContent = allItems.length;
    document.getElementById('availableProductsCount').textContent = availableItems.length;
    document.getElementById('unavailableProductsCount').textContent = unavailableItems.length;
}

// ===== آمار سفارشات =====
function updateOrderStats() {
    const orders = Storage.getOrders();
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const completedOrders = orders.filter(order => order.status === 'completed');
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.timestamp).toDateString() === today
    );
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    document.getElementById('totalOrdersCount').textContent = orders.length;
    document.getElementById('pendingOrdersCount').textContent = pendingOrders.length;
    document.getElementById('completedOrdersCount').textContent = completedOrders.length;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString('fa-IR');
}
// ===== فیلتر محصولات (اصلاح شده) =====
function setupProductFilters() {
    // منتظر بمان تا دکمه‌ها لود شوند
    setTimeout(() => {
        const filterButtons = document.querySelectorAll('.category-filter .filter-btn');
        
        if (filterButtons.length === 0) {
            console.error('دکمه‌های فیلتر پیدا نشدند!');
            return;
        }
        
        filterButtons.forEach(btn => {
            // حذف EventListener قبلی
            btn.removeEventListener('click', handleFilterClick);
            // اضافه کردن EventListener جدید
            btn.addEventListener('click', handleFilterClick);
        });
        
        console.log('فیلترها راه‌اندازی شدند:', filterButtons.length, 'دکمه');
    }, 500); // تاخیر برای مطمئن شدن از لود شدن DOM
    
    // جستجو
    setTimeout(() => {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchProducts(this.value);
            });
        }
    }, 500);
}

// تابع جداگانه برای هندل کردن کلیک فیلتر
function handleFilterClick() {
    // حذف active از همه دکمه‌ها
    document.querySelectorAll('.category-filter .filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    // فعال کردن دکمه انتخاب شده
    this.classList.add('active');
    
    // فیلتر کردن محصولات
    const category = this.dataset.category;
    currentProductFilter = category;
    filterProductsByCategory(category);
}

function filterProductsByCategory(category) {
    const allItems = Storage.getAllItems();
    let filteredItems = allItems;
    
    if (category !== 'all') {
        filteredItems = allItems.filter(item => item.category === category);
    }
    
    displayProducts(filteredItems);
    
    // آپدیت آمار
    updateFilteredStats(category);
}

function updateFilteredStats(category) {
    const allItems = Storage.getAllItems();
    let filteredItems = allItems;
    
    if (category !== 'all') {
        filteredItems = allItems.filter(item => item.category === category);
    }
    
    const availableItems = filteredItems.filter(item => !item.status || item.status === 'available');
    const unavailableItems = filteredItems.filter(item => item.status === 'unavailable');
    
    document.getElementById('totalProductsCount').textContent = filteredItems.length;
    document.getElementById('availableProductsCount').textContent = availableItems.length;
    document.getElementById('unavailableProductsCount').textContent = unavailableItems.length;
}

function searchProducts(query) {
    const allItems = Storage.getAllItems();
    const filteredItems = allItems.filter(item => 
        item.name.fa.toLowerCase().includes(query.toLowerCase()) ||
        (item.name.ku && item.name.ku.toLowerCase().includes(query.toLowerCase())) ||
        (item.name.en && item.name.en.toLowerCase().includes(query.toLowerCase())) ||
        item.desc.fa.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(filteredItems);
}
function searchProducts(query) {
    const allItems = Storage.getAllItems();
    const filteredItems = allItems.filter(item => 
        item.name.fa.toLowerCase().includes(query.toLowerCase()) ||
        item.name.ku.toLowerCase().includes(query.toLowerCase()) ||
        item.name.en.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.fa.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(filteredItems);
}

// ===== فیلتر سفارشات =====
function setupOrderFilters() {
    document.querySelectorAll('.order-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // حذف active از همه دکمه‌ها
            document.querySelectorAll('.order-filters .filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // فعال کردن دکمه انتخاب شده
            this.classList.add('active');
            
            // فیلتر کردن سفارشات
            const filterType = this.dataset.status;
            filterOrders(filterType);
        });
    });
}

function filterOrders(filterType) {
    const allOrders = Storage.getOrders();
    let filteredOrders = allOrders;
    
    if (filterType === 'pending') {
        filteredOrders = allOrders.filter(order => order.status === 'pending');
    } else if (filterType === 'completed') {
        filteredOrders = allOrders.filter(order => order.status === 'completed');
    } else if (filterType === 'today') {
        const today = new Date().toDateString();
        filteredOrders = allOrders.filter(order => 
            new Date(order.timestamp).toDateString() === today
        );
    }
    
    displayOrders(filteredOrders);
}

// ===== نمایش محصولات =====
function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>محصولی یافت نشد</p>
            </div>
        `;
        return;
    }
    
    // مرتب‌سازی بر اساس دسته‌بندی
    const grouped = {};
    products.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });
    
    let html = '';
    
    // نام دسته‌بندی‌ها
const categoryNames = {
    food: '🍽️ غذاها',
    cafe: '☕️ کافه بار',
    appetizer: '🥗 پیش غذاها',
    dessert: '🍰 دسرها',
    drink: '🥤 نوشیدنی‌ها'
};
    for (const [category, items] of Object.entries(grouped)) {
        html += `<h4 style="margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #0b6b4f; color: #0b6b4f;">
            ${categoryNames[category] || category} (${items.length} مورد)
        </h4>`;
        
        items.forEach(item => {
            const statusBadge = item.status === 'unavailable' 
                ? '<span class="product-status" style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">ناموجود</span>'
                : '<span class="product-status" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">موجود</span>';
            
            html += `
                <div class="product-item" data-id="${item.id}">
                    <div class="product-header">
                        <div class="product-title">
                            ${statusBadge}
                            ${item.name.fa}
                        </div>
                        <span class="product-category">${categoryNames[item.category] || item.category}</span>
                    </div>
                    
                    <div class="product-desc">${item.desc.fa || 'بدون توضیحات'}</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0;">
                        <div class="product-price">${item.price.toLocaleString('fa-IR')} تومان</div>
                        
                        <div class="product-multilingual">
                            <small style="color: #666;">
                                <i class="fas fa-language"></i> 
                                ${item.name.ku ? 'کوردی' : ''} 
                                ${item.name.en ? 'انگلیسی' : ''}
                            </small>
                        </div>
                    </div>
                    
                    ${item.image ? `
                        <div style="margin: 10px 0;">
                            <img src="${item.image}" alt="${item.name.fa}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                        </div>
                    ` : ''}
                    
                    <div class="product-actions">
                        <button class="action-btn edit-btn" onclick="editProduct(${item.id})">
                            <i class="fas fa-edit"></i> ویرایش
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteProduct(${item.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                        <button class="action-btn status-btn" onclick="toggleProductStatus(${item.id})">
                            <i class="fas fa-exchange-alt"></i> تغییر وضعیت
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// ===== نمایش سفارشات =====
function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>سفارشی یافت نشد</p>
            </div>
        `;
        return;
    }
    
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    
    orders.forEach(order => {
        const date = new Date(order.timestamp);
        const timeString = date.toLocaleString('fa-IR');
        
        const statusBadge = order.status === 'pending' 
            ? '<span style="background: #ffc107; color: #000; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">⏳ در انتظار</span>'
            : '<span style="background: #28a745; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">✅ تکمیل شده</span>';
        
        const itemsList = order.items.map(item => 
            `<li>${item.name} × ${item.quantity} - ${(item.price * item.quantity).toLocaleString('fa-IR')} تومان</li>`
        ).join('');
        
        html += `
            <div class="order-item" data-id="${order.id}">
                <div class="order-header">
                    <h4 style="margin: 0; color: #333;">سفارش میز ${order.table}</h4>
                    ${statusBadge}
                </div>
                
                <div class="order-info">
                    <div class="order-time">
                        <i class="far fa-clock"></i>
                        <strong>زمان:</strong> ${timeString}
                    </div>
                    <div class="order-total">
                        <i class="fas fa-money-bill-wave"></i>
                        <strong>مبلغ:</strong> ${order.total.toLocaleString('fa-IR')} تومان
                    </div>
                    <div class="order-table">
                        <i class="fas fa-chair"></i>
                        <strong>میز:</strong> ${order.table}
                    </div>
                </div>
                
                <div class="order-items">
                    <strong><i class="fas fa-list"></i> موارد سفارش:</strong>
                    <ul class="order-item-list">
                        ${itemsList}
                    </ul>
                </div>
                
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="action-btn complete-btn" onclick="completeOrder(${order.id})">
                            <i class="fas fa-check"></i> تکمیل سفارش
                        </button>
                    ` : ''}
                    <button class="action-btn edit-btn" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> مشاهده جزئیات
                    </button>
                    <button class="action-btn cancel-btn" onclick="cancelOrder(${order.id})">
                        <i class="fas fa-times"></i> لغو سفارش
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== توابع جدید برای محصولات =====
function toggleProductStatus(productId) {
    const allItems = Storage.getAllItems();
    const product = allItems.find(item => item.id === productId);
    
    if (!product) return;
    
    product.status = product.status === 'available' ? 'unavailable' : 'available';
    
    Storage.updateMenuItem(productId, product);
    loadProductsList();
    updateProductStats();
    
    showAdminNotification(
        `وضعیت "${product.name.fa}" تغییر کرد به: ${product.status === 'available' ? 'موجود' : 'ناموجود'}`,
        'info'
    );
}

// ===== توابع جدید برای سفارشات =====
function completeOrder(orderId) {
    if (!confirm('آیا این سفارش تکمیل شده است؟')) return;
    
    Storage.updateOrderStatus(orderId, 'completed');
    loadOrdersList();
    updateOrderStats();
    
    showAdminNotification('سفارش به عنوان تکمیل شده علامت‌گذاری شد', 'success');
}

function cancelOrder(orderId) {
    if (!confirm('آیا از لغو این سفارش مطمئن هستید؟')) return;
    
    Storage.updateOrderStatus(orderId, 'cancelled');
    loadOrdersList();
    updateOrderStats();
    
    showAdminNotification('سفارش لغو شد', 'info');
}

function viewOrderDetails(orderId) {
    const orders = Storage.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const date = new Date(order.timestamp);
    const timeString = date.toLocaleString('fa-IR');
    
    const itemsDetails = order.items.map(item => 
        `${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString('fa-IR')} تومان`
    ).join('\n');
    
    const details = `
        سفارش میز: ${order.table}
        زمان: ${timeString}
        وضعیت: ${order.status === 'pending' ? 'در انتظار' : 'تکمیل شده'}
        مجموع: ${order.total.toLocaleString('fa-IR')} تومان
        
        موارد سفارش:
        ${itemsDetails}
    `;
    
    alert(details);
}

// ===== بارگذاری لیست محصولات =====
function loadProductsList() {
    const allItems = Storage.getAllItems();
    displayProducts(allItems);
}

// ===== بارگذاری لیست سفارشات =====
function loadOrdersList() {
    const orders = Storage.getOrders();
    displayOrders(orders);
}

// ===== بارگذاری داده‌های ادمین =====
function loadAdminData() {
    updateProductStats();
    updateOrderStats();
    loadProductsList();
    loadOrdersList();
}

// ===== Notification Function =====
function showAdminNotification(message, type = 'info') {
    const notification = document.getElementById('adminNotification');
    
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

// Make functions globally available
window.switchLanguageTab = switchLanguageTab;
window.resetProductForm = resetProductForm;
window.logout = logout;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleProductStatus = toggleProductStatus;
window.completeOrder = completeOrder;
window.cancelOrder = cancelOrder;
window.viewOrderDetails = viewOrderDetails;