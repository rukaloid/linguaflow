// Main application JavaScript

// DOM elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const mobileLoginBtn = document.getElementById('mobile-login-btn');
const mobileRegisterBtn = document.getElementById('mobile-register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeModals = document.querySelectorAll('.close-modal');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const startLearningBtn = document.getElementById('start-learning-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const languageCards = document.querySelectorAll('.language-card');
const languageBtns = document.querySelectorAll('.language-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Current user state
let currentUser = null;
let selectedLanguage = 'english';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in (in a real app, this would check with a backend)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize exercises
    if (typeof initExercises === 'function') {
        initExercises();
    }
    
    // Initialize dashboard
    if (typeof initDashboard === 'function') {
        initDashboard();
    }
}

function setupEventListeners() {
    // Mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToSection(targetId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Auth buttons
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    mobileLoginBtn.addEventListener('click', () => openModal(loginModal));
    mobileRegisterBtn.addEventListener('click', () => openModal(registerModal));
    
    // Modal controls
    closeModals.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        closeAllModals();
        openModal(registerModal);
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        closeAllModals();
        openModal(loginModal);
    });
    
    // Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Hero buttons
    startLearningBtn.addEventListener('click', function() {
        navigateToSection('exercises');
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('a[href="#exercises"]').classList.add('active');
    });
    
    learnMoreBtn.addEventListener('click', function() {
        navigateToSection('features');
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('a[href="#features"]').classList.add('active');
    });
    
    // Language selection
    languageCards.forEach(card => {
        card.addEventListener('click', function() {
            const language = this.getAttribute('data-language');
            selectLanguage(language);
        });
    });
    
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.language-card');
            const language = card.getAttribute('data-language');
            selectLanguage(language);
            
            // Show loading and navigate to exercises
            showLoading();
            setTimeout(() => {
                hideLoading();
                navigateToSection('exercises');
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('a[href="#exercises"]').classList.add('active');
            }, 1500);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    
    // Change icon
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

function openModal(modal) {
    closeAllModals();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        // In a real app, this would validate with a backend
        if (email && password) {
            // For demo purposes, we'll create a user object
            currentUser = {
                id: 1,
                name: email.split('@')[0],
                email: email,
                language: 'english',
                joinDate: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            updateUIForUser();
            
            // Close modal and show success
            closeAllModals();
            hideLoading();
            showNotification('Вход выполнен успешно!', 'success');
        } else {
            hideLoading();
            showNotification('Пожалуйста, заполните все поля', 'error');
        }
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const language = document.getElementById('register-language').value;
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        // In a real app, this would send data to a backend
        if (name && email && password) {
            // For demo purposes, we'll create a user object
            currentUser = {
                id: Date.now(),
                name: name,
                email: email,
                language: language,
                joinDate: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('selectedLanguage', language);
            
            // Update UI
            updateUIForUser();
            
            // Close modal and show success
            closeAllModals();
            hideLoading();
            showNotification('Регистрация прошла успешно!', 'success');
            
            // Navigate to dashboard
            navigateToSection('dashboard');
        } else {
            hideLoading();
            showNotification('Пожалуйста, заполните все поля', 'error');
        }
    }, 1500);
}

function updateUIForUser() {
    if (currentUser) {
        // Update user actions in header
        const userActions = document.querySelector('.user-actions');
        userActions.innerHTML = `
            <div class="user-info">
                <span>Привет, ${currentUser.name}</span>
            </div>
            <button class="btn btn-outline" id="logout-btn">Выйти</button>
        `;
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        
        // Update mobile auth
        const mobileAuth = document.querySelector('.mobile-auth');
        mobileAuth.innerHTML = `
            <div class="user-info">
                <span>Привет, ${currentUser.name}</span>
            </div>
            <button class="btn btn-outline" id="mobile-logout-btn">Выйти</button>
        `;
        
        // Add mobile logout event listener
        document.getElementById('mobile-logout-btn').addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Reset UI
    const userActions = document.querySelector('.user-actions');
    userActions.innerHTML = `
        <button class="btn btn-outline" id="login-btn">Войти</button>
        <button class="btn btn-primary" id="register-btn">Регистрация</button>
    `;
    
    // Reset mobile auth
    const mobileAuth = document.querySelector('.mobile-auth');
    mobileAuth.innerHTML = `
        <button class="btn btn-outline" id="mobile-login-btn">Войти</button>
        <button class="btn btn-primary" id="mobile-register-btn">Регистрация</button>
    `;
    
    // Re-attach event listeners
    document.getElementById('login-btn').addEventListener('click', () => openModal(loginModal));
    document.getElementById('register-btn').addEventListener('click', () => openModal(registerModal));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openModal(loginModal));
    document.getElementById('mobile-register-btn').addEventListener('click', () => openModal(registerModal));
    
    // Close mobile menu if open
    if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
    
    showNotification('Вы вышли из системы', 'info');
}

function selectLanguage(language) {
    selectedLanguage = language;
    
    // Update UI to show selected language
    languageCards.forEach(card => {
        card.classList.remove('selected');
        if (card.getAttribute('data-language') === language) {
            card.classList.add('selected');
        }
    });
    
    // Save selection
    localStorage.setItem('selectedLanguage', language);
    
    showNotification(`Выбран язык: ${getLanguageName(language)}`, 'success');
}

function getLanguageName(languageCode) {
    const languages = {
        'english': 'Английский',
        'spanish': 'Испанский',
        'french': 'Французский',
        'german': 'Немецкий',
        'italian': 'Итальянский',
        'japanese': 'Японский'
    };
    
    return languages[languageCode] || languageCode;
}

function showLoading() {
    loadingSpinner.classList.add('active');
}

function hideLoading() {
    loadingSpinner.classList.remove('active');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for notification
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: var(--border-radius);
                padding: 15px 20px;
                box-shadow: var(--box-shadow-hover);
                z-index: 5000;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary);
                max-width: 350px;
            }
            .notification.success {
                border-left-color: var(--success);
            }
            .notification.error {
                border-left-color: var(--danger);
            }
            .notification.info {
                border-left-color: var(--primary);
            }
            .notification.active {
                transform: translateX(0);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-content i {
                font-size: 1.2rem;
            }
            .notification.success i {
                color: var(--success);
            }
            .notification.error i {
                color: var(--danger);
            }
            .notification.info i {
                color: var(--primary);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Utility function to get selected language
function getSelectedLanguage() {
    return localStorage.getItem('selectedLanguage') || 'english';
}

// Export functions for use in other modules
window.app = {
    getSelectedLanguage,
    showLoading,
    hideLoading,
    showNotification,
    navigateToSection
};