// ==================== ИМПОРТЫ ====================
import { auth, db } from './firebase-config.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ==================== ДАННЫЕ УПРАЖНЕНИЙ ====================
const exercisesData = {
    english: {
        multipleChoice: [
            { question: 'Как переводится слово "dog"?', options: ['кошка', 'собака', 'птица', 'рыба'], correct: 1 },
            { question: 'Как переводится слово "cat"?', options: ['собака', 'мышь', 'кошка', 'кролик'], correct: 2 },
            { question: 'Как переводится слово "house"?', options: ['дом', 'квартира', 'здание', 'дача'], correct: 0 },
            { question: 'Как переводится слово "door"?', options: ['окно', 'стена', 'дверь', 'пол'], correct: 2 },
            { question: 'Как переводится слово "book"?', options: ['ручка', 'тетрадь', 'книга', 'журнал'], correct: 2 },
            { question: 'Как переводится слово "mother"?', options: ['отец', 'сестра', 'мать', 'бабушка'], correct: 2 },
            { question: 'Как переводится слово "red"?', options: ['синий', 'зелёный', 'красный', 'жёлтый'], correct: 2 },
            { question: 'Как переводится слово "to go"?', options: ['идти', 'бежать', 'ехать', 'лететь'], correct: 0 },
            { question: 'Как переводится слово "big"?', options: ['маленький', 'большой', 'высокий', 'низкий'], correct: 1 }
        ],
        fillBlanks: [
            { question: 'Fill in the blank: "The cat is ___ the table." (preposition "on")', answer: 'on' },
            { question: 'Fill in the blank: "I ___ to school every day." (verb "go")', answer: 'go' },
            { question: 'Fill in the blank: "She ___ a book yesterday." (past of "read")', answer: 'read' },
            { question: 'Fill in the blank: "We ___ watching TV now." (verb "are")', answer: 'are' },
            { question: 'Fill in the blank: "My sister ___ very smart." (verb "is")', answer: 'is' },
            { question: 'Fill in the blank: "I ___ a doctor." (verb "am")', answer: 'am' }
        ],
        matching: [
            { pairs: [{ word: 'apple', translation: 'яблоко' }, { word: 'cat', translation: 'кошка' }, { word: 'dog', translation: 'собака' }, { word: 'house', translation: 'дом' }, { word: 'blue', translation: 'синий' }] },
            { pairs: [{ word: 'car', translation: 'машина' }, { word: 'book', translation: 'книга' }, { word: 'water', translation: 'вода' }, { word: 'happy', translation: 'счастливый' }, { word: 'red', translation: 'красный' }] }
        ],
        listening: [
            { question: 'Что вы услышали?', audioText: 'I have a cat', options: [{ text: 'У меня есть собака', correct: false }, { text: 'У меня есть кошка', correct: true }, { text: 'У меня есть дом', correct: false }, { text: 'У меня есть машина', correct: false }] },
            { question: 'Что вы услышали?', audioText: 'She is reading a book', options: [{ text: 'Он читает книгу', correct: false }, { text: 'Она читает книгу', correct: true }, { text: 'Она пишет книгу', correct: false }, { text: 'Она покупает книгу', correct: false }] },
            { question: 'Что вы услышали?', audioText: 'We are going to the park', options: [{ text: 'Мы идём в магазин', correct: false }, { text: 'Мы идём в парк', correct: true }, { text: 'Они идут в парк', correct: false }, { text: 'Мы ходили в парк', correct: false }] }
        ]
    },
    spanish: {
        multipleChoice: [
            { question: 'Как переводится слово "perro"?', options: ['кошка', 'собака', 'птица', 'рыба'], correct: 1 },
            { question: 'Как переводится слово "gato"?', options: ['собака', 'мышь', 'кошка', 'кролик'], correct: 2 },
            { question: 'Как переводится слово "casa"?', options: ['дом', 'квартира', 'здание', 'дача'], correct: 0 },
            { question: 'Как переводится слово "puerta"?', options: ['окно', 'стена', 'дверь', 'пол'], correct: 2 },
            { question: 'Как переводится слово "libro"?', options: ['ручка', 'тетрадь', 'книга', 'журнал'], correct: 2 },
            { question: 'Как переводится слово "madre"?', options: ['отец', 'сестра', 'мать', 'бабушка'], correct: 2 },
            { question: 'Как переводится слово "rojo"?', options: ['синий', 'зелёный', 'красный', 'жёлтый'], correct: 2 },
            { question: 'Как переводится слово "ir"?', options: ['идти', 'бежать', 'ехать', 'лететь'], correct: 0 },
            { question: 'Как переводится слово "grande"?', options: ['маленький', 'большой', 'высокий', 'низкий'], correct: 1 }
        ],
        fillBlanks: [
            { question: 'Заполните пропуск: "El gato está ___ la mesa." (предлог "на")', answer: 'sobre' },
            { question: 'Заполните пропуск: "Yo ___ a la escuela todos los días." (глагол "идти")', answer: 'voy' },
            { question: 'Заполните пропуск: "Ella ___ un libro ayer." (прош.вр. "читать")', answer: 'leyó' },
            { question: 'Заполните пропуск: "Nosotros ___ viendo la televisión ahora." (глагол "быть")', answer: 'estamos' },
            { question: 'Заполните пропуск: "Mi hermana ___ muy inteligente." (глагол "быть" 3 л.)', answer: 'es' },
            { question: 'Заполните пропуск: "Yo ___ médico." (глагол "быть" 1 л.)', answer: 'soy' }
        ],
        matching: [
            { pairs: [{ word: 'manzana', translation: 'яблоко' }, { word: 'gato', translation: 'кошка' }, { word: 'perro', translation: 'собака' }, { word: 'casa', translation: 'дом' }, { word: 'azul', translation: 'синий' }] },
            { pairs: [{ word: 'coche', translation: 'машина' }, { word: 'libro', translation: 'книга' }, { word: 'agua', translation: 'вода' }, { word: 'feliz', translation: 'счастливый' }, { word: 'rojo', translation: 'красный' }] }
        ],
        listening: [
            { question: 'Что вы услышали?', audioText: 'Tengo un gato', options: [{ text: 'У меня есть собака', correct: false }, { text: 'У меня есть кошка', correct: true }, { text: 'У меня есть дом', correct: false }, { text: 'У меня есть машина', correct: false }] },
            { question: 'Что вы услышали?', audioText: 'Ella está leyendo un libro', options: [{ text: 'Он читает книгу', correct: false }, { text: 'Она читает книгу', correct: true }, { text: 'Она пишет книгу', correct: false }, { text: 'Она покупает книгу', correct: false }] },
            { question: 'Что вы услышали?', audioText: 'Vamos al parque', options: [{ text: 'Мы идём в магазин', correct: false }, { text: 'Мы идём в парк', correct: true }, { text: 'Они идут в парк', correct: false }, { text: 'Мы ходили в парк', correct: false }] }
        ]
    }
};

