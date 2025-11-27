// Dashboard JavaScript

// Dashboard data
let dashboardData = {
    streak: 12,
    accuracy: 87,
    wordsLearned: 156,
    currentLevel: 'A2',
    activities: [
        {
            type: 'lesson',
            title: 'Завершен урок "Основные глаголы"',
            time: '2 часа назад',
            icon: 'check-circle'
        },
        {
            type: 'level',
            title: 'Достигнут новый уровень A2',
            time: 'Вчера',
            icon: 'star'
        },
        {
            type: 'words',
            title: 'Изучено 15 новых слов',
            time: '2 дня назад',
            icon: 'book'
        },
        {
            type: 'exercise',
            title: 'Пройдено упражнение "Аудирование"',
            time: '3 дня назад',
            icon: 'headphones'
        },
        {
            type: 'streak',
            title: 'Серия занятий: 7 дней подряд',
            time: '4 дня назад',
            icon: 'fire'
        }
    ],
    languageProgress: [
        { language: 'Английский', progress: 75 },
        { language: 'Испанский', progress: 40 },
        { language: 'Французский', progress: 20 }
    ],
    weeklyGoal: {
        current: 4,
        total: 7,
        days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        completed: [true, true, true, true, false, false, false]
    }
};

// Initialize dashboard
function initDashboard() {
    // Load dashboard data from localStorage
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
        dashboardData = JSON.parse(savedData);
    }
    
    // Update dashboard UI
    updateDashboard();
    
    // Set up event listeners
    setupDashboardEventListeners();
}

function setupDashboardEventListeners() {
    // Set goal button
    const setGoalBtn = document.getElementById('set-goal-btn');
    if (setGoalBtn) {
        setGoalBtn.addEventListener('click', setWeeklyGoal);
    }
}

function updateDashboard() {
    updateStats();
    updateActivities();
    updateLanguageProgress();
    updateWeeklyGoal();
}

function updateStats() {
    document.getElementById('streak-days').textContent = dashboardData.streak;
    document.getElementById('accuracy-percent').textContent = `${dashboardData.accuracy}%`;
    document.getElementById('words-learned').textContent = dashboardData.wordsLearned;
    document.getElementById('current-level').textContent = dashboardData.currentLevel;
}

function updateActivities() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    dashboardData.activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

function updateLanguageProgress() {
    // This would update the language progress chart
    // In a real app, this would be more dynamic
}

function updateWeeklyGoal() {
    // This would update the weekly goal visualization
    // In a real app, this would be more dynamic
}

function setWeeklyGoal() {
    const newGoal = prompt('Сколько дней в неделю вы хотите заниматься? (1-7)', dashboardData.weeklyGoal.total);
    
    if (newGoal && newGoal >= 1 && newGoal <= 7) {
        dashboardData.weeklyGoal.total = parseInt(newGoal);
        
        // Reset completed days based on new goal
        dashboardData.weeklyGoal.completed = Array(7).fill(false);
        for (let i = 0; i < Math.min(dashboardData.weeklyGoal.current, newGoal); i++) {
            dashboardData.weeklyGoal.completed[i] = true;
        }
        
        // Save and update
        saveDashboardData();
        updateDashboard();
        
        app.showNotification(`Цель обновлена: ${newGoal} дней в неделю`, 'success');
    }
}

function saveDashboardData() {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

// Function to update dashboard from exercises
function updateDashboardFromExercise(exerciseType, score) {
    // Update words learned (simulated)
    if (score > 70) {
        dashboardData.wordsLearned += 5;
    }
    
    // Update accuracy
    const totalExercises = Object.values(dashboardData.activities).filter(a => a.type === 'exercise').length + 1;
    dashboardData.accuracy = Math.round((dashboardData.accuracy * (totalExercises - 1) + score) / totalExercises);
    
    // Add new activity
    const exerciseNames = {
        'multipleChoice': 'Множественный выбор',
        'fillBlanks': 'Заполнение пропусков',
        'matching': 'Сопоставление',
        'listening': 'Аудирование'
    };
    
    dashboardData.activities.unshift({
        type: 'exercise',
        title: `Пройдено упражнение "${exerciseNames[exerciseType]}"`,
        time: 'Только что',
        icon: 'check-circle'
    });
    
    // Keep only last 5 activities
    if (dashboardData.activities.length > 5) {
        dashboardData.activities = dashboardData.activities.slice(0, 5);
    }
    
    // Save and update
    saveDashboardData();
    updateDashboard();
}

// Make functions available globally
window.initDashboard = initDashboard;
window.updateDashboard = updateDashboard;
window.updateDashboardFromExercise = updateDashboardFromExercise;