import { auth, db } from './firebase-config.js';
import {
    collection, getDocs, doc, getDoc, updateDoc, deleteDoc,
    query, orderBy, where, setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

let currentAdmin = null;
const adminContent = document.getElementById('admin-content');
const pageTitle = document.getElementById('page-title');
const adminEmailSpan = document.getElementById('admin-email');

const pages = {
    dashboard: renderDashboard,
    users: renderUsersList,
    achievements: renderAchievementsManagement
};

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'index.html'; return; }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        alert('У вас нет прав администратора');
        window.location.href = 'index.html';
        return;
    }
    currentAdmin = { uid: user.uid, email: user.email, data: userDoc.data() };
    adminEmailSpan.textContent = user.email;
    document.querySelectorAll('.nav-item[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            setActiveNav(page);
            if (pages[page]) pages[page]();
            else renderDashboard();
        });
    });
    document.getElementById('logout-admin').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
    renderDashboard();
});

function setActiveNav(pageId) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
    pageTitle.innerText =
        pageId === 'dashboard' ? 'Панель управления' :
            pageId === 'users' ? 'Пользователи' : 'Управление достижениями';
}

async function renderDashboard() {
    adminContent.innerHTML = '<div class="loading">Загрузка статистики...</div>';
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalUsers = allUsers.length;
    const bannedUsers = allUsers.filter(u => u.banned === true).length;
    const activeToday = allUsers.filter(u => {
        const lastActive = u.stats?.lastActive;
        if (!lastActive) return false;
        const lastDate = new Date(lastActive).toDateString();
        const today = new Date().toDateString();
        return lastDate === today;
    }).length;
    const progressSnapshot = await getDocs(collection(db, 'userProgress'));
    let totalExercises = 0;
    progressSnapshot.forEach(doc => {
        const data = doc.data();
        const exercises = data.exercises || {};
        for (let type in exercises) {
            totalExercises += exercises[type]?.completed || 0;
        }
    });
    adminContent.innerHTML = `
        <div class="stats-cards">
            <div class="stat-card"><div class="stat-card-icon"><i class="fas fa-users"></i></div><div class="stat-card-info"><h3>Всего пользователей</h3><div class="stat-card-number">${totalUsers}</div></div></div>
            <div class="stat-card"><div class="stat-card-icon"><i class="fas fa-ban"></i></div><div class="stat-card-info"><h3>Заблокировано</h3><div class="stat-card-number">${bannedUsers}</div></div></div>
            <div class="stat-card"><div class="stat-card-icon"><i class="fas fa-calendar-day"></i></div><div class="stat-card-info"><h3>Активны сегодня</h3><div class="stat-card-number">${activeToday}</div></div></div>
            <div class="stat-card"><div class="stat-card-icon"><i class="fas fa-tasks"></i></div><div class="stat-card-info"><h3>Выполнено упражнений</h3><div class="stat-card-number">${totalExercises}</div></div></div>
        </div>
        <div style="background: #1a1a1a; border-radius: 16px; padding: 20px; border: 1px solid #2c2c2c;"><h3>Последние действия</h3><p>Здесь можно добавить графики или логи активности.</p></div>
    `;
}

async function renderUsersList() {
    adminContent.innerHTML = '<div class="loading">Загрузка списка пользователей...</div>';
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    users.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    let html = `<div class="users-table-container"><table class="users-table"><thead><tr><th>Имя</th><th>Email</th><th>Язык</th><th>Уровень</th><th>Статус</th><th>Действия</th></tr></thead><tbody>`;
    for (const user of users) {
        const bannedBadge = user.banned ? '<span class="badge-banned">Заблокирован</span>' : 'Активен';
        html += `<tr>
            <td>${user.name || '—'}</td>
            <td>${user.email}</td>
            <td>${user.selectedLanguage === 'spanish' ? 'Испанский' : 'Английский'}</td>
            <td>${user.stats?.currentLevel || 'A1'}</td>
            <td>${bannedBadge}</td>
            <td class="user-actions">
                <button class="btn-view" data-uid="${user.id}">👁️ Просмотр</button>
                ${user.banned ? `<button class="btn-unban" data-uid="${user.id}">🔓 Разблокировать</button>` : `<button class="btn-ban" data-uid="${user.id}">🔒 Заблокировать</button>`}
                <button class="btn-delete" data-uid="${user.id}" data-email="${user.email}">🗑️ Удалить</button>
            </td>
        </tr>`;
    }
    html += `</tbody></table></div>`;
    adminContent.innerHTML = html;
    document.querySelectorAll('.btn-view').forEach(btn => btn.addEventListener('click', () => showUserDetails(btn.dataset.uid)));
    document.querySelectorAll('.btn-ban').forEach(btn => btn.addEventListener('click', () => toggleBan(btn.dataset.uid, true)));
    document.querySelectorAll('.btn-unban').forEach(btn => btn.addEventListener('click', () => toggleBan(btn.dataset.uid, false)));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', async (e) => {
        const uid = btn.dataset.uid;
        const email = btn.dataset.email;
        if (confirm(`Вы уверены, что хотите навсегда удалить пользователя ${email}? Это действие необратимо.`)) {
            await deleteUser(uid);
        }
    }));
}