// ==================== ТЕКУЩИЙ ЯЗЫК ====================
let currentLanguage = 'english';

function loadSelectedLanguage() {
    const saved = localStorage.getItem('selectedLanguage');
    if (saved && exercisesData[saved]) currentLanguage = saved;
    else currentLanguage = 'english';
    return currentLanguage;
}
function saveSelectedLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    currentLanguage = lang;
}

window.switchLanguage = (lang) => {
    if (exercisesData[lang]) {
        saveSelectedLanguage(lang);
        exerciseState.currentExercise = { multipleChoice: 0, fillBlanks: 0, matching: 0, listening: 0 };
        exerciseState.scores = { multipleChoice: 0, fillBlanks: 0, matching: 0, listening: 0 };
        exerciseState.answers = { multipleChoice: [], fillBlanks: [], matching: [], listening: [] };
        saveExerciseState();
        loadMultipleChoice();
        loadFillBlanks();
        loadMatching();
        loadListening();
        updateProgressBars();
        if (window.updateDashboard) window.updateDashboard();
    }
};

// ==================== СОСТОЯНИЕ УПРАЖНЕНИЙ ====================
let exerciseState = {
    currentExercise: { multipleChoice: 0, fillBlanks: 0, matching: 0, listening: 0 },
    scores: { multipleChoice: 0, fillBlanks: 0, matching: 0, listening: 0 },
    answers: { multipleChoice: [], fillBlanks: [], matching: [], listening: [] }
};

