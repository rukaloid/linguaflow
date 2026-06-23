// ==================== ИМПОРТЫ ====================
import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ==================== ГЛОБАЛЬНЫЕ ДАННЫЕ ====================
let allAchievements = [];
let userAchievements = [];
let dashboardData = {
    streak: 0,
    accuracy: 0,
    wordsLearned: 0,
    currentLevel: 'A1',
    activities: [],
    totalAttempts: 0,
    totalCorrect: 0,
    lastActiveDate: null,
    exercisesByType: {},
    weeklyGoal: {
        total: 7,
        current: 0,
        completed: [false, false, false, false, false, false, false],
        lastCompletedDate: ''
    }
};

// ==================== ЗАГРУЗКА СПИСКА ДОСТИЖЕНИЙ ====================
async function loadAllAchievements() {
    try {
        const snapshot = await getDocs(collection(db, 'all_achievements'));
        if (snapshot.empty) {
            await seedDefaultAchievements();
            return loadAllAchievements();
        }
        allAchievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem('allAchievements', JSON.stringify(allAchievements));
        return allAchievements;
    } catch (error) {
        console.warn('Ошибка загрузки достижений, используем кэш:', error);
        const cached = localStorage.getItem('allAchievements');
        if (cached) allAchievements = JSON.parse(cached);
        return allAchievements;
    }
}

async function seedDefaultAchievements() {
    const defaults = [
        { id: 'first_exercise', name: 'Первое упражнение', description: 'Пройдите любое упражнение', category: 'beginner', difficulty: 'BRONZE', icon: 'star', points: 10 },
        { id: 'streak_7', name: 'Усердный ученик', description: 'Заниматься 7 дней подряд', category: 'regularity', difficulty: 'SILVER', icon: 'fire', points: 25 },
        { id: 'words_100', name: 'Знаток', description: 'Выучить 100 слов', category: 'vocabulary', difficulty: 'GOLD', icon: 'brain', points: 50 },
        { id: 'accuracy_95', name: 'Эксперт', description: 'Достичь точности 95%', category: 'grammar', difficulty: 'GOLD', icon: 'medal', points: 50 },
        { id: 'listening_10', name: 'Внимательный слушатель', description: 'Пройти 10 упражнений на аудирование', category: 'exercises', difficulty: 'SILVER', icon: 'headphones', points: 25 }
    ];
    for (const ach of defaults) {
        await setDoc(doc(db, 'all_achievements', ach.id), ach);
    }
}

// ==================== ЗАГРУЗКА ДОСТИЖЕНИЙ ПОЛЬЗОВАТЕЛЯ ====================
async function loadUserAchievements(uid) {
    if (!uid) return [];
    try {
        const docRef = doc(db, 'achievements', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            userAchievements = docSnap.data().earnedAchievements || [];
        } else {
            userAchievements = [];
            await setDoc(docRef, { userId: uid, earnedAchievements: [], totalPoints: 0, lastAchievementAt: null });
        }
        return userAchievements;
    } catch (error) {
        console.warn('Ошибка загрузки достижений пользователя:', error);
        return [];
    }
}