async function showUserDetails(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    const progressDoc = await getDoc(doc(db, 'userProgress', uid));
    const achievementsDoc = await getDoc(doc(db, 'achievements', uid));
    const user = userDoc.data();
    const progress = progressDoc.exists() ? progressDoc.data() : { exercises: {}, activities: [] };
    const achievements = achievementsDoc.exists() ? achievementsDoc.data() : { earnedAchievements: [], totalPoints: 0 };
    const modal = document.getElementById('userModal');
    const modalBody = document.getElementById('userModalBody');
    modalBody.innerHTML = `
        <h3>Основная информация</h3>
        <p><strong>Имя:</strong> ${user.name || '—'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Язык:</strong> ${user.selectedLanguage === 'spanish' ? 'Испанский' : 'Английский'}</p>
        <p><strong>Дата регистрации:</strong> ${new Date(user.registeredAt).toLocaleDateString()}</p>
        <p><strong>Статус:</strong> ${user.banned ? 'Заблокирован' : 'Активен'}</p>
        <p><strong>Роль:</strong> ${user.role || 'user'}</p>
        <hr>
        <h3>Статистика обучения</h3>
        <p><strong>Дней подряд:</strong> ${user.stats?.streakDays || 0}</p>
        <p><strong>Точность:</strong> ${user.stats?.accuracy || 0}%</p>
        <p><strong>Выучено слов:</strong> ${user.stats?.wordsLearned || 0}</p>
        <p><strong>Текущий уровень:</strong> ${user.stats?.currentLevel || 'A1'}</p>
        <p><strong>Всего очков (достижения):</strong> ${achievements.totalPoints || 0}</p>
        <hr>
        <h3>Прогресс по упражнениям</h3>
        <ul>
            <li>Множественный выбор: ${progress.exercises?.multipleChoice?.completed || 0} (правильно: ${progress.exercises?.multipleChoice?.correct || 0})</li>
            <li>Заполнение пропусков: ${progress.exercises?.fillBlanks?.completed || 0} (правильно: ${progress.exercises?.fillBlanks?.correct || 0})</li>
            <li>Сопоставление: ${progress.exercises?.matching?.completed || 0} (правильно: ${progress.exercises?.matching?.correct || 0})</li>
            <li>Аудирование: ${progress.exercises?.listening?.completed || 0} (правильно: ${progress.exercises?.listening?.correct || 0})</li>
        </ul>
        <hr>
        <h3>Полученные достижения (${achievements.earnedAchievements?.length || 0})</h3>
        <div>${achievements.earnedAchievements?.map(ach => `<span>🏆 ${ach.name}</span>`).join(', ') || 'Нет достижений'}</div>
    `;
    modal.style.display = 'flex';
    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

async function toggleBan(uid, ban) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { banned: ban });
    renderUsersList();
}

async function deleteUser(uid) {
    try {
        // Удаляем документы пользователя из Firestore
        await deleteDoc(doc(db, 'users', uid));
        await deleteDoc(doc(db, 'userProgress', uid));
        await deleteDoc(doc(db, 'achievements', uid));
        showNotification('Пользователь удалён из базы данных', 'success');
        renderUsersList();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления: ' + error.message);
    }
}