function loadExerciseState() {
    const saved = localStorage.getItem('exerciseStateNew');
    if (saved) try { Object.assign(exerciseState, JSON.parse(saved)); } catch(e) {}
}
function saveExerciseState() { localStorage.setItem('exerciseStateNew', JSON.stringify(exerciseState)); }

// ==================== ОБЩИЕ ФУНКЦИИ ====================
function updateProgressBars() {
    const types = ['multipleChoice', 'fillBlanks', 'matching', 'listening'];
    types.forEach(t => {
        const total = exercisesData[currentLanguage][t].length;
        const current = exerciseState.currentExercise[t];
        const percent = total ? (current / total) * 100 : 0;
        const elem = document.getElementById(`${t}-progress`);
        if (elem) elem.style.width = `${percent}%`;
    });
}

function switchExerciseTab(tabId) {
    document.querySelectorAll('.exercise-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.exercise-tab[data-tab="${tabId}"]`).classList.add('active');
    document.querySelectorAll('.exercise-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

function completeExercise(exerciseType) {
    const total = exercisesData[currentLanguage][exerciseType].length;
    const correct = exerciseState.scores[exerciseType];
    const score = total ? Math.round((correct / total) * 100) : 0;
    document.getElementById('completion-score').innerText = `${score}%`;
    document.getElementById('completion-time').innerText = '~5 мин';
    document.getElementById('completion-xp').innerText = score * 2;
    document.getElementById('completion-modal').classList.add('active');
    for (let i=0;i<50;i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random()*100+'%';
        c.style.backgroundColor = ['#dc2626','#991b1b','#ef4444','#10b981'][Math.floor(Math.random()*4)];
        c.style.animationDelay = Math.random()*3+'s';
        document.body.appendChild(c);
        setTimeout(()=>c.remove(),5000);
    }
    exerciseState.currentExercise[exerciseType]=0;
    exerciseState.scores[exerciseType]=0;
    exerciseState.answers[exerciseType]=[];
    saveExerciseState();
    updateProgressBars();
}

async function updateUserProgressAfterExercise(exerciseType, isCorrect) {
    let dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || {
        streak: 0, accuracy: 0, wordsLearned: 0, currentLevel: 'A1',
        activities: [], totalAttempts: 0, totalCorrect: 0, lastActiveDate: null,
        exercisesByType: { multipleChoice: 0, fillBlanks: 0, matching: 0, listening: 0 }
    };
    dashboardData.totalAttempts = (dashboardData.totalAttempts || 0) + 1;
    if (isCorrect) dashboardData.totalCorrect = (dashboardData.totalCorrect || 0) + 1;
    dashboardData.accuracy = Math.round((dashboardData.totalCorrect / dashboardData.totalAttempts) * 100);
    if (isCorrect) dashboardData.wordsLearned = (dashboardData.wordsLearned || 0) + 1;
    
    if (!dashboardData.exercisesByType) dashboardData.exercisesByType = {};
    dashboardData.exercisesByType[exerciseType] = (dashboardData.exercisesByType[exerciseType] || 0) + 1;

    const today = new Date().toDateString();
    const last = dashboardData.lastActiveDate;
    if (last === today) { /* ничего */ }
    else if (last === new Date(Date.now()-86400000).toDateString()) dashboardData.streak = (dashboardData.streak||0)+1;
    else dashboardData.streak = 1;
    dashboardData.lastActiveDate = today;
    dashboardData.activities = dashboardData.activities || [];
    dashboardData.activities.unshift({ type: 'exercise', title: `Пройдено упражнение "${exerciseType}"`, time: 'Только что', icon: 'check-circle' });
    dashboardData.activities = dashboardData.activities.slice(0,10);
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));

    if (auth.currentUser) {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                'stats.accuracy': dashboardData.accuracy,
                'stats.wordsLearned': dashboardData.wordsLearned,
                'stats.streakDays': dashboardData.streak,
                'stats.lastActive': new Date().toISOString()
            });
        } catch(e) { console.warn(e); }
    }
    
    // Обновляем дашборд
    if (window.updateDashboard) window.updateDashboard();
    
    // Проверка достижений
    if (window.checkAndAwardAchievements && auth.currentUser) {
        try {
            await window.checkAndAwardAchievements(dashboardData, auth.currentUser.uid);
        } catch(e) {
            console.warn('Ошибка проверки достижений:', e);
        }
    }
    
    // Обновляем цель на неделю
    if (window.updateWeeklyGoalProgress) {
        try {
            window.updateWeeklyGoalProgress();
        } catch(e) {
            console.warn('Ошибка обновления цели:', e);
        }
    }
}

