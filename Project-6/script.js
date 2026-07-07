// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================
const CURRENCIES = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 1.0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 0.01198 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.01103 },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.00938 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', rate: 0.04398 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 1.9168 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦', rate: 0.01633 },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺', rate: 0.01784 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', rate: 0.01072 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: '$', flag: '🇸🇬', rate: 0.01614 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 0.08711 },
    { code: 'CNH', name: 'Offshore Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 0.08725 },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', flag: '🇭🇰', rate: 0.09349 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿', rate: 0.01956 },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', rate: 16.54 },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', rate: 0.1265 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', rate: 0.1278 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', rate: 0.0823 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', rate: 0.2215 },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', rate: 0.2185 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', rate: 0.0664 },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', rate: 1.054 },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', rate: 0.3956 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦', rate: 0.0449 },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', rate: 0.4395 },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', rate: 196.42 },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', rate: 0.0564 },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', rate: 0.7025 },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', rate: 304.5 },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱', rate: 0.0445 },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱', rate: 0.0475 },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', rate: 4.39 },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', rate: 0.278 },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', rate: 0.0548 },
    { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴', rate: 49.52 },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', rate: 10.92 },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱', rate: 11.25 },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪', rate: 0.0448 },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', rate: 0.575 },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', rate: 18.22 },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', rate: 3.33 },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', rate: 1.41 }
];

const state = {
    user: {
        name: localStorage.getItem('gxc_user_name') || null,
        bankName: localStorage.getItem('gxc_user_bank') || null,
        bankAccount: localStorage.getItem('gxc_user_account') || null
    },
    selectedBalanceCurrency: localStorage.getItem('gxc_bal_currency') || 'INR',
    eMoneyVaults: (() => {
        const stored = localStorage.getItem('gxc_emoney_vaults');
        const defaultVaults = {
            INR: 150000.00,
            USD: 450.00,
            EUR: 210.00,
            JPY: 18000.00,
            AED: 380.00,
            GBP: 95.00
        };
        const vaults = stored ? JSON.parse(stored) : defaultVaults;
        CURRENCIES.forEach(c => {
            if (vaults[c.code] === undefined) {
                vaults[c.code] = 0.00;
            }
        });
        return vaults;
    })(),
    linkedBanks: JSON.parse(localStorage.getItem('gxc_linked_banks')) || [],
    transactions: JSON.parse(localStorage.getItem('gxc_transactions')) || [
        { id: 'TXN-00109-A', type: 'Deposit', title: 'Salary Payout Received', amount: 100000.00, currency: 'INR', date: '01 July 2026, 10:00 AM', status: 'Settled' },
        { id: 'TXN-00110-B', type: 'Transfer', title: 'Sent to Rahul (GXC-8800)', amount: -4500.00, currency: 'INR', date: '04 July 2026, 09:15 AM', status: 'Settled' },
        { id: 'TXN-00111-C', type: 'Exchange', title: 'Exchanged INR to USD', amount: -8345.00, currency: 'INR', date: 'Yesterday, 04:12 PM', status: 'Settled', rateInfo: '1 INR = 0.01198 USD' }
    ],
    p2pLedgers: JSON.parse(localStorage.getItem('gxc_p2p_ledgers')) || {
        'Bujjiiii💗💃': [
            { type: 'received', amount: 2000.00, memo: 'For movie and dinner 🎬🍿', time: 'Yesterday, 08:30 PM', status: 'Settled' },
            { type: 'sent', amount: 1500.00, memo: 'Lunch yesterday', time: '04 July 2026, 01:20 PM', status: 'Settled' }
        ],
        'mumma💗': [
            { type: 'received', amount: 5000.00, memo: 'Pocket money ❤️', time: '01 July 2026, 11:00 AM', status: 'Settled' },
            { type: 'sent', amount: 1000.00, memo: 'Grocery bill', time: '03 July 2026, 04:45 PM', status: 'Settled' }
        ],
        'Sam': [],
        'Akshi': []
    },
    contacts: JSON.parse(localStorage.getItem('gxc_contacts')) || [
        { name: 'Bujjiiii💗💃', initial: 'B', palette: 'color-p1', id: 'GXC-0001' },
        { name: 'mumma💗', initial: 'M', palette: 'color-p2', id: 'GXC-0002' },
        { name: 'Sam', initial: 'S', palette: 'color-p3', id: 'GXC-0003' },
        { name: 'Akshi', initial: 'A', palette: 'color-p4', id: 'GXC-0004' }
    ],
    notifications: [
        { id: 1, text: 'Rate Alert: USD/INR crossed 83.45', time: '10 mins ago', read: false },
        { id: 2, text: 'Google Maps destination simulator loaded!', time: '2 hours ago', read: false },
        { id: 3, text: 'Security check: Login session active', time: 'Today, 10:22 AM', read: true }
    ],
    activePage: 'screen-dashboard',
    activeP2PContact: null,
    selectedChartCurrency: 'USD',
    activeChartData: [],
    hoveredChartIndex: null,
    exchangeFrom: 'INR',
    exchangeTo: 'USD'
};

// ==========================================================================
// MOCK DATA SYNCHRONIZERS
// ==========================================================================
function saveState() {
    localStorage.setItem('gxc_emoney_vaults', JSON.stringify(state.eMoneyVaults));
    localStorage.setItem('gxc_linked_banks', JSON.stringify(state.linkedBanks));
    localStorage.setItem('gxc_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('gxc_p2p_ledgers', JSON.stringify(state.p2pLedgers));
}

// Format Helper
function formatCurrency(amount, currencyCode) {
    const cur = CURRENCIES.find(c => c.code === currencyCode) || { symbol: '', code: '' };
    return `${cur.symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur.code}`;
}

// Calculate total assets converted to selected currency
function calculateTotalValuation(targetCode) {
    let totalInINR = 0;
    for (const [code, val] of Object.entries(state.eMoneyVaults)) {
        const cur = CURRENCIES.find(c => c.code === code);
        if (cur) {
            totalInINR += val / cur.rate;
        }
    }
    const targetCur = CURRENCIES.find(c => c.code === targetCode) || { rate: 1 };
    return totalInINR * targetCur.rate;
}

// ==========================================================================
// ROUTING & APP VIEW TOGGLES
// ==========================================================================
function navigateTo(targetId) {
    if (!state.user.name && targetId !== 'screen-login') {
        navigateTo('screen-login');
        return;
    }

    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => p.classList.add('hidden'));

    const activePageElement = document.getElementById(targetId);
    if (activePageElement) {
        activePageElement.classList.remove('hidden');
    }

    state.activePage = targetId;

    // Update bottom nav active classes
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Side-drawer dismiss
    closeDrawer();

    // Trigger tab-specific renders
    if (targetId === 'screen-dashboard') {
        renderDashboard();
    } else if (targetId === 'screen-emoney') {
        renderEMoneyScreen();
    } else if (targetId === 'screen-history') {
        renderHistoryScreen();
    } else if (targetId === 'screen-profile') {
        renderProfileScreen();
    } else if (targetId === 'screen-p2p') {
        renderP2PScreen();
    }
}

// ==========================================================================
// SYSTEM INITIALIZATION & LOGIN STATE (Feature 1)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupTime();
    setupLogin();
    setupNavigation();
    setupSideDrawer();
    setupNotifications();
    setupInteractiveChart();
    setupSearchableDropdowns();
    setupModals();
    setupModalsBanking();
    setupTouristExplorer();
    setupSpeechTranslator();
    setupContactModal();
    setupOfflineMode();
    setupDeveloperControls();

    // Populate dropdown initially
    populateValuationDropdown();

    // Direct Login check
    if (state.user.name) {
        doAutoLogin();
    } else {
        navigateTo('screen-login');
    }
});

function setupTime() {
    const timeElement = document.getElementById('status-time');
    function updateClock() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    updateClock();
    setInterval(updateClock, 30000);
}