// ==================== ПРОВЕРКА И ВЫДАЧА ДОСТИЖЕНИЙ ====================
async function checkAndAwardAchievements(userStats, uid) {
    if (!allAchievements.length) await loadAllAchievements();
    if (!userAchievements.length && uid) await loadUserAchievements(uid);
    const earnedIds = userAchievements.map(a => a.id);
    let newlyEarned = [];

    for (const ach of allAchievements) {
        if (earnedIds.includes(ach.id)) continue;
        let conditionMet = false;
        switch (ach.id) {
            case 'first_exercise':
                conditionMet = userStats.totalAttempts >= 1;
                break;
            case 'streak_7':
                conditionMet = userStats.streak >= 7;
                break;
            case 'words_100':
                conditionMet = userStats.wordsLearned >= 100;
                break;
            case 'accuracy_95':
                conditionMet = userStats.accuracy >= 95;
                break;
            case 'listening_10':
                conditionMet = (userStats.exercisesByType?.listening || 0) >= 10;
                break;
            default:
                // можно добавить другие
                break;
        }
        if (conditionMet) {
            const earned = {
                id: ach.id,
                name: ach.name,
                description: ach.description,
                points: ach.points || 10,
                earnedDate: new Date().toISOString()
            };
            userAchievements.push(earned);
            newlyEarned.push(earned);
        }
    }

    if (newlyEarned.length > 0 && uid) {
        const ref = doc(db, 'achievements', uid);
        await updateDoc(ref, {
            earnedAchievements: userAchievements,
            totalPoints: userAchievements.reduce((sum, a) => sum + a.points, 0),
            lastAchievementAt: new Date().toISOString()
        });
        for (const ach of newlyEarned) {
            showAchievementNotification(ach);
        }
        renderAchievements();
    }
    return newlyEarned;
}

function showAchievementNotification(ach) {
    const notif = document.createElement('div');
    notif.className = 'notification achievement-notification';
    notif.style.borderLeft = '4px solid #f59e0b';
    notif.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-trophy" style="color: #f59e0b;"></i>
            <div>
                <div style="font-size:0.8rem;color:#9ca3af;">Новое достижение!</div>
                <strong>${ach.name}</strong>
                <div style="font-size:0.8rem;">${ach.description} (+${ach.points} очков)</div>
            </div>
        </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 500);
    }, 5000);
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    if (!allAchievements.length) {
        container.innerHTML = '<p>Загрузка достижений...</p>';
        return;
    }
    const earnedIds = userAchievements.map(a => a.id);
    let html = '';
    for (const ach of allAchievements) {
        const earned = earnedIds.includes(ach.id);
        html += `
            <div class="achievement ${earned ? 'earned' : ''}" style="display:flex;align-items:center;gap:12px;padding:10px;background:#1f1f1f;border-radius:8px;margin-bottom:8px;border-left:4px solid ${earned ? '#10b981' : '#4b5563'};">
                <div class="achievement-icon"><i class="fas fa-${ach.icon || 'trophy'}"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${ach.name}</div>
                    <div style="font-size:0.8rem;color:#9ca3af;">${ach.description}</div>
                    ${earned ? `<div style="font-size:0.7rem;color:#10b981;">Получено! +${ach.points} очков</div>` : `<div style="font-size:0.7rem;color:#6b7280;">Не получено</div>`}
                </div>
                ${earned ? '<i class="fas fa-check-circle" style="color:#10b981;"></i>' : ''}
            </div>
        `;
    }
    container.innerHTML = html;
}

// ==================== ОБНОВЛЕНИЕ ДАШБОРДА ====================
function updateDashboard() {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
        try { dashboardData = JSON.parse(saved); } catch(e) {}
    }
    document.getElementById('streak-days').innerText = dashboardData.streak || 0;
    document.getElementById('accuracy-percent').innerText = (dashboardData.accuracy || 0) + '%';
    document.getElementById('words-learned').innerText = dashboardData.wordsLearned || 0;
    document.getElementById('current-level').innerText = dashboardData.currentLevel || 'A1';
    const activityList = document.getElementById('activity-list');
    if (activityList) {
        if (dashboardData.activities && dashboardData.activities.length) {
            activityList.innerHTML = dashboardData.activities.map(a => `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-${a.icon || 'check-circle'}"></i></div>
                    <div class="activity-details"><div class="activity-title">${a.title}</div><div class="activity-time">${a.time}</div></div>
                </div>
            `).join('');
        } else {
            activityList.innerHTML = '<p>Пока нет активности</p>';
        }
    }
    // Прогресс по языкам (заглушка)
    const progressItems = document.querySelectorAll('.language-progress-item');
    // можно обновить
    updateWeeklyGoal();
    renderAchievements();
}

