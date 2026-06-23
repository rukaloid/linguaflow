// ==================== ИМПОРТЫ ====================
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentUser = null;
let currentAuthUser = null;
let selectedLanguage = 'english';

// DOM элементы
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
const loadingSpinner = document.getElementById('loading-spinner');
const adminLinkContainer = document.getElementById('adminLinkContainer');
const startLearningBtn = document.getElementById('start-learning-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const learnMoreModal = document.getElementById('learn-more-modal');

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function showLoading() { if (loadingSpinner) loadingSpinner.classList.add('active'); }
function hideLoading() { if (loadingSpinner) loadingSpinner.classList.remove('active'); }

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('active');
    const icon = mobileMenuBtn?.querySelector('i');
    if (icon) {
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

function updateUIForUser() {
    if (!currentUser) return;
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        userActions.innerHTML = `
            <div class="user-info"><span>Привет, ${currentUser.name || currentUser.email.split('@')[0]}</span></div>
            <button class="btn btn-outline" id="logout-btn">Выйти</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
    const mobileAuth = document.querySelector('.mobile-auth');
    if (mobileAuth) {
        mobileAuth.innerHTML = `
            <div class="user-info"><span>${currentUser.name || currentUser.email}</span></div>
            <button class="btn btn-outline" id="mobile-logout-btn">Выйти</button>
        `;
        document.getElementById('mobile-logout-btn').addEventListener('click', handleLogout);
    }
    if (adminLinkContainer && currentUser.role === 'admin') {
        adminLinkContainer.style.display = 'block';
    } else if (adminLinkContainer) {
        adminLinkContainer.style.display = 'none';
    }
}

function resetUIToGuest() {
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        userActions.innerHTML = `
            <button class="btn btn-outline" id="login-btn">Войти</button>
            <button class="btn btn-primary" id="register-btn">Регистрация</button>
        `;
        document.getElementById('login-btn').addEventListener('click', () => openModal(loginModal));
        document.getElementById('register-btn').addEventListener('click', () => openModal(registerModal));
    }
    const mobileAuth = document.querySelector('.mobile-auth');
    if (mobileAuth) {
        mobileAuth.innerHTML = `
            <button class="btn btn-outline" id="mobile-login-btn">Войти</button>
            <button class="btn btn-primary" id="mobile-register-btn">Регистрация</button>
        `;
        document.getElementById('mobile-login-btn').addEventListener('click', () => openModal(loginModal));
        document.getElementById('mobile-register-btn').addEventListener('click', () => openModal(registerModal));
    }
    if (adminLinkContainer) adminLinkContainer.style.display = 'none';
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
}

// ==================== УПРАВЛЕНИЕ ДОСТУПОМ К УПРАЖНЕНИЯМ ====================
function toggleExercisesAccess(user) {
    const guestMessage = document.getElementById('guest-exercise-message');
    const exerciseTabs = document.querySelector('.exercise-tabs');
    const exerciseContents = document.querySelectorAll('.exercise-content');
    
    if (user) {
        // Авторизован — показываем упражнения
        if (guestMessage) guestMessage.style.display = 'none';
        if (exerciseTabs) exerciseTabs.style.display = 'flex';
        exerciseContents.forEach(el => el.style.display = '');
        if (window.initExercises) window.initExercises();
    } else {
        // Не авторизован — показываем сообщение
        if (guestMessage) guestMessage.style.display = 'block';
        if (exerciseTabs) exerciseTabs.style.display = 'none';
        exerciseContents.forEach(el => el.style.display = 'none');
    }
}

// ==================== ВЫБОР ЯЗЫКА ====================
function selectLanguage(language) {
    selectedLanguage = language;
    localStorage.setItem('selectedLanguage', language);
    if (window.switchLanguage) window.switchLanguage(language);
    showNotification(`Выбран язык: ${language === 'english' ? 'Английский' : 'Испанский'}`, 'success');
}

function setupLanguageButtons() {
    const languageBtns = document.querySelectorAll('.language-btn');
    languageBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.language-card');
            if (!card) return;
            const language = card.getAttribute('data-language');
            if (language) {
                selectLanguage(language);
                // Проверяем, авторизован ли пользователь, прежде чем перейти к упражнениям
                if (auth.currentUser) {
                    navigateToSection('exercises');
                } else {
                    showNotification('Для доступа к упражнениям войдите или зарегистрируйтесь', 'info');
                }
            }
        });
    });
}

// ==================== РЕГИСТРАЦИЯ / ВХОД / ВЫХОД ====================
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const language = document.getElementById('register-language').value;
    if (!name || !email || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    showLoading();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        await new Promise(resolve => setTimeout(resolve, 500));
        const userData = {
            uid: authUser.uid,
            email: email,
            name: name,
            selectedLanguage: language,
            registeredAt: new Date().toISOString(),
            stats: {
                streakDays: 0,
                accuracy: 0,
                wordsLearned: 0,
                currentLevel: 'A1',
                totalPoints: 0,
                lastActive: new Date().toISOString()
            },
            settings: { notifications: true, theme: 'dark', dailyGoal: 15 },
            banned: false,
            role: 'user'
        };
        await setDoc(doc(db, 'users', authUser.uid), userData);
        const progressData = {
            userId: authUser.uid,
            exercises: {
                multipleChoice: { completed: 0, correct: 0, lastScore: 0 },
                fillBlanks: { completed: 0, correct: 0, lastScore: 0 },
                matching: { completed: 0, correct: 0, lastScore: 0 },
                listening: { completed: 0, correct: 0, lastScore: 0 }
            },
            vocabulary: [],
            activities: [],
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'userProgress', authUser.uid), progressData);
        const achievementsData = {
            userId: authUser.uid,
            earnedAchievements: [],
            totalPoints: 0,
            lastAchievementAt: null
        };
        await setDoc(doc(db, 'achievements', authUser.uid), achievementsData);
        currentAuthUser = authUser;
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify({ uid: authUser.uid, email }));
        updateUIForUser();
        toggleExercisesAccess(authUser);
        closeAllModals();
        hideLoading();
        showNotification('Регистрация успешна!', 'success');
        navigateToSection('dashboard');
    } catch (error) {
        hideLoading();
        console.error('Ошибка регистрации:', error);
        let msg = 'Ошибка регистрации';
        if (error.code === 'auth/email-already-in-use') msg = 'Email уже используется';
        else if (error.code === 'auth/weak-password') msg = 'Пароль слишком слабый';
        else if (error.message) msg = error.message;
        showNotification(msg, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
        showNotification('Введите email и пароль', 'error');
        return;
    }
    showLoading();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (!userDoc.exists()) {
            await signOut(auth);
            throw new Error('Пользователь не найден в базе');
        }
        const userData = userDoc.data();
        if (userData.banned === true) {
            await signOut(auth);
            showNotification('Ваш аккаунт заблокирован администратором', 'error');
            hideLoading();
            return;
        }
        currentAuthUser = authUser;
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify({ uid: authUser.uid, email }));
        updateUIForUser();
        toggleExercisesAccess(authUser);
        closeAllModals();
        hideLoading();
        showNotification('Вход выполнен!', 'success');
        navigateToSection('dashboard');
    } catch (error) {
        hideLoading();
        let msg = 'Ошибка входа';
        if (error.code === 'auth/user-not-found') msg = 'Пользователь не найден';
        else if (error.code === 'auth/wrong-password') msg = 'Неверный пароль';
        else if (error.message) msg = error.message;
        showNotification(msg, 'error');
        console.error(error);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        currentUser = null;
        currentAuthUser = null;
        localStorage.removeItem('currentUser');
        resetUIToGuest();
        toggleExercisesAccess(null);
        if (mobileMenu?.classList.contains('active')) toggleMobileMenu();
        showNotification('Вы вышли из системы', 'info');
        navigateToSection('home');
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
}

// ==================== НАСТРОЙКА ОБРАБОТЧИКОВ ====================
function setupEventListeners() {
    // Мобильное меню
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Навигация
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1) || 'home';
            navigateToSection(targetId);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (mobileMenu?.classList.contains('active')) toggleMobileMenu();
        });
    });
    
    // Кнопки входа/регистрации
    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (registerBtn) registerBtn.addEventListener('click', () => openModal(registerModal));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => openModal(loginModal));
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => openModal(registerModal));
    
    // Закрытие модальных окон
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Переключение между модалками
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(registerModal);
        });
    }
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
        });
    }
    
    // Отправка форм
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    // Кнопка "Начать обучение"
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', () => navigateToSection('languages'));
    }
    
    // Кнопка "Узнать больше"
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (learnMoreModal) {
                learnMoreModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Закрытие модального окна "Узнать больше"
    const closeLearnMoreBtn = document.getElementById('close-learn-more-btn');
    if (closeLearnMoreBtn) {
        closeLearnMoreBtn.addEventListener('click', function() {
            if (learnMoreModal) {
                learnMoreModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Закрытие модальных окон при клике на фон
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Кнопки в сообщении для гостей
    document.getElementById('guest-login-btn')?.addEventListener('click', () => openModal(loginModal));
    document.getElementById('guest-register-btn')?.addEventListener('click', () => openModal(registerModal));
    
    // Языковые кнопки
    setupLanguageButtons();
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initializeApp() {
    onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
            const userDoc = await getDoc(doc(db, 'users', authUser.uid));
            if (userDoc.exists()) {
                currentUser = userDoc.data();
                currentAuthUser = authUser;
                localStorage.setItem('currentUser', JSON.stringify({ uid: authUser.uid, email: authUser.email }));
                updateUIForUser();
                toggleExercisesAccess(authUser);
            } else {
                await signOut(auth);
                resetUIToGuest();
                toggleExercisesAccess(null);
            }
        } else {
            currentUser = null;
            currentAuthUser = null;
            localStorage.removeItem('currentUser');
            resetUIToGuest();
            toggleExercisesAccess(null);
        }
        if (window.updateDashboard) window.updateDashboard();
    });
    
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang === 'english' || savedLang === 'spanish') {
        selectedLanguage = savedLang;
    } else {
        selectedLanguage = 'english';
    }
    
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.app = {
    getSelectedLanguage: () => selectedLanguage,
    showLoading,
    hideLoading,
    showNotification,
    navigateToSection,
    getCurrentUser: () => currentUser
};