async function renderAchievementsManagement() {
    adminContent.innerHTML = '<div class="loading">Загрузка списка достижений...</div>';
    let allAchievements = [];
    const achSnapshot = await getDocs(collection(db, 'all_achievements'));
    if (achSnapshot.empty) {
        await seedDefaultAchievements();
        return renderAchievementsManagement();
    }
    allAchievements = achSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let html = `<div style="margin-bottom: 20px;"><button id="addAchievementBtn" class="btn btn-primary"><i class="fas fa-plus"></i> Добавить достижение</button></div><div class="achievements-admin-list">`;
    for (const ach of allAchievements) {
        html += `<div class="achievement-item" data-id="${ach.id}">
            <div class="achievement-info"><h4><i class="fas fa-${ach.icon || 'trophy'}"></i> ${ach.name}</h4><p>${ach.description}</p><small>Категория: ${ach.category}, сложность: ${ach.difficulty}, очки: ${ach.points || 0}</small></div>
            <div class="achievement-actions"><button class="btn-edit-ach btn-outline" data-id="${ach.id}">✏️</button><button class="btn-delete-ach btn-outline" data-id="${ach.id}">🗑️</button></div>
        </div>`;
    }
    html += `</div>`;
    adminContent.innerHTML = html;
    document.getElementById('addAchievementBtn').addEventListener('click', () => showAchievementModal());
    document.querySelectorAll('.btn-edit-ach').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const ach = allAchievements.find(a => a.id === id);
        if (ach) showAchievementModal(ach);
    }));
    document.querySelectorAll('.btn-delete-ach').forEach(btn => btn.addEventListener('click', async () => {
        if (confirm('Удалить достижение?')) {
            await deleteDoc(doc(db, 'all_achievements', btn.dataset.id));
            renderAchievementsManagement();
        }
    }));
}

async function seedDefaultAchievements() {
    const defaultAchievements = [
        { id: 'first_lesson', name: 'Первый шаг', description: 'Завершить первый урок', category: 'beginner', difficulty: 'BRONZE', icon: 'seedling', points: 10 },
        { id: 'streak_7', name: 'Усердный ученик', description: 'Заниматься 7 дней подряд', category: 'regularity', difficulty: 'SILVER', icon: 'fire', points: 25 },
        { id: 'words_100', name: 'Знаток', description: 'Выучить 100 слов', category: 'vocabulary', difficulty: 'GOLD', icon: 'brain', points: 50 }
    ];
    for (const ach of defaultAchievements) {
        await setDoc(doc(db, 'all_achievements', ach.id), ach);
    }
}

function showAchievementModal(achievement = null) {
    const isEdit = !!achievement;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header"><h2>${isEdit ? 'Редактировать достижение' : 'Новое достижение'}</h2><span class="close-modal">&times;</span></div>
            <div class="modal-body">
                <form id="achForm">
                    <div class="form-group"><label>ID (уникальный)</label><input type="text" id="achId" required ${isEdit ? 'readonly' : ''} value="${isEdit ? achievement.id : ''}"></div>
                    <div class="form-group"><label>Название</label><input type="text" id="achName" required value="${isEdit ? achievement.name : ''}"></div>
                    <div class="form-group"><label>Описание</label><textarea id="achDesc" required>${isEdit ? achievement.description : ''}</textarea></div>
                    <div class="form-group"><label>Категория</label><input type="text" id="achCategory" value="${isEdit ? achievement.category : ''}"></div>
                    <div class="form-group"><label>Сложность (BRONZE/SILVER/GOLD)</label><input type="text" id="achDifficulty" value="${isEdit ? achievement.difficulty : 'BRONZE'}"></div>
                    <div class="form-group"><label>Иконка (FontAwesome)</label><input type="text" id="achIcon" value="${isEdit ? achievement.icon : 'trophy'}"></div>
                    <div class="form-group"><label>Очки</label><input type="number" id="achPoints" value="${isEdit ? achievement.points : 10}"></div>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const closeModal = () => modal.remove();
    modal.querySelector('.close-modal').onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.getElementById('achForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('achId').value,
            name: document.getElementById('achName').value,
            description: document.getElementById('achDesc').value,
            category: document.getElementById('achCategory').value,
            difficulty: document.getElementById('achDifficulty').value,
            icon: document.getElementById('achIcon').value,
            points: parseInt(document.getElementById('achPoints').value)
        };
        await setDoc(doc(db, 'all_achievements', data.id), data);
        closeModal();
        renderAchievementsManagement();
    });
}

function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<div class="notification-content"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 500); }, 3000);
}