// ==================== МНОЖЕСТВЕННЫЙ ВЫБОР ====================
function loadMultipleChoice() {
    const idx = exerciseState.currentExercise.multipleChoice;
    const data = exercisesData[currentLanguage].multipleChoice;
    if (idx >= data.length) { completeExercise('multipleChoice'); return; }
    const q = data[idx];
    document.getElementById('multiple-choice-question').innerText = q.question;
    const container = document.getElementById('multiple-choice-options');
    container.innerHTML = '';
    q.options.forEach((opt,i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<input type="radio" name="mc" value="${i}"><label>${opt}</label>`;
        container.appendChild(div);
    });
    document.getElementById('current-question').innerText = idx+1;
    document.getElementById('total-questions').innerText = data.length;
    document.getElementById('multiple-choice-feedback').className = 'exercise-feedback';
    document.getElementById('check-answer').disabled = true;
    document.querySelectorAll('#multiple-choice-options .option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('#multiple-choice-options .option').forEach(o=>o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('check-answer').disabled = false;
        });
    });
}

function checkMultipleChoice() {
    const idx = exerciseState.currentExercise.multipleChoice;
    const q = exercisesData[currentLanguage].multipleChoice[idx];
    const selected = document.querySelector('#multiple-choice-options .option.selected input');
    if (!selected) { alert('Выберите вариант'); return; }
    const isCorrect = (parseInt(selected.value) === q.correct);
    const feedback = document.getElementById('multiple-choice-feedback');
    if (isCorrect) { feedback.innerText='✅ Правильно!'; feedback.className='exercise-feedback correct'; exerciseState.scores.multipleChoice++; }
    else { feedback.innerText=`❌ Неправильно. Правильный ответ: ${q.options[q.correct]}`; feedback.className='exercise-feedback incorrect'; }
    exerciseState.answers.multipleChoice[idx] = { selected: parseInt(selected.value), correct: isCorrect };
    saveExerciseState();
    document.getElementById('check-answer').disabled = true;
    updateUserProgressAfterExercise('multipleChoice', isCorrect);
}

function nextMultipleChoice() {
    exerciseState.currentExercise.multipleChoice++;
    saveExerciseState();
    loadMultipleChoice();
    updateProgressBars();
}

// ==================== ЗАПОЛНЕНИЕ ПРОПУСКОВ ====================
function loadFillBlanks() {
    const idx = exerciseState.currentExercise.fillBlanks;
    const data = exercisesData[currentLanguage].fillBlanks;
    if (idx >= data.length) { completeExercise('fillBlanks'); return; }
    const q = data[idx];
    document.getElementById('fill-blanks-question').innerText = q.question;
    document.getElementById('blank-input').value = '';
    document.getElementById('blank-input').classList.remove('correct','incorrect');
    document.getElementById('fill-blanks-feedback').className = 'exercise-feedback';
    document.getElementById('current-blank').innerText = idx+1;
    document.getElementById('total-blanks').innerText = data.length;
}

function checkFillBlanks() {
    const idx = exerciseState.currentExercise.fillBlanks;
    const q = exercisesData[currentLanguage].fillBlanks[idx];
    const userAnswer = document.getElementById('blank-input').value.trim().toLowerCase();
    if (!userAnswer) { alert('Введите ответ'); return; }
    const isCorrect = (userAnswer === q.answer);
    const feedback = document.getElementById('fill-blanks-feedback');
    if (isCorrect) { feedback.innerText='✅ Правильно!'; feedback.className='exercise-feedback correct'; document.getElementById('blank-input').classList.add('correct'); exerciseState.scores.fillBlanks++; }
    else { feedback.innerText=`❌ Неправильно. Правильный ответ: ${q.answer}`; feedback.className='exercise-feedback incorrect'; document.getElementById('blank-input').classList.add('incorrect'); }
    exerciseState.answers.fillBlanks[idx] = { answer: userAnswer, correct: isCorrect };
    saveExerciseState();
    updateUserProgressAfterExercise('fillBlanks', isCorrect);
}

function nextFillBlanks() {
    exerciseState.currentExercise.fillBlanks++;
    saveExerciseState();
    loadFillBlanks();
    updateProgressBars();
}

// ==================== СОПОСТАВЛЕНИЕ ====================
function loadMatching() {
    const idx = exerciseState.currentExercise.matching;
    const data = exercisesData[currentLanguage].matching;
    if (idx >= data.length) { completeExercise('matching'); return; }
    const pairs = data[idx].pairs;
    const container = document.getElementById('matching-pairs');
    container.innerHTML = '';
    pairs.forEach((pair) => {
        const allTranslations = pairs.map(p=>p.translation);
        const shuffled = [...allTranslations];
        for (let i=shuffled.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
        const div = document.createElement('div');
        div.className = 'matching-pair';
        div.innerHTML = `<div class="matching-word">${pair.word}</div><div class="matching-connector">→</div><div class="matching-translation"><select class="matching-select" data-correct="${pair.translation}"><option value="">Выберите перевод</option>${shuffled.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>`;
        container.appendChild(div);
    });
    document.getElementById('current-matching').innerText = idx+1;
    document.getElementById('total-matchings').innerText = data.length;
    document.getElementById('matching-feedback').className = 'exercise-feedback';
}

function checkMatching() {
    const idx = exerciseState.currentExercise.matching;
    const data = exercisesData[currentLanguage].matching;
    const pairs = data[idx].pairs;
    const selects = document.querySelectorAll('#matching-pairs .matching-select');
    let allCorrect = true;
    let answers = [];
    selects.forEach((sel, i) => {
        const val = sel.value;
        const correct = sel.dataset.correct;
        answers.push(val);
        if (!val || val !== correct) allCorrect = false;
        if (val === correct) { sel.classList.add('correct'); sel.classList.remove('incorrect'); }
        else if (val !== '') { sel.classList.add('incorrect'); sel.classList.remove('correct'); }
        else { sel.classList.remove('correct','incorrect'); }
    });
    const feedback = document.getElementById('matching-feedback');
    if (allCorrect && answers.every(a=>a)) {
        feedback.innerText='✅ Отлично! Все пары верны.';
        feedback.className='exercise-feedback correct';
        exerciseState.scores.matching++;
        updateUserProgressAfterExercise('matching', true);
    } else {
        feedback.innerText='❌ Есть ошибки или не все поля заполнены.';
        feedback.className='exercise-feedback incorrect';
        updateUserProgressAfterExercise('matching', false);
    }
    exerciseState.answers.matching[idx] = { answers, correct: allCorrect && answers.every(a=>a) };
    saveExerciseState();
}

function nextMatching() {
    exerciseState.currentExercise.matching++;
    saveExerciseState();
    loadMatching();
    updateProgressBars();
}

// ==================== АУДИРОВАНИЕ ====================
function loadListening() {
    const idx = exerciseState.currentExercise.listening;
    const data = exercisesData[currentLanguage].listening;
    if (idx >= data.length) { completeExercise('listening'); return; }
    const q = data[idx];
    document.getElementById('listening-question').innerText = q.question;
    const container = document.getElementById('listening-options');
    container.innerHTML = '';
    q.options.forEach((opt,i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<input type="radio" name="listening" value="${i}"><label>${opt.text}</label>`;
        container.appendChild(div);
    });
    document.getElementById('current-listening').innerText = idx+1;
    document.getElementById('total-listenings').innerText = data.length;
    document.getElementById('listening-feedback').className = 'exercise-feedback';
    document.getElementById('check-listening').disabled = true;
    const ap = document.querySelector('.audio-player');
    if (ap) ap.classList.remove('playing');
    const playBtn = document.getElementById('play-audio');
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i><span>Воспроизвести</span>';
    document.querySelectorAll('#listening-options .option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('#listening-options .option').forEach(o=>o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('check-listening').disabled = false;
        });
    });
}