// ==================== ЦЕЛЬ НА НЕДЕЛЮ (ДО 30 ДНЕЙ) ====================
function updateWeeklyGoal() {
    const goal = dashboardData.weeklyGoal || { total: 7, current: 0, completed: [] };
    const current = goal.current || 0;
    const total = goal.total || 7;
    const completed = goal.completed || [];

    const goalCurrentEl = document.querySelector('.goal-current');
    const goalTotalEl = document.querySelector('.goal-total');
    if (goalCurrentEl) goalCurrentEl.textContent = current;
    if (goalTotalEl) goalTotalEl.textContent = total;

    const goalVisual = document.querySelector('.goal-visual');
    if (!goalVisual) return;
    goalVisual.innerHTML = '';
    const maxDisplay = Math.min(total, 30);
    for (let i = 0; i < maxDisplay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'goal-day' + (completed[i] ? ' completed' : '');
        if (total > 7) {
            dayDiv.textContent = i + 1;
        } else {
            const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
            dayDiv.textContent = days[i] || (i + 1);
        }
        goalVisual.appendChild(dayDiv);
    }
}

function setWeeklyGoal() {
    const newGoal = prompt('Сколько дней в неделю вы хотите заниматься? (от 1 до 30)', dashboardData.weeklyGoal.total || 7);
    if (newGoal === null) return;
    const goalNum = parseInt(newGoal);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 30) {
        alert('Пожалуйста, введите число от 1 до 30.');
        return;
    }
    dashboardData.weeklyGoal.total = goalNum;
    const currentCompleted = dashboardData.weeklyGoal.completed || [];
    const newCompleted = [];
    for (let i = 0; i < goalNum; i++) {
        newCompleted.push(currentCompleted[i] || false);
    }
    dashboardData.weeklyGoal.completed = newCompleted;
    dashboardData.weeklyGoal.current = newCompleted.filter(Boolean).length;
    saveDashboardData();
    updateDashboard();
    showNotification(`Цель обновлена: ${goalNum} дней в неделю`, 'success');
}

function updateWeeklyGoalProgress() {
    const goal = dashboardData.weeklyGoal;
    if (!goal) return;
    const todayDate = new Date().toDateString();
    if (goal.lastCompletedDate === todayDate) return;
    const completed = goal.completed || [];
    let nextIndex = completed.findIndex(d => d === false);
    if (nextIndex === -1) nextIndex = completed.length;
    if (nextIndex >= goal.total) return;
    completed[nextIndex] = true;
    goal.completed = completed;
    goal.current = completed.filter(Boolean).length;
    goal.lastCompletedDate = todayDate;
    saveDashboardData();
    updateDashboard();
}

// ==================== СОХРАНЕНИЕ И ЗАГРУЗКА ====================
function saveDashboardData() {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

function loadDashboardData() {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
        try { dashboardData = JSON.parse(saved); } catch(e) {}
    }
    // Инициализируем weeklyGoal если нет
    if (!dashboardData.weeklyGoal) {
        dashboardData.weeklyGoal = { total: 7, current: 0, completed: [], lastCompletedDate: '' };
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function initDashboard() {
    loadDashboardData();
    await loadAllAchievements();
    const user = auth.currentUser;
    if (user) {
        await loadUserAchievements(user.uid);
        const data = dashboardData;
        await checkAndAwardAchievements(data, user.uid);
    }
    updateDashboard();
    // Кнопка изменения цели
    const setGoalBtn = document.getElementById('set-goal-btn');
    if (setGoalBtn) setGoalBtn.addEventListener('click', setWeeklyGoal);
}

// Экспорт для использования в других модулях
window.updateDashboard = updateDashboard;
window.checkAndAwardAchievements = checkAndAwardAchievements;
window.initDashboard = initDashboard;
window.updateWeeklyGoalProgress = updateWeeklyGoalProgress;

// Автозапуск при загрузке
document.addEventListener('DOMContentLoaded', initDashboard);