function doAutoLogin() {
    // Inject name in headers
    document.getElementById('dashboard-user-name').textContent = state.user.name;
    document.getElementById('profile-user-display-name').textContent = state.user.name;
    document.getElementById('drawer-user-name').textContent = state.user.name;
    
    const initials = state.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('profile-initials').textContent = initials;
    document.getElementById('drawer-avatar-initial').textContent = initials;
    
    // Inject avatar circle replacement
    const headerAvatar = document.getElementById('header-avatar-btn');
    headerAvatar.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%232563eb'/><text x='50' y='62' font-size='38' font-family='Outfit, sans-serif' font-weight='bold' fill='white' text-anchor='middle'>${initials}</text></svg>`;

    // Ensure the default bank exists in state
    if (state.linkedBanks.length === 0) {
        state.linkedBanks.push({
            bankName: state.user.bankName || 'State Bank of India',
            accountNum: state.user.bankAccount || '•••• 4567',
            ifsc: 'SBIN0004567',
            isPrimary: true
        });
        saveState();
    }

    // Toggle panels visibility
    document.getElementById('app-header-bar').classList.remove('hidden');
    document.getElementById('app-screen-container').classList.remove('hidden');
    document.getElementById('app-footer-nav').classList.remove('hidden');
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-login').classList.add('hidden');

    navigateTo('screen-dashboard');
}

function setupLogin() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('login-name').value.trim();
        const bankName = document.getElementById('login-bank').value.trim();
        const account = document.getElementById('login-account').value.trim();

        // Save
        localStorage.setItem('gxc_user_name', fullName);
        localStorage.setItem('gxc_user_bank', bankName);
        localStorage.setItem('gxc_user_account', `•••• ${account.slice(-4)}`);
        
        state.user.name = fullName;
        state.user.bankName = bankName;
        state.user.bankAccount = `•••• ${account.slice(-4)}`;

        // Force primary bank init
        state.linkedBanks = [{
            bankName: bankName,
            accountNum: `•••• ${account.slice(-4)}`,
            ifsc: 'GXC0001928',
            isPrimary: true
        }];
        saveState();

        showToast('Login successful! Secure key generated.');
        doAutoLogin();
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            navigateTo(target);
        });
    });

    // See all transaction redirect button
    document.getElementById('btn-see-all-transactions').addEventListener('click', () => {
        navigateTo('screen-history');
    });

    // Profile Avatar Routing (Feature 5)
    const headerAvatar = document.getElementById('header-avatar-btn');
    if (headerAvatar) {
        headerAvatar.addEventListener('click', () => {
            navigateTo('screen-profile');
        });
    }
}

function populateValuationDropdown() {
    const dropdown = document.getElementById('select-val-currency-hidden');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    CURRENCIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = `${c.code} (${c.symbol})`;
        dropdown.appendChild(opt);
    });
}

// Toast System
function showToast(message) {
    const toast = document.getElementById('notification-toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3500);
}

// ==========================================================================
// HAMBURGER MENU & DRAWER MENU (Feature 3)
// ==========================================================================
function setupSideDrawer() {
    const btnHamburger = document.getElementById('btn-hamburger');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const btnLogout = document.getElementById('btn-drawer-logout');
    
    btnHamburger.addEventListener('click', openDrawer);
    btnCloseDrawer.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // Logout
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('gxc_user_name');
        localStorage.removeItem('gxc_user_bank');
        localStorage.removeItem('gxc_user_account');
        state.user.name = null;
        state.user.bankName = null;
        state.user.bankAccount = null;
        
        showToast('Session logged out securely.');
        closeDrawer();
        
        // Hide UI
        document.getElementById('app-header-bar').classList.add('hidden');
        document.getElementById('app-screen-container').classList.add('hidden');
        document.getElementById('app-footer-nav').classList.add('hidden');
        document.getElementById('screen-login').classList.remove('hidden');
        document.getElementById('screen-login').classList.add('active');
        
        // Clear login inputs
        document.getElementById('login-name').value = '';
        document.getElementById('login-bank').value = '';
        document.getElementById('login-account').value = '';
        
        navigateTo('screen-login');
    });

}

function openDrawer() {
    document.getElementById('side-drawer').classList.remove('hidden');
    document.getElementById('drawer-overlay').classList.remove('hidden');
}

function closeDrawer() {
    document.getElementById('side-drawer').classList.add('hidden');
    document.getElementById('drawer-overlay').classList.add('hidden');
}

// ==========================================================================
// SCREEN 1: DASHBOARD RENDER & VALUATION SELECT (Feature 7)
// ==========================================================================
function renderDashboard() {
    // Renders active valuation
    const valCode = state.selectedBalanceCurrency;
    const valuation = calculateTotalValuation(valCode);
    const sym = (CURRENCIES.find(c => c.code === valCode) || { symbol: '' }).symbol;
    
    document.getElementById('selected-balance-currency').textContent = valCode;
    document.getElementById('dashboard-balance-symbol').textContent = sym;
    document.getElementById('inr-balance-display').textContent = valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('dashboard-balance-code').textContent = valCode;

    // Currency selector setup
    const currencySelectTrigger = document.getElementById('select-val-currency-hidden');
    currencySelectTrigger.value = valCode;

    // Inflow / Outflow in selected currency
    const inflowVal = 50000.00; // static base mock
    const outflowVal = 12845.00; // static base mock
    const curRate = (CURRENCIES.find(c => c.code === valCode) || { rate: 1 }).rate;

    document.getElementById('inflow-display').textContent = `+${sym}${(inflowVal * curRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    document.getElementById('outflow-display').textContent = `-${sym}${(outflowVal * curRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

    // Quick send contacts scrolling (Feature 9)
    renderContactsBar();

    // Render 3 recent transactions
    const activityList = document.getElementById('dashboard-activity-list');
    activityList.innerHTML = '';
    const recent = state.transactions.slice(0, 3);
    
    recent.forEach(t => {
        const card = createTransactionCard(t);
        activityList.appendChild(card);
    });

    // Sync Hidden select trigger
    currencySelectTrigger.addEventListener('change', (e) => {
        state.selectedBalanceCurrency = e.target.value;
        localStorage.setItem('gxc_bal_currency', e.target.value);
        renderDashboard();
    });
}

function renderContactsBar() {
    const container = document.getElementById('contacts-scroll-container');
    if (!container) return;
    container.innerHTML = '';

    // Render static '+' Add Contact button as first item
    const plusBtn = document.createElement('button');
    plusBtn.className = 'contact-avatar-btn add-contact-trigger';
    plusBtn.innerHTML = `
        <div class="contact-avatar-circle add-btn-circle">+</div>
        <span class="contact-avatar-name">Add</span>
    `;
    plusBtn.addEventListener('click', () => {
        document.getElementById('contact-new-name').value = '';
        document.getElementById('contact-new-id').value = '';
        document.getElementById('add-contact-modal').classList.remove('hidden');
    });
    container.appendChild(plusBtn);

    // Render other contacts from state
    state.contacts.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'contact-avatar-btn';
        btn.innerHTML = `
            <div class="contact-avatar-circle ${c.palette}">${c.initial}</div>
            <span class="contact-avatar-name">${c.name}</span>
        `;
        btn.addEventListener('click', () => {
            state.activeP2PContact = c.name;
            navigateTo('screen-p2p');
        });
        container.appendChild(btn);
    });
}