function playAudioEffect() {
    const idx = exerciseState.currentExercise.listening;
    const data = exercisesData[currentLanguage].listening;
    if (idx >= data.length) return;
    const text = data[idx].audioText;
    const ap = document.querySelector('.audio-player');
    const playBtn = document.getElementById('play-audio');
    if (ap.classList.contains('playing')) {
        ap.classList.remove('playing');
        playBtn.innerHTML = '<i class="fas fa-play"></i><span>Воспроизвести</span>';
        speechSynthesis.cancel();
    } else {
        ap.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-pause"></i><span>Пауза</span>';
        const u = new SpeechSynthesisUtterance(text);
        u.lang = currentLanguage === 'spanish' ? 'es-ES' : 'en-US';
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
        u.onend = () => { ap.classList.remove('playing'); playBtn.innerHTML = '<i class="fas fa-play"></i><span>Воспроизвести</span>'; };
    }
}

function checkListening() {
    const idx = exerciseState.currentExercise.listening;
    const q = exercisesData[currentLanguage].listening[idx];
    const selected = document.querySelector('#listening-options .option.selected input');
    if (!selected) { alert('Выберите вариант'); return; }
    const isCorrect = q.options[parseInt(selected.value)].correct;
    const feedback = document.getElementById('listening-feedback');
    if (isCorrect) { feedback.innerText='✅ Правильно!'; feedback.className='exercise-feedback correct'; exerciseState.scores.listening++; }
    else { const ct = q.options.find(o=>o.correct).text; feedback.innerText=`❌ Неправильно. Правильный ответ: ${ct}`; feedback.className='exercise-feedback incorrect'; }
    exerciseState.answers.listening[idx] = { selected: parseInt(selected.value), correct: isCorrect };
    saveExerciseState();
    document.getElementById('check-listening').disabled = true;
    updateUserProgressAfterExercise('listening', isCorrect);
}

