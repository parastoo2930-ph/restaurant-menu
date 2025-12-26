// ===== Si LOUNGE - Storage Management =====

// Credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'silonnge2024'
};

// Storage Keys
const STORAGE_KEYS = {
    MENU_ITEMS: 'siLounge_menuItems',
    ORDERS: 'siLounge_orders',
    SETTINGS: 'siLounge_settings',
    TABLE_NUMBER: 'siLounge_tableNumber',
    LANGUAGE: 'siLounge_language',
    CART: 'siLounge_cart',
    ADMIN_AUTH: 'siLounge_adminLoggedIn'
};

// Default Menu Items
const DEFAULT_MENU = {
    food: [
        {
            id: 1,
            name: { fa: 'استیک گوشت', ku: 'ستێکی گوشت', en: 'Beef Steak' },
            desc: { fa: 'گوشت گوساله با سس مخصوص', ku: 'گوشتی مانگا بە سۆسی تایبەت', en: 'Beef with special sauce' },
            price: 185000,
            category: 'food',
            image: '',
            status: 'available'
        },
        {
            id: 2,
            name: { fa: 'پاستا آلفردو', ku: 'پاستای ئەلفرێدو', en: 'Alfredo Pasta' },
            desc: { fa: 'پاستا با سس خامه و قارچ', ku: 'پاستا بە سۆسی خامە و قارچ', en: 'Pasta with cream sauce and mushrooms' },
            price: 120000,
            category: 'food',
            image: '',
            status: 'available'
        }
    ],
    cafe: [
        {
            id: 10,
            name: { fa: 'قهوه لاته', ku: 'لاتێ', en: 'Caffè Latte' },
            desc: { fa: 'قهوه اسپرسو با شیر داغ', ku: 'قهوە بە شیری گەرم', en: 'Espresso with hot milk' },
            price: 65000,
            category: 'cafe',
            image: '',
            status: 'available'
        },
        {
            id: 11,
            name: { fa: 'موکا', ku: 'مۆکا', en: 'Mocha' },
            desc: { fa: 'ترکیب قهوه و شکلات', ku: 'تێکەڵەی قهوە و چۆکلێت', en: 'Coffee and chocolate combination' },
            price: 75000,
            category: 'cafe',
            image: '',
            status: 'available'
        }
    ],
    appetizer: [],
    dessert: [],
    drink: [] // دسته‌بندی نوشیدنی اضافه شد
};

// ===== Menu Management =====
function getMenuItems() {
    const stored = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    if (!stored) {
        // Save default menu
        saveMenuItems(DEFAULT_MENU);
        return DEFAULT_MENU;
    }
    return JSON.parse(stored);
}

function saveMenuItems(menuData) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuData));
}

function addMenuItem(item) {
    const menu = getMenuItems();
    
    // Generate ID
    const allItems = getAllItems(menu);
    const newId = allItems.length > 0 ? Math.max(...allItems.map(i => i.id)) + 1 : 1;
    
    // Add default status if not provided
    const newItem = {
        ...item,
        id: newId,
        status: item.status || 'available'
    };
    
    // Add to category
    if (!menu[item.category]) {
        menu[item.category] = [];
    }
    menu[item.category].push(newItem);
    
    // Save
    saveMenuItems(menu);
    return newId;
}

function updateMenuItem(id, updatedItem) {
    const menu = getMenuItems();
    let updated = false;
    
    // First, remove from all categories
    for (const category in menu) {
        menu[category] = menu[category].filter(item => item.id !== id);
    }
    
    // Add to new category
    if (!menu[updatedItem.category]) {
        menu[updatedItem.category] = [];
    }
    menu[updatedItem.category].push(updatedItem);
    updated = true;
    
    if (updated) {
        saveMenuItems(menu);
    }
    return updated;
}

function deleteMenuItem(id) {
    const menu = getMenuItems();
    let deleted = false;
    
    // Find and delete from all categories
    for (const category in menu) {
        const originalLength = menu[category].length;
        menu[category] = menu[category].filter(item => item.id !== id);
        if (menu[category].length < originalLength) {
            deleted = true;
        }
    }
    
    if (deleted) {
        saveMenuItems(menu);
    }
    return deleted;
}

function getAllItems(menu = null) {
    if (!menu) menu = getMenuItems();
    const allItems = [];
    for (const category in menu) {
        if (Array.isArray(menu[category])) {
            allItems.push(...menu[category]);
        }
    }
    return allItems;
}

function getItemsByCategory(category) {
    const menu = getMenuItems();
    return menu[category] || [];
}

// ===== Order Management =====
function getOrders() {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
}

function saveOrder(order) {
    const orders = getOrders();
    orders.push({
        ...order,
        id: Date.now(),
        status: order.status || 'pending'
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return true;
    }
    return false;
}

// ===== Cart Management =====
function getCart() {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem(STORAGE_KEYS.CART);
}

// ===== Settings Management =====
function getSettings() {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : {
        restaurantName: 'Si LOUNGE',
        description: 'تجربه‌ای مدرن از طعم‌های اصیل',
        address: 'کرمانشاه، خیابان شهید بهشتی',
        phone: '083-37200000',
        workingHours: 'هر روز ۱۲:۰۰ تا ۲۳:۰۰'
    };
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// ===== User Preferences =====
function getTableNumber() {
    return localStorage.getItem(STORAGE_KEYS.TABLE_NUMBER);
}

function saveTableNumber(table) {
    localStorage.setItem(STORAGE_KEYS.TABLE_NUMBER, table);
}

function getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'fa';
}

function saveLanguage(lang) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

// ===== Authentication =====
function login(username, password) {
    return username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password;
}

function isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

function setAuthenticated(value) {
    if (value) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
}

// ===== Statistics =====
function getStatistics() {
    const menu = getMenuItems();
    const orders = getOrders();
    
    const totalProducts = getAllItems(menu).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
    };
}

// Export functions for use in other files
window.Storage = {
    getMenuItems,
    saveMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllItems,
    getItemsByCategory,
    
    getOrders,
    saveOrder,
    updateOrderStatus,
    
    getCart,
    saveCart,
    clearCart,
    
    getSettings,
    saveSettings,
    
    getTableNumber,
    saveTableNumber,
    getLanguage,
    saveLanguage,
    
    login,
    isAuthenticated,
    setAuthenticated,
    
    getStatistics
};