function createTransactionCard(t) {
    const div = document.createElement('div');
    div.className = 'transaction-card';
    div.addEventListener('click', () => {
        openReceiptModal(t);
    });

    const isDeposit = t.type === 'Deposit';
    const isExchange = t.type === 'Exchange';
    const classIcon = t.type.toLowerCase();
    
    let arrowSvg = '';
    if (isDeposit) {
        arrowSvg = `<svg class="txn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    } else if (isExchange) {
        arrowSvg = `<svg class="txn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23 3 19 7 15"></path></svg>`;
    } else {
        arrowSvg = `<svg class="txn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }

    const formattedVal = formatCurrency(t.amount, t.currency);
    const flowClass = t.amount > 0 ? 'inflow' : 'outflow';
    const sign = t.amount > 0 ? '+' : '';

    div.innerHTML = `
        <div class="txn-left">
            <div class="txn-icon-box ${classIcon}">${arrowSvg}</div>
            <div class="txn-details">
                <span class="txn-title">${t.title}</span>
                <span class="txn-meta">${t.date}</span>
            </div>
        </div>
        <div class="txn-right">
            <span class="txn-amount ${flowClass}">${sign}${formattedVal}</span>
            <span class="txn-status">${t.status}</span>
        </div>
    `;
    return div;
}

// ==========================================================================
// INTERACTIVE FX RATE CHART MODULE (Feature 4)
// ==========================================================================
// ==========================================================================
// INTERACTIVE FX RATE CHART MODULE (Feature 4)
// ==========================================================================
function generateChartData(currencyCode) {
    const c = CURRENCIES.find(curr => curr.code === currencyCode) || { rate: 0.012 };
    const baseRate = c.rate;
    const dates = ["Wed 10 Jun", "Thu 11 Jun", "Fri 12 Jun", "Sat 13 Jun", "Sun 14 Jun", "Mon 15 Jun", "Tue 16 Jun", "Wed 17 Jun", "Thu 18 Jun", "Fri 19 Jun"];
    
    state.activeChartData = [];
    let currentRate = baseRate;
    
    for (let i = 0; i < 10; i++) {
        const percentChange = (Math.random() * 3 - 1.5) / 100;
        currentRate = currentRate * (1 + percentChange);
        state.activeChartData.push({
            date: dates[i],
            val: currentRate
        });
    }
}

function setupInteractiveChart() {
    const searchInput = document.getElementById('fx-chart-search-input');
    const suggestionsBox = document.getElementById('fx-search-suggestions-box');
    const canvas = document.getElementById('fx-line-chart');
    
    generateChartData(state.selectedChartCurrency);
    renderFXChartCanvas();

    searchInput.addEventListener('focus', () => {
        showFxSuggestions(searchInput.value);
    });

    searchInput.addEventListener('input', (e) => {
        showFxSuggestions(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add('hidden');
        }
    });

    if (canvas) {
        function handleChartHover(clientX) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            
            if (!state.activeChartData || state.activeChartData.length === 0) return;
            
            let closestIdx = 0;
            let minDist = Infinity;
            
            state.activeChartData.forEach((d, idx) => {
                const dist = Math.abs(d.x - mouseX);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = idx;
                }
            });
            
            state.hoveredChartIndex = closestIdx;
            renderFXChartCanvas();
        }

        canvas.addEventListener('mousemove', (e) => {
            handleChartHover(e.clientX);
        });

        canvas.addEventListener('mouseleave', () => {
            state.hoveredChartIndex = null;
            renderFXChartCanvas();
        });

        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleChartHover(e.touches[0].clientX);
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            state.hoveredChartIndex = null;
            renderFXChartCanvas();
        });
    }
}