function nextListening() {
    exerciseState.currentExercise.listening++;
    saveExerciseState();
    loadListening();
    updateProgressBars();
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initExercises() {
    loadSelectedLanguage();
    loadExerciseState();
    document.querySelectorAll('.exercise-tab').forEach(tab => tab.addEventListener('click', () => switchExerciseTab(tab.dataset.tab)));
    document.getElementById('check-answer').addEventListener('click', checkMultipleChoice);
    document.getElementById('next-question').addEventListener('click', nextMultipleChoice);
    document.getElementById('check-blank').addEventListener('click', checkFillBlanks);
    document.getElementById('next-blank').addEventListener('click', nextFillBlanks);
    document.getElementById('check-matching').addEventListener('click', checkMatching);
    document.getElementById('next-matching').addEventListener('click', nextMatching);
    document.getElementById('check-listening').addEventListener('click', checkListening);
    document.getElementById('next-listening').addEventListener('click', nextListening);
    document.getElementById('play-audio').addEventListener('click', playAudioEffect);
    document.getElementById('review-answers').addEventListener('click', () => document.getElementById('completion-modal').classList.remove('active'));
    document.getElementById('next-exercise').addEventListener('click', () => {
        document.getElementById('completion-modal').classList.remove('active');
        const active = document.querySelector('.exercise-tab.active').dataset.tab;
        if (active === 'multiple-choice') loadMultipleChoice();
        else if (active === 'fill-blanks') loadFillBlanks();
        else if (active === 'matching') loadMatching();
        else if (active === 'listening') loadListening();
    });
    loadMultipleChoice();
    loadFillBlanks();
    loadMatching();
    loadListening();
    updateProgressBars();
    if (window.updateDashboard) window.updateDashboard();
}

window.initExercises = initExercises;
window.getCurrentLanguage = () => currentLanguage;