function showFxSuggestions(query) {
    const suggestionsBox = document.getElementById('fx-search-suggestions-box');
    const q = query.trim().toUpperCase();

    const filtered = CURRENCIES.filter(c => c.code !== 'INR' && (c.code.includes(q) || c.name.toUpperCase().includes(q)));
    
    if (filtered.length === 0) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    suggestionsBox.innerHTML = '';
    filtered.forEach(c => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span>${c.flag}</span>
            <span>${c.code} - ${c.name}</span>
        `;
        item.addEventListener('click', () => {
            state.selectedChartCurrency = c.code;
            document.getElementById('fx-chart-search-input').value = '';
            suggestionsBox.classList.add('hidden');
            
            const inrRate = 1 / c.rate;
            document.getElementById('fx-chart-flag').textContent = c.flag;
            document.getElementById('fx-chart-pair-text').textContent = `${c.code} / INR`;
            document.getElementById('fx-chart-price-text').textContent = `₹${inrRate.toFixed(2)}`;
            
            const isPos = Math.random() > 0.4;
            const changeText = document.getElementById('fx-chart-change-text');
            changeText.textContent = `${isPos ? '+' : '-'}${(Math.random() * 0.5).toFixed(2)}%`;
            changeText.className = `fx-rate-change ${isPos ? 'positive' : 'negative'}`;
            
            generateChartData(c.code);
            renderFXChartCanvas();
        });
        suggestionsBox.appendChild(item);
    });

    suggestionsBox.classList.remove('hidden');
}

function renderFXChartCanvas() {
    const canvas = document.getElementById('fx-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!state.activeChartData || state.activeChartData.length === 0) {
        generateChartData(state.selectedChartCurrency || 'USD');
    }

    const dataPoints = state.activeChartData.map(d => d.val);
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;

    const firstVal = dataPoints[0];
    const lastVal = dataPoints[dataPoints.length - 1];
    const isRise = lastVal >= firstVal;

    const trendColor = isRise ? '#10b981' : '#f43f5e';
    const gradientStart = isRise ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(w - 15, y);
        ctx.stroke();
    }

    const pointsCount = state.activeChartData.length;
    const coords = state.activeChartData.map((d, idx) => {
        const x = 15 + ((w - 30) / (pointsCount - 1)) * idx;
        const y = h - 25 - ((d.val - min) / range) * (h - 50);
        d.x = x;
        d.y = y;
        return { x, y };
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(coords[0].x, h);
    ctx.lineTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        const xc = (coords[i - 1].x + coords[i].x) / 2;
        const yc = (coords[i - 1].y + coords[i].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.lineTo(coords[coords.length - 1].x, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = trendColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        const xc = (coords[i - 1].x + coords[i].x) / 2;
        const yc = (coords[i - 1].y + coords[i].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
    }
    ctx.stroke();

    if (state.hoveredChartIndex !== null && state.hoveredChartIndex !== undefined) {
        const hoveredPt = state.activeChartData[state.hoveredChartIndex];
        if (hoveredPt) {
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(hoveredPt.x, 10);
            ctx.lineTo(hoveredPt.x, h);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = trendColor;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(hoveredPt.x, hoveredPt.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            const tooltipText = `${hoveredPt.val.toFixed(5)} ${hoveredPt.date}`;
            ctx.font = 'bold 9px Outfit, sans-serif';
            const textWidth = ctx.measureText(tooltipText).width;
            const padX = 8;
            const padY = 4;
            const rectW = textWidth + padX * 2;
            const rectH = 18;
            
            let rectX = hoveredPt.x - rectW / 2;
            if (rectX < 4) rectX = 4;
            if (rectX + rectW > w - 4) rectX = w - 4 - rectW;

            let rectY = hoveredPt.y - rectH - 10;
            if (rectY < 4) rectY = hoveredPt.y + 10;

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(rectX, rectY, rectW, rectH, 4);
            } else {
                ctx.rect(rectX, rectY, rectW, rectH);
            }
            ctx.fill();
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tooltipText, rectX + rectW / 2, rectY + rectH / 2);
        }
    } else {
        const last = coords[coords.length - 1];
        ctx.fillStyle = trendColor;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==========================================================================
// EXCHANGE SCREEN SEARCHABLE SELECT DROPDOWNS (Feature 5)
// ==========================================================================
function setupSearchableDropdowns() {
    const btnFrom = document.getElementById('btn-trigger-select-from');
    const btnTo = document.getElementById('btn-trigger-select-to');
    const panelFrom = document.getElementById('panel-select-from');
    const panelTo = document.getElementById('panel-select-to');
    const swapBtn = document.getElementById('btn-swap-exchange');

    btnFrom.addEventListener('click', (e) => {
        e.stopPropagation();
        panelFrom.classList.toggle('hidden');
        panelTo.classList.add('hidden');
        renderSelectOptions('from', '');
    });

    btnTo.addEventListener('click', (e) => {
        e.stopPropagation();
        panelTo.classList.toggle('hidden');
        panelFrom.classList.add('hidden');
        renderSelectOptions('to', '');
    });

    // Close on click away
    document.addEventListener('click', () => {
        panelFrom.classList.add('hidden');
        panelTo.classList.add('hidden');
    });

    // Search events
    panelFrom.querySelector('.select-search-field').addEventListener('input', (e) => {
        renderSelectOptions('from', e.target.value);
    });
    panelTo.querySelector('.select-search-field').addEventListener('input', (e) => {
        renderSelectOptions('to', e.target.value);
    });

    // Stop propagation inside panel clicks
    panelFrom.addEventListener('click', e => e.stopPropagation());
    panelTo.addEventListener('click', e => e.stopPropagation());

    // Swap currencies button
    swapBtn.addEventListener('click', () => {
        const temp = state.exchangeFrom;
        state.exchangeFrom = state.exchangeTo;
        state.exchangeTo = temp;

        updateSelectedCurrenciesUI();
        triggerExchangeCalculation();
    });

    // Bind amount input math trigger
    const inputFrom = document.getElementById('exchange-amount-from');
    inputFrom.addEventListener('input', triggerExchangeCalculation);

    // Set Defaults initially
    updateSelectedCurrenciesUI();

    // Bind conversion submission
    const submitBtn = document.getElementById('btn-submit-exchange');
    submitBtn.addEventListener('click', () => {
        const amtFrom = parseFloat(inputFrom.value);
        if (isNaN(amtFrom) || amtFrom <= 0) return;
        
        // Open authorization PIN modal
        openPinModal(amtFrom);
    });
}

function updateSelectedCurrenciesUI() {
    const cFrom = CURRENCIES.find(c => c.code === state.exchangeFrom);
    const cTo = CURRENCIES.find(c => c.code === state.exchangeTo);

    // Update 'From' trigger UI
    const triggerFrom = document.getElementById('btn-trigger-select-from');
    triggerFrom.querySelector('.trigger-flag').textContent = cFrom.flag;
    triggerFrom.querySelector('.trigger-code').textContent = cFrom.code;
    document.getElementById('exchange-from-balance').textContent = `Bal: ${formatCurrency(state.eMoneyVaults[cFrom.code], cFrom.code)}`;

    // Update 'To' trigger UI
    const triggerTo = document.getElementById('btn-trigger-select-to');
    triggerTo.querySelector('.trigger-flag').textContent = cTo.flag;
    triggerTo.querySelector('.trigger-code').textContent = cTo.code;
    document.getElementById('exchange-to-balance').textContent = `Bal: ${formatCurrency(state.eMoneyVaults[cTo.code], cTo.code)}`;

    // Indicative quote update
    const quoteLabel = document.getElementById('exchange-rate-quote');
    const conversionRate = cTo.rate / cFrom.rate;
    quoteLabel.textContent = `1 ${cFrom.code} = ${conversionRate.toFixed(5)} ${cTo.code}`;
}

function renderSelectOptions(type, filterQuery) {
    const q = filterQuery.trim().toLowerCase();
    const panel = type === 'from' ? document.getElementById('panel-select-from') : document.getElementById('panel-select-to');
    const container = panel.querySelector('.select-options-list');
    container.innerHTML = '';

    const list = CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));

    list.forEach(c => {
        // Prevent matching identical currency options
        if (type === 'from' && c.code === state.exchangeTo) return;
        if (type === 'to' && c.code === state.exchangeFrom) return;

        const opt = document.createElement('div');
        opt.className = 'select-option-item';
        opt.innerHTML = `
            <span class="opt-flag">${c.flag}</span>
            <span class="opt-code">${c.code}</span>
            <span class="opt-name">${c.name}</span>
        `;
        opt.addEventListener('click', () => {
            if (type === 'from') {
                state.exchangeFrom = c.code;
            } else {
                state.exchangeTo = c.code;
            }
            updateSelectedCurrenciesUI();
            triggerExchangeCalculation();
            panel.classList.add('hidden');
            // clear query field
            panel.querySelector('.select-search-field').value = '';
        });
        container.appendChild(opt);
    });
}

function triggerExchangeCalculation() {
    const inputFrom = document.getElementById('exchange-amount-from');
    const inputTo = document.getElementById('exchange-amount-to');
    const feeLabel = document.getElementById('exchange-fee-quote');
    const receiveLabel = document.getElementById('exchange-total-receive');
    const submitBtn = document.getElementById('btn-submit-exchange');
    const errorBox = document.getElementById('exchange-error-msg');

    const amount = parseFloat(inputFrom.value);

    if (isNaN(amount) || amount <= 0) {
        inputTo.value = '';
        feeLabel.textContent = formatCurrency(0, state.exchangeFrom);
        receiveLabel.textContent = `0.00 ${state.exchangeTo}`;
        submitBtn.disabled = true;
        errorBox.classList.add('hidden');
        return;
    }

    const cFrom = CURRENCIES.find(c => c.code === state.exchangeFrom);
    const cTo = CURRENCIES.find(c => c.code === state.exchangeTo);

    // Check Vault limits
    const balanceAvailable = state.eMoneyVaults[state.exchangeFrom] || 0;
    if (amount > balanceAvailable) {
        errorBox.classList.remove('hidden');
        submitBtn.disabled = true;
        inputTo.value = '';
        return;
    }
    errorBox.classList.add('hidden');

    const fee = amount * 0.002; // 0.2% Fee
    const convertAmt = amount - fee;
    const rateTo = cTo.rate / cFrom.rate;
    const finalValuation = convertAmt * rateTo;

    // Set outputs
    inputTo.value = finalValuation.toFixed(2);
    feeLabel.textContent = formatCurrency(fee, state.exchangeFrom);
    receiveLabel.textContent = `${finalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${state.exchangeTo}`;
    submitBtn.disabled = false;
}

// ==========================================================================
// SCREEN 6: eMONEY MULTI-CURRENCY VAULT (Feature 6)
// ==========================================================================
function renderEMoneyScreen() {
    const valuation = calculateTotalValuation('INR');
    document.getElementById('emoney-valuation-display').textContent = `₹${valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const container = document.getElementById('emoney-vaults-list-container');
    container.innerHTML = '';

    CURRENCIES.forEach(c => {
        const bal = state.eMoneyVaults[c.code] || 0;
        
        // Incur equivalent valuation in INR
        const inrRate = 1 / c.rate;
        const inrEquiv = bal * inrRate;

        const card = document.createElement('div');
        card.className = 'vault-card-item';
        card.innerHTML = `
            <div class="vault-card-left">
                <div class="vault-card-flag-box">${c.flag}</div>
                <div class="vault-card-currency-name">
                    <span class="v-code">${c.code}</span>
                    <span class="v-name">${c.name}</span>
                </div>
            </div>
            <div class="vault-card-right">
                <span class="v-bal">${c.symbol}${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span class="v-inr-equiv">≈ ₹${inrEquiv.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================================================
// SCREEN 9: P2P LEDGER & CHAT CHANNELS (Feature 9)
// ==========================================================================
function renderP2PScreen() {
    const contact = state.activeP2PContact || 'Bujjiiii💗💃';
    
    document.getElementById('p2p-contact-name').textContent = contact;
    document.getElementById('p2p-contact-avatar').textContent = contact[0].toUpperCase();

    const ledger = state.p2pLedgers[contact] || [];
    const container = document.getElementById('p2p-chat-ledger-container');
    container.innerHTML = '';

    if (ledger.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No chat transactions</h3>
                <p>Click Pay Cash below to send money directly to ${contact}.</p>
            </div>
        `;
        return;
    }

    ledger.forEach(item => {
        const bubble = document.createElement('div');
        const isSent = item.type === 'sent';
        bubble.className = `p2p-bubble ${isSent ? 'sent' : 'received'}`;
        
        const sign = isSent ? '-' : '+';
        const flowClass = isSent ? 'outflow' : 'inflow';
        
        bubble.innerHTML = `
            <span class="bubble-memo">${item.memo || 'Cash Transfer'}</span>
            <div class="bubble-amount-row">
                <span class="bubble-amt ${flowClass}">${sign}₹${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bubble-time">${item.time} &nbsp; <span class="bubble-status">✓ Settled</span></div>
        `;
        container.appendChild(bubble);
    });

    // Scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

// ==========================================================================
// MODALS MANAGEMENT & KEYPAD VALIDATORS
// ==========================================================================
let activePinAmount = 0;
let pinCodeInput = '';

function setupModals() {
    // Add Money
    const btnDeposit = document.getElementById('btn-deposit-money');
    const modalDeposit = document.getElementById('deposit-modal');
    btnDeposit.addEventListener('click', () => {
        // Populate sources
        const sourceSelect = document.getElementById('deposit-source');
        sourceSelect.innerHTML = '';
        state.linkedBanks.forEach((b, idx) => {
            sourceSelect.innerHTML += `<option value="${idx}">${b.bankName} (${b.accountNum})</option>`;
        });
        
        modalDeposit.classList.remove('hidden');
    });

    document.getElementById('btn-close-deposit-modal').addEventListener('click', () => {
        modalDeposit.classList.add('hidden');
    });

    document.getElementById('deposit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amt = parseFloat(document.getElementById('deposit-amount').value);
        const sourceIdx = parseInt(document.getElementById('deposit-source').value);
        const sourceBank = state.linkedBanks[sourceIdx];

        if (isNaN(amt) || amt <= 0) return;

        // Credit wallet
        state.eMoneyVaults.INR += amt;
        saveState();

        // Create transaction logs
        const newTxn = {
            id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-D`,
            type: 'Deposit',
            title: 'Added money to Wallet',
            amount: amt,
            currency: 'INR',
            date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Settled',
            extraInfo: `${sourceBank.bankName} (${sourceBank.accountNum})`
        };
        state.transactions.unshift(newTxn);
        saveState();

        modalDeposit.classList.add('hidden');
        document.getElementById('deposit-amount').value = '';

        // Trigger Receipt
        openReceiptModal(newTxn);
        renderDashboard();
    });

    // Send Money General
    const btnSend = document.getElementById('btn-send-money');
    const modalSend = document.getElementById('send-modal');
    btnSend.addEventListener('click', () => {
        document.getElementById('send-recipient-id').value = '';
        document.getElementById('send-amount').value = '';
        document.getElementById('send-purpose').value = '';
        document.getElementById('send-available-bal').textContent = `Available: ${formatCurrency(state.eMoneyVaults.INR, 'INR')}`;
        document.getElementById('send-modal-title').textContent = 'Send Cash';
        modalSend.classList.remove('hidden');
    });

    document.getElementById('btn-close-send-modal').addEventListener('click', () => {
        modalSend.classList.add('hidden');
    });

    document.getElementById('send-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const recipient = document.getElementById('send-recipient-id').value.trim();
        const amt = parseFloat(document.getElementById('send-amount').value);
        const memo = document.getElementById('send-purpose').value.trim() || 'P2P Transfer';
        const errorMsg = document.getElementById('send-error-text');

        if (isNaN(amt) || amt <= 0) return;
        
        if (amt > state.eMoneyVaults.INR) {
            errorMsg.classList.remove('hidden');
            return;
        }
        errorMsg.classList.add('hidden');

        // Debit Wallet
        state.eMoneyVaults.INR -= amt;
        
        // P2P Specific updates
        const cleanRecip = recipient.replace('GXC-', '');
        const contacts = ['Bujjiiii💗💃', 'mumma💗', 'Sam', 'Akshi'];
        const matchedContact = contacts.find(c => c.toLowerCase().includes(cleanRecip.toLowerCase()) || cleanRecip.toLowerCase().includes(c.toLowerCase()));
        
        const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today';
        
        if (matchedContact) {
            state.p2pLedgers[matchedContact].push({
                type: 'sent',
                amount: amt,
                memo: memo,
                time: nowStr,
                status: 'Settled'
            });
        }

        const newTxn = {
            id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-T`,
            type: 'Transfer',
            title: `Sent to ${recipient}`,
            amount: -amt,
            currency: 'INR',
            date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Settled',
            extraInfo: `Recipient ID: ${recipient}`
        };
        
        state.transactions.unshift(newTxn);
        saveState();

        modalSend.classList.add('hidden');
        openReceiptModal(newTxn);
        renderDashboard();
    });

    // P2P specific Pay/Request buttons
    document.getElementById('btn-p2p-back').addEventListener('click', () => {
        navigateTo('screen-dashboard');
    });

    document.getElementById('btn-p2p-request').addEventListener('click', () => {
        const contactName = state.activeP2PContact || 'Bujjiiii💗💃';
        state.p2pLedgers[contactName].push({
            type: 'received',
            amount: 500.00,
            memo: 'Requested funds',
            time: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Pending'
        });
        saveState();
        showToast(`Request sent to ${contactName}`);
        renderP2PScreen();
    });

    document.getElementById('btn-p2p-pay').addEventListener('click', () => {
        const contactName = state.activeP2PContact || 'Bujjiiii💗💃';
        document.getElementById('send-recipient-id').value = contactName;
        document.getElementById('send-amount').value = '';
        document.getElementById('send-purpose').value = '';
        document.getElementById('send-available-bal').textContent = `Available: ${formatCurrency(state.eMoneyVaults.INR, 'INR')}`;
        document.getElementById('send-modal-title').textContent = `Pay ${contactName}`;
        modalSend.classList.remove('hidden');
    });

    // General PIN Keypad button bindings
    document.getElementById('btn-close-pin-modal').addEventListener('click', () => {
        document.getElementById('pin-modal').classList.add('hidden');
    });

    const keys = document.querySelectorAll('.keypad-btn');
    keys.forEach(k => {
        k.addEventListener('click', () => {
            const val = k.getAttribute('data-val');
            const dots = document.querySelectorAll('.pin-dot');
            const errorLabel = document.getElementById('pin-error-text');
            errorLabel.classList.add('hidden');

            if (val === 'clear') {
                pinCodeInput = '';
            } else if (val === 'back') {
                pinCodeInput = pinCodeInput.slice(0, -1);
            } else {
                if (pinCodeInput.length < 4) {
                    pinCodeInput += val;
                }
            }

            // Fill visual dots
            dots.forEach((dot, idx) => {
                if (idx < pinCodeInput.length) {
                    dot.classList.add('filled');
                } else {
                    dot.classList.remove('filled');
                }
            });

            // Auto-check PIN
            if (pinCodeInput.length === 4) {
                if (pinCodeInput === '1234') {
                    // Authorized success!
                    document.getElementById('pin-modal').classList.add('hidden');
                    pinCodeInput = '';
                    dots.forEach(d => d.classList.remove('filled'));
                    
                    executeConversionEngine();
                } else {
                    errorLabel.classList.remove('hidden');
                    pinCodeInput = '';
                    dots.forEach(d => d.classList.remove('filled'));
                }
            }
        });
    });

    // Close Receipt button
    document.getElementById('btn-close-receipt').addEventListener('click', () => {
        document.getElementById('receipt-modal').classList.add('hidden');
    });
}

function openPinModal(amountFrom) {
    activePinAmount = amountFrom;
    const cFrom = CURRENCIES.find(c => c.code === state.exchangeFrom);
    const cTo = CURRENCIES.find(c => c.code === state.exchangeTo);
    
    const finalValuation = (amountFrom - (amountFrom * 0.002)) * (cTo.rate / cFrom.rate);

    document.getElementById('pin-modal-from-amt').textContent = formatCurrency(amountFrom, cFrom.code);
    document.getElementById('pin-modal-to-amt').textContent = formatCurrency(finalValuation, cTo.code);
    
    // Clear state
    pinCodeInput = '';
    document.querySelectorAll('.pin-dot').forEach(d => d.classList.remove('filled'));
    document.getElementById('pin-error-text').classList.add('hidden');

    document.getElementById('pin-modal').classList.remove('hidden');
}

function executeConversionEngine() {
    const inputFrom = document.getElementById('exchange-amount-from');
    const amt = parseFloat(inputFrom.value);
    
    const cFrom = CURRENCIES.find(c => c.code === state.exchangeFrom);
    const cTo = CURRENCIES.find(c => c.code === state.exchangeTo);

    const fee = amt * 0.002;
    const convertAmt = amt - fee;
    const rateTo = cTo.rate / cFrom.rate;
    const finalValuation = convertAmt * rateTo;

    // Mutate state vaults
    state.eMoneyVaults[cFrom.code] -= amt;
    state.eMoneyVaults[cTo.code] += finalValuation;

    // Sync base INR balance if base changed
    if (cFrom.code === 'INR') {
        state.eMoneyVaults.INR = state.eMoneyVaults.INR; // self-assign
    }

    const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-EX`,
        type: 'Exchange',
        title: `Exchanged ${cFrom.code} to ${cTo.code}`,
        amount: -amt,
        currency: cFrom.code,
        date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Settled',
        rateInfo: `1 ${cFrom.code} = ${rateTo.toFixed(5)} ${cTo.code}`,
        extraInfo: `Conversion rate: ${rateTo.toFixed(5)}`
    };

    state.transactions.unshift(newTxn);
    saveState();

    inputFrom.value = '';
    document.getElementById('exchange-amount-to').value = '';
    
    showToast('Vault converted successfully!');
    navigateTo('screen-emoney');
    openReceiptModal(newTxn);
}

function openReceiptModal(txn) {
    const modal = document.getElementById('receipt-modal');
    document.getElementById('receipt-date-time').textContent = txn.date;
    
    const formatted = formatCurrency(txn.amount, txn.currency);
    document.getElementById('receipt-display-amount').textContent = formatted;
    document.getElementById('receipt-display-type').textContent = txn.title;
    document.getElementById('receipt-txn-id').textContent = txn.id;

    const rowExtra1 = document.getElementById('receipt-row-extra1');
    const labelExtra1 = rowExtra1.querySelector('.receipt-label');
    const valExtra1 = document.getElementById('receipt-extra-val1');

    const rowExtra2 = document.getElementById('receipt-row-extra2');
    const valExtra2 = document.getElementById('receipt-extra-val2');

    if (txn.type === 'Deposit') {
        labelExtra1.textContent = 'Funding Source';
        valExtra1.textContent = txn.extraInfo || 'Link Bank Account';
        rowExtra2.classList.add('hidden');
    } else if (txn.type === 'Exchange') {
        labelExtra1.textContent = 'Platform Fee';
        valExtra1.textContent = '0.2%';
        rowExtra2.classList.remove('hidden');
        valExtra2.textContent = txn.rateInfo || '1 INR = 0.012 USD';
    } else {
        labelExtra1.textContent = 'Recipient';
        valExtra1.textContent = txn.extraInfo || 'Direct Contact';
        rowExtra2.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

// ==========================================================================
// SCREEN 4: PROFILE RENDER, LINK BANKS, QR CODE (Feature 4)
// ==========================================================================
function renderProfileScreen() {
    document.getElementById('profile-user-display-name').textContent = state.user.name;
    document.getElementById('profile-initials').textContent = state.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Renders SVG QR code representing user credentials
    const qrHolder = document.getElementById('qr-code-holder');
    qrHolder.innerHTML = `
        <svg viewBox="0 0 100 100" width="120" height="120">
            <!-- Outermost grid lines -->
            <rect x="5" y="5" width="20" height="20" fill="none" stroke="%230f172a" stroke-width="4"/>
            <rect x="10" y="10" width="10" height="10" fill="%230f172a"/>
            
            <rect x="75" y="5" width="20" height="20" fill="none" stroke="%230f172a" stroke-width="4"/>
            <rect x="80" y="10" width="10" height="10" fill="%230f172a"/>
            
            <rect x="5" y="75" width="20" height="20" fill="none" stroke="%230f172a" stroke-width="4"/>
            <rect x="10" y="80" width="10" height="10" fill="%230f172a"/>
            
            <!-- Logo in Center -->
            <rect x="40" y="40" width="20" height="20" rx="4" fill="%232563eb"/>
            <circle cx="50" cy="50" r="4" fill="white"/>

            <!-- Random grid dots -->
            <rect x="35" y="10" width="6" height="6" fill="%230f172a"/>
            <rect x="50" y="15" width="6" height="6" fill="%230f172a"/>
            <rect x="60" y="8" width="6" height="6" fill="%230f172a"/>

            <rect x="80" y="35" width="6" height="6" fill="%230f172a"/>
            <rect x="90" y="50" width="6" height="6" fill="%230f172a"/>

            <rect x="10" y="45" width="6" height="6" fill="%230f172a"/>
            <rect x="25" y="55" width="6" height="6" fill="%230f172a"/>

            <rect x="45" y="75" width="6" height="6" fill="%230f172a"/>
            <rect x="60" y="85" width="6" height="6" fill="%230f172a"/>
        </svg>
    `;
    document.getElementById('qr-caption-text').textContent = `GXC-9082-1102 (${state.user.name})`;

    // Linked banks rendering
    const bankContainer = document.getElementById('linked-banks-container');
    bankContainer.innerHTML = '';

    state.linkedBanks.forEach((b, idx) => {
        const item = document.createElement('div');
        item.className = 'bank-item';
        
        const primaryText = b.isPrimary ? '<span class="primary-badge">Primary</span>' : `<button class="see-all-btn btn-sm" onclick="setPrimaryBank(${idx})">Set Primary</button>`;
        const unlinkAction = `<button class="delete-bank-btn" onclick="unlinkBank(${idx})" title="Unlink BankAccount">&times;</button>`;

        item.innerHTML = `
            <div class="bank-info-left">
                <div class="bank-logo-avatar">${b.bankName[0]}</div>
                <div class="bank-meta-text">
                    <span class="bank-name">${b.bankName}</span>
                    <span class="bank-subtext">${b.accountNum} | IFSC: ${b.ifsc}</span>
                </div>
            </div>
            <div class="bank-action-right">
                ${primaryText}
                ${unlinkAction}
            </div>
        `;
        bankContainer.appendChild(item);
    });
}

window.setPrimaryBank = function(idx) {
    state.linkedBanks.forEach((b, i) => b.isPrimary = i === idx);
    saveState();
    renderProfileScreen();
    showToast('Primary funding account updated.');
};

window.unlinkBank = function(idx) {
    if (state.linkedBanks[idx].isPrimary && state.linkedBanks.length > 1) {
        showToast('Please set another bank as primary before unlinking.');
        return;
    }
    state.linkedBanks.splice(idx, 1);
    saveState();
    renderProfileScreen();
    showToast('Bank account unlinked securely.');
};

function setupModalsBanking() {
    const modal = document.getElementById('add-bank-modal');
    document.getElementById('btn-add-bank-modal').addEventListener('click', () => {
        document.getElementById('bank-account-num').value = '';
        document.getElementById('bank-ifsc').value = '';
        modal.classList.remove('hidden');
    });

    document.getElementById('btn-close-bank-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('add-bank-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const bankName = document.getElementById('bank-select-name').value;
        const acct = document.getElementById('bank-account-num').value;
        const ifsc = document.getElementById('bank-ifsc').value.toUpperCase();

        state.linkedBanks.push({
            bankName: bankName,
            accountNum: `•••• ${acct.slice(-4)}`,
            ifsc: ifsc,
            isPrimary: state.linkedBanks.length === 0
        });
        saveState();

        modal.classList.add('hidden');
        renderProfileScreen();
        showToast('Bank linked successfully.');
    });
}

// ==========================================================================
// SCREEN 7: SEARCHABLE LEDGER & FILTERS
// ==========================================================================
let activeHistoryFilter = 'all';

function renderHistoryScreen() {
    const searchInput = document.getElementById('history-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    const container = document.getElementById('history-list-container');
    const noResults = document.getElementById('history-no-results');

    container.innerHTML = '';
    const q = searchInput.value.trim().toLowerCase();

    // Filter logic
    const filtered = state.transactions.filter(t => {
        // Query check
        const matchesQuery = t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.currency.toLowerCase().includes(q);
        
        // Tab filter check
        if (activeHistoryFilter === 'all') return matchesQuery;
        return t.type === activeHistoryFilter && matchesQuery;
    });

    // Toggle clear search button visibility
    if (q.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach(t => {
            const card = createTransactionCard(t);
            container.appendChild(card);
        });
    }
}

// Setup ledger filters
const historySearchInput = document.getElementById('history-search-input');
historySearchInput.addEventListener('input', renderHistoryScreen);

document.getElementById('btn-clear-search').addEventListener('click', () => {
    historySearchInput.value = '';
    renderHistoryScreen();
});

const filterChips = document.querySelectorAll('.filter-chip');
filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeHistoryFilter = chip.getAttribute('data-filter');
        renderHistoryScreen();
    });
});

// ==========================================================================
// TOURIST DESTINATIONS CANVASES SIMULATOR (Feature 3b)
// ==========================================================================
// ==========================================================================
// SEARCHABLE TOURIST EXPLORER MODULE (Feature 3b)
// ==========================================================================
const TOURIST_DESTINATIONS = [
    { name: 'Eiffel Tower', country: 'France', city: 'Paris', currency: 'EUR', flag: '🇫🇷', imgSymbol: '🗼', description: 'Iconic iron lattice tower on the Champ de Mars.' },
    { name: 'Louvre Museum', country: 'France', city: 'Paris', currency: 'EUR', flag: '🇫🇷', imgSymbol: '🏛️', description: 'The world\'s largest art museum and a historic monument.' },
    { name: 'Statue of Liberty', country: 'United States', city: 'New York', currency: 'USD', flag: '🇺🇸', imgSymbol: '🗽', description: 'Colossal neoclassical sculpture on Liberty Island.' },
    { name: 'Grand Canyon', country: 'United States', city: 'Arizona', currency: 'USD', flag: '🇺🇸', imgSymbol: '🏞️', description: 'Steep-sided canyon carved by the Colorado River.' },
    { name: 'Big Ben & Parliament', country: 'United Kingdom', city: 'London', currency: 'GBP', flag: '🇬🇧', imgSymbol: '🕰️', description: 'Famous clock tower and seat of the UK parliament.' },
    { name: 'Mount Fuji', country: 'Japan', city: 'Tokyo', currency: 'JPY', flag: '🇯🇵', imgSymbol: '🗻', description: 'Japan\'s tallest peak, an active stratovolcano.' },
    { name: 'Kinkaku-ji', country: 'Japan', city: 'Kyoto', currency: 'JPY', flag: '🇯🇵', imgSymbol: '⛩️', description: 'Zen Buddhist temple with two top floors covered in gold leaf.' },
    { name: 'Burj Khalifa', country: 'United Arab Emirates', city: 'Dubai', currency: 'AED', flag: '🇦🇪', imgSymbol: '🏙️', description: 'The tallest structure and building in the world.' },
    { name: 'Colosseum', country: 'Italy', city: 'Rome', currency: 'EUR', flag: '🇮🇹', imgSymbol: '🏟️', description: 'Ancient oval amphitheatre in the centre of Rome.' },
    { name: 'Taj Mahal', country: 'India', city: 'Agra', currency: 'INR', flag: '🇮🇳', imgSymbol: '🕌', description: 'Ivory-white marble mausoleum on the Yamuna river.' },
    { name: 'Sydney Opera House', country: 'Australia', city: 'Sydney', currency: 'AUD', flag: '🇦🇺', imgSymbol: '🎭', description: 'Multi-venue performing arts centre in Sydney.' },
    { name: 'Great Wall of China', country: 'China', city: 'Beijing', currency: 'CNY', flag: '🇨🇳', imgSymbol: '🧱', description: 'Ancient series of walls and fortifications.' }
];

function setupTouristExplorer() {
    const touristModal = document.getElementById('tourist-modal');
    const searchInput = document.getElementById('tourist-search-input');
    
    document.getElementById('btn-drawer-tourist').addEventListener('click', () => {
        closeDrawer();
        touristModal.classList.remove('hidden');
        searchInput.value = '';
        renderTouristExplorer('');
    });

    document.getElementById('btn-close-tourist-modal').addEventListener('click', () => {
        touristModal.classList.add('hidden');
    });

    searchInput.addEventListener('input', (e) => {
        renderTouristExplorer(e.target.value);
    });
}

function renderTouristExplorer(query = '') {
    const container = document.getElementById('tourist-explorer-grid-container');
    if (!container) return;
    container.innerHTML = '';
    const q = query.trim().toLowerCase();
    
    const filtered = TOURIST_DESTINATIONS.filter(d => 
        d.country.toLowerCase().includes(q) || 
        d.name.toLowerCase().includes(q) || 
        d.city.toLowerCase().includes(q)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; padding: 20px 10px; text-align: center;">
                <h3 style="font-size: 14px; margin-bottom: 4px; color: #ffffff;">No destinations found</h3>
                <p style="font-size: 11px; color: var(--text-light);">Try searching "France", "USA", "Japan", etc.</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(d => {
        const rateObj = CURRENCIES.find(c => c.code === d.currency) || { rate: 1, flag: '🌐' };
        const rateStr = `1 INR = ${(rateObj.rate).toFixed(5)} ${d.currency}`;
        
        const card = document.createElement('div');
        card.className = 'tourist-dest-card';
        card.innerHTML = `
            <div class="dest-card-header">
                <span class="dest-img-symbol">${d.imgSymbol}</span>
                <div class="dest-meta">
                    <h4 class="dest-name">${d.name}</h4>
                    <span class="dest-location">${d.flag} ${d.city}, ${d.country}</span>
                </div>
            </div>
            <p class="dest-desc">${d.description}</p>
            <div class="dest-exchange-rate">
                <span class="rate-label" style="color: #94a3b8;">Local Currency: <strong style="color: #ffffff;">${rateObj.flag} ${d.currency}</strong></span>
                <span class="rate-value text-green">${rateStr}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================================================
// NOTIFICATIONS BELL SYSTEM (Feature 7)
// ==========================================================================
function setupNotifications() {
    const bellBtn = document.getElementById('btn-notification-bell');
    const dropdown = document.getElementById('notifications-dropdown');
    const clearBtn = document.getElementById('btn-clear-notifications');

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        renderNotificationsDropdown();
    });

    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());

    clearBtn.addEventListener('click', () => {
        state.notifications = [];
        renderNotificationsDropdown();
        document.getElementById('bell-badge-indicator').classList.add('hidden');
        showToast('Notifications cleared.');
    });

    // Check count of unread notifications
    const unread = state.notifications.some(n => !n.read);
    const badge = document.getElementById('bell-badge-indicator');
    if (unread) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderNotificationsDropdown() {
    const list = document.getElementById('notifications-list-container');
    list.innerHTML = '';

    if (state.notifications.length === 0) {
        list.innerHTML = `
            <div class="no-results" style="padding: 20px;">
                <p>All cleared!</p>
            </div>
        `;
        return;
    }

    state.notifications.forEach(n => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        
        const bullet = n.read ? '' : '<div class="notif-bullet"></div>';
        
        div.innerHTML = `
            ${bullet}
            <div class="notif-content">
                <span class="notif-desc">${n.text}</span>
                <span class="notif-time">${n.time}</span>
            </div>
        `;

        div.addEventListener('click', () => {
            n.read = true;
            renderNotificationsDropdown();
            // Sync badge
            const unread = state.notifications.some(n => !n.read);
            if (!unread) {
                document.getElementById('bell-badge-indicator').classList.add('hidden');
            }
        });

        list.appendChild(div);
    });
}

// ==========================================================================
// OFFLINE MODE ARCADE GAME ENGINE (Feature 8)
// ==========================================================================
let offlineGameLoop = null;
let isOfflineGameRunning = false;
let gameScore = 0;
let gameHealth = 100;
const gameRiskProjectiles = [];
const gameYieldProjectiles = [];
let centralCoreAngle = 0; // shield arc angle

function setupOfflineMode() {
    const offlineScreen = document.getElementById('offline-screen');
    const startBtn = document.getElementById('btn-start-game');
    const reconnectBtn = document.getElementById('btn-reconnect-simulation');

    // System Offline / Online Hooks
    window.addEventListener('offline', () => {
        triggerOfflineState();
    });

    window.addEventListener('online', () => {
        exitOfflineState();
    });

    // Manual Reconnect Simulation click
    reconnectBtn.addEventListener('click', () => {
        // Uncheck simulating offline checkbox
        document.getElementById('toggle-simulate-offline').checked = false;
        exitOfflineState();
    });

    startBtn.addEventListener('click', () => {
        document.querySelector('.game-instructions').classList.add('hidden');
        document.getElementById('game-canvas-wrapper').classList.remove('hidden');
        startOfflineArcadeGame();
    });
}

function triggerOfflineState() {
    document.getElementById('offline-screen').classList.remove('hidden');
    document.querySelector('.game-instructions').classList.remove('hidden');
    document.getElementById('game-canvas-wrapper').classList.add('hidden');
    
    stopOfflineArcadeGame();
}

function exitOfflineState() {
    document.getElementById('offline-screen').classList.add('hidden');
    stopOfflineArcadeGame();
    showToast('Device connection online restored.');
}

function startOfflineArcadeGame() {
    isOfflineGameRunning = true;
    gameScore = 0;
    gameHealth = 100;
    gameRiskProjectiles.length = 0;
    gameYieldProjectiles.length = 0;
    
    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-health').textContent = '100%';

    const canvas = document.getElementById('game-canvas');
    
    // Canvas Mouse listeners to rotate yield shield
    canvas.addEventListener('mousemove', handleShieldMovement);
    canvas.addEventListener('touchmove', handleShieldTouchMovement, { passive: true });

    // Loop
    offlineGameLoop = requestAnimationFrame(gameTick);
}

function stopOfflineArcadeGame() {
    isOfflineGameRunning = false;
    cancelAnimationFrame(offlineGameLoop);
}

function handleShieldMovement(e) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - (canvas.width / 2);
    const y = e.clientY - rect.top - (canvas.height / 2);
    centralCoreAngle = Math.atan2(y, x);
}

function handleShieldTouchMovement(e) {
    if (e.touches.length === 0) return;
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left - (canvas.width / 2);
    const y = e.touches[0].clientY - rect.top - (canvas.height / 2);
    centralCoreAngle = Math.atan2(y, x);
}

function gameTick() {
    if (!isOfflineGameRunning) return;

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Spawn Projectiles randomly
    if (Math.random() < 0.035) {
        // Spawn Risk (Red Circle)
        const angle = Math.random() * Math.PI * 2;
        gameRiskProjectiles.push({
            x: cx + Math.cos(angle) * (w / 2),
            y: cy + Math.sin(angle) * (h / 2),
            speed: 1.5 + Math.random() * 1.5,
            radius: 5
        });
    }

    if (Math.random() < 0.015) {
        // Spawn Yield (Gold Circle)
        const angle = Math.random() * Math.PI * 2;
        gameYieldProjectiles.push({
            x: cx + Math.cos(angle) * (w / 2),
            y: cy + Math.sin(angle) * (h / 2),
            speed: 1.2 + Math.random() * 1.0,
            radius: 5
        });
    }

    // Draw Core Portfolio (Player Orb)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Draw shield arc
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, centralCoreAngle - 0.6, centralCoreAngle + 0.6);
    ctx.stroke();

    // Update & Draw Risks
    for (let i = gameRiskProjectiles.length - 1; i >= 0; i--) {
        const p = gameRiskProjectiles[i];
        
        // Move towards center
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.hypot(dx, dy);
        
        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;

        // Collision Check Shield (Radius 26)
        if (dist <= 28 && dist >= 22) {
            const angleToP = Math.atan2(p.y - cy, p.x - cx);
            // Check if within shield angular arc boundaries
            let diff = Math.abs(angleToP - centralCoreAngle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;

            if (diff < 0.6) {
                // Blocked!
                gameScore += 10;
                document.getElementById('game-score').textContent = gameScore;
                gameRiskProjectiles.splice(i, 1);
                continue;
            }
        }

        // Collision Core check
        if (dist <= 14) {
            gameHealth -= 20;
            if (gameHealth < 0) gameHealth = 0;
            document.getElementById('game-health').textContent = `${gameHealth}%`;
            gameRiskProjectiles.splice(i, 1);
            
            if (gameHealth === 0) {
                stopOfflineArcadeGame();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#ef4444';
                ctx.font = '700 16px Outfit, sans-serif';
                ctx.fillText('PORTFOLIO CRASHED', cx - 74, cy - 8);
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Outfit, sans-serif';
                ctx.fillText(`Score Secured: ${gameScore}`, cx - 44, cy + 16);
                
                // Show retry button trigger
                setTimeout(() => {
                    document.querySelector('.game-instructions').classList.remove('hidden');
                    document.getElementById('game-canvas-wrapper').classList.add('hidden');
                }, 2000);
            }
            continue;
        }

        // Render
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Update & Draw Yields
    for (let i = gameYieldProjectiles.length - 1; i >= 0; i--) {
        const p = gameYieldProjectiles[i];

        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.hypot(dx, dy);

        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;

        // Collision core check (collected yield)
        if (dist <= 14) {
            gameScore += 25;
            gameHealth = Math.min(100, gameHealth + 5);
            
            document.getElementById('game-score').textContent = gameScore;
            document.getElementById('game-health').textContent = `${gameHealth}%`;
            gameYieldProjectiles.splice(i, 1);
            continue;
        }

        // Render Yield (Gold Star/Circle)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (isOfflineGameRunning) {
        offlineGameLoop = requestAnimationFrame(gameTick);
    }
}

// ==========================================================================
// DEVELOPER & DEMO CONTROLS (Feature 7 / 8)
// ==========================================================================
function setupDeveloperControls() {
    // Offline simulation checkbox
    const toggleOffline = document.getElementById('toggle-simulate-offline');
    toggleOffline.addEventListener('change', (e) => {
        if (e.target.checked) {
            triggerOfflineState();
        } else {
            exitOfflineState();
        }
    });

    // Reset demo wallet
    document.getElementById('btn-reset-wallet').addEventListener('click', () => {
        const defaultVaults = {
            INR: 150000.00,
            USD: 450.00,
            EUR: 210.00,
            JPY: 18000.00,
            AED: 380.00,
            GBP: 95.00
        };
        state.eMoneyVaults = { ...defaultVaults };
        CURRENCIES.forEach(c => {
            if (state.eMoneyVaults[c.code] === undefined) {
                state.eMoneyVaults[c.code] = 0.00;
            }
        });
        state.transactions = [
            { id: 'TXN-00109-A', type: 'Deposit', title: 'Salary Payout Received', amount: 100000.00, currency: 'INR', date: '01 July 2026, 10:00 AM', status: 'Settled' },
            { id: 'TXN-00110-B', type: 'Transfer', title: 'Sent to Rahul (GXC-8800)', amount: -4500.00, currency: 'INR', date: '04 July 2026, 09:15 AM', status: 'Settled' },
            { id: 'TXN-00111-C', type: 'Exchange', title: 'Exchanged INR to USD', amount: -8345.00, currency: 'INR', date: 'Yesterday, 04:12 PM', status: 'Settled', rateInfo: '1 INR = 0.01198 USD' }
        ];
        
        saveState();
        renderProfileScreen();
        showToast('Demo wallets reverted successfully.');
    });
}

// ==========================================================================
// VOICE TRANSLATOR & ADD CONTACT MODALS (Feature 1 & Feature 6b)
// ==========================================================================
function setupSpeechTranslator() {
    const micBtn = document.getElementById('btn-mic');
    const translateInput = document.getElementById('translate-input-text');
    const translateSubmit = document.getElementById('btn-translate-submit');
    const errorOverlay = document.getElementById('translate-error-overlay');
    
    let isListening = false;
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('recording');
            translateInput.placeholder = "Listening...";
        };
        
        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('recording');
            translateInput.placeholder = "Speak or type text to translate...";
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            translateInput.value = transcript;
        };
        
        recognition.onerror = (e) => {
            console.error("Speech recognition error:", e);
            showToast("Speech recognition error: " + e.error);
        };
    }
    
    micBtn.addEventListener('click', () => {
        if (!SpeechRecognition) {
            showToast("Web Speech API is not supported in this browser.");
            return;
        }
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    translateSubmit.addEventListener('click', () => {
        if (!translateInput.value.trim()) {
            showToast("Please enter or speak some text first.");
            return;
        }
        
        errorOverlay.classList.remove('hidden');
        setTimeout(() => {
            errorOverlay.classList.add('hidden');
        }, 5000);
    });
}

function setupContactModal() {
    const modal = document.getElementById('add-contact-modal');
    const closeBtn = document.getElementById('btn-close-contact-modal');
    const form = document.getElementById('add-contact-form');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-new-name').value.trim();
        const id = document.getElementById('contact-new-id').value.trim();
        
        if (!name || !id) return;
        
        if (state.contacts.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast("Contact name already exists.");
            return;
        }
        
        const palettes = ['color-p1', 'color-p2', 'color-p3', 'color-p4'];
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        
        const newContact = {
            name: name,
            initial: name[0].toUpperCase(),
            palette: randomPalette,
            id: id
        };
        
        state.contacts.push(newContact);
        if (!state.p2pLedgers[name]) {
            state.p2pLedgers[name] = [];
        }
        
        saveState();
        modal.classList.add('hidden');
        renderContactsBar();
        showToast(`Contact "${name}" added successfully.`);
